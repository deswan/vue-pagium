const esformatter = require('esformatter');
const path = require('path');
const fs = require('fs-extra');
const beautify_html = require('js-beautify').html;

const crypto = require('crypto');
const hash = crypto.createHash('sha256');

const utils = require('../utils/utils')
const helpers = require('./helper')
const babylon = require('babylon');
const vueCompiler = require('@vue/component-compiler-utils');
const babel_generator = require('babel-generator').default;

const CHILDREN_PLACEHOLDER = '_____pg_chilren_____';
const SLOT_PLACEHOLDER = '_____pg_slot______';

const pgHashPrefix = 'pg______';
const pgColonHashPrefix = '__pg_colon__';

const wordRegExp = /^[$a-zA-Z][$\w]*$/

const modifiers = ['wrapper', 'last'];

const HOOKS_NAME = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed'];

let logger = require('../logger')('compile')

const template = require('./art');

let pg_map = {
    components: [],
    renameMap: {},
    vueTemplate: null
}

//全局替换标识符 @@varName -> varName
function replaceIdentifier() {
    let regExp = /@@([$a-zA-Z][$\w]*)?(:[$a-zA-Z][$\w]*)?/g;
    let referRegExp = /@@([$a-zA-Z][$\w]*)__pg_refer__([$a-zA-Z][$\w]*)?(:[$a-zA-Z][$\w]*)?/g;

    let filterStyle = (function () {
        let existCom = [];
        return (pg_com) => {
            let type = pg_com.comObj.type;
            if (existCom.includes(type)) {
                pg_com.ignoreStyle = true;
            } else {
                existCom.push(type);
            }
        }
    })();

    //init pg_com.wrapper for each one
    function calcWrapper(list, wrapper = '') {
        if (!list || !list.length) return;
        list.forEach((pg_com) => {
            let curWrapper = wrapper;
            if (pg_com.setDataWrapper) {
                curWrapper = curWrapper + pg_com.comObj.name + '.';
            }
            pg_com.wrapper = curWrapper
            filterStyle(pg_com);
            calcWrapper(pg_com.children, curWrapper)
        })
    }

    calcWrapper(pg_map.components);


    utils.traverse(pg_com => {
        let referReplaced = pg_com.compiled.replace(referRegExp, (match, comName, varName, modifier) => {
            let referCom = utils.getComponentByName(pg_map.components, comName)
            if (!referCom) {
                throw new Error(match + `\n${pg_com.name} 引用的 ${comName} 组件不存在`)
            }
            modifier && (modifier = modifier.slice(1))

            return resolveMatch(referCom, varName, modifier)
        })

        let replaced = referReplaced.replace(regExp, (match, varName, modifier) => {

            modifier && (modifier = modifier.slice(1))

            return resolveMatch(pg_com, varName, modifier)
        })
        pg_com.replaced = replaced;
    }, pg_map.components)

    function resolveMatch(pg_com, varName, modifier) {
        let renamedVarName = varName;

        //匹配
        let isData = pg_com.initDataKeys.includes(varName)
        let isMethod = pg_com.initMethodsKeys.includes(varName);
        let isComputed = pg_com.initComputedKeys.includes(varName);

        if (varName) {
            isComputed && pg_map.renameMap.computed && (renamedVarName = getRenamed(pg_map.renameMap.computed, varName, pg_com))
            isMethod && pg_map.renameMap.methods && (renamedVarName = getRenamed(pg_map.renameMap.methods, varName, pg_com))
            isData && pg_map.renameMap.data && (renamedVarName = getRenamed(pg_map.renameMap.data, varName, pg_com))
        }

        function getRenamed(renameMap, varName, comObj) {
            let idx = renameMap.findIndex(toRename => {
                return toRename.node === comObj && toRename.raw === varName
            })
            if (~idx) {
                return renameMap[idx].value
            }
            return varName;
        }

        if (modifier) {
            if (modifier === 'wrapper') {
                if(pg_com.wrapper){
                    return pg_com.wrapper.slice(0,-1)
                }else{
                    throw new Error(`组件${pg_com.name}的包裹对象不存在，因该组件及其子组件没有任何data属性`)
                }
            } else if (modifier === 'last') {
                if (!varName) throw new Error(`组件${pg_com.name}:请指定vue选项数据名称`)
                if (!isData && !isMethod && !isComputed) throw new Error(match + `\nvue选项数据${varName}不存在`)
                return renamedVarName;
            } else {
                throw new Error(`组件${pg_com.name}:修饰符 ${modifier} 不存在`)
            }
        } else {
            if (!varName) throw new Error(`组件${pg_com.name}:请指定vue选项数据名称`)
            if (isData) { //data
                return pg_com.wrapper + renamedVarName;
            } else if (isComputed || isMethod) {
                return renamedVarName;
            } else {
                throw new Error(`${pg_com.name}组件的变量${varName}不存在`)
            }
        }
    }

    if (pg_map.vueTemplate) {
        pg_map.vueTemplate.replaced = pg_map.vueTemplate.compiled.replace(regExp, (match, varName, modifier) => {

            modifier && (modifier = modifier.slice(1))

            let renamedVarName = varName;

            //匹配
            let isData = pg_map.vueTemplate.initDataKeys.includes(varName)
            let isMethod = pg_map.vueTemplate.initMethodsKeys.includes(varName);
            let isComputed = pg_map.vueTemplate.initComputedKeys.includes(varName);

            if (varName) {
                isComputed && pg_map.renameMap.computed && (renamedVarName = getRenamed(pg_map.renameMap.computed, varName, pg_map.vueTemplate))
                isMethod && pg_map.renameMap.methods && (renamedVarName = getRenamed(pg_map.renameMap.methods, varName, pg_map.vueTemplate))
                isData && pg_map.renameMap.data && (renamedVarName = getRenamed(pg_map.renameMap.data, varName, pg_map.vueTemplate))
            }

            function getRenamed(renameMap, varName, comObj) {
                let idx = renameMap.findIndex(toRename => {
                    return toRename.node === comObj && toRename.raw === varName
                })
                if (~idx) {
                    return renameMap[idx].value
                }
                return varName;
            }

            if (modifier) {
                if (modifier === 'wrapper') {
                    throw new Error(match + `\n根组件不允许设置wrapper修饰符`)
                } else if (modifier === 'last') {
                    throw new Error(match + `\n根组件不允许设置last修饰符`)
                } else {
                    throw new Error(match + '\n' + modifier + ' 修饰符不存在')
                }
            } else {
                if (!varName) throw new Error(match + '\n请指定vue选项数据名称')
                if (isData || isComputed || isMethod) { //data
                    return renamedVarName;
                } else {
                    throw new Error(match + `\n根组件的变量${varName}不存在`)
                }
            }
        })

    }

    logger('after replaceIdentifier', pg_map)
}

/**
 * 代码美化
 * @param {String} vue .vue组件文本
 */
function beautify(vue) {
    let vueArr = vue.split('');
    let htmlSFC = getHtml(vue);
    if (htmlSFC) {
        vueArr.splice(htmlSFC.start, htmlSFC.end - htmlSFC.start, '\n',
            ...beautify_html(vue.slice(htmlSFC.start, htmlSFC.end), {
                preserve_newlines: false,
                max_preserve_newlines: 1,
                "unformatted": ["a", "abbr", "area", "audio", "b", "bdi", "bdo", "br", "button", "canvas", "cite", "code", "data", "datalist", "del", "dfn", "em", "embed", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "map", "mark", "math", "meter", "noscript", "object", "output", "progress", "q", "ruby", "s", "samp", "select", "small", "span", "strong", "sub", "sup", "svg", "textarea", "time", "u", "var", "video", "wbr", "text", "acronym", "address", "big", "dt", "ins", "small", "strike", "tt", "pre", "h1", "h2", "h3", "h4", "h5", "h6"],
                "indent_scripts": "keep"
            }), '\n')
    }
    vue = vueArr.join('');
    let scriptSFC = getScript(vue);
    if (scriptSFC) {
        vueArr.splice(scriptSFC.start, scriptSFC.end - scriptSFC.start,
            ...esformatter.format(vue.slice(scriptSFC.start, scriptSFC.end), require('./esformatter-pg.json')))
    }
    return vueArr.join('');
}

function merge() {
    renameData();
    let allKeys = renameMethods();
    renameComputed(allKeys)
    renameVueOptions();
    replaceIdentifier();

    let styleCom = [];

    /**
     * 合并组件
     * @param {} list 
     */
    function doMerge(list) {
        return list.reduce((target, pg_com) => {
            let parsed = parse(pg_com);

            //收集子组件数据
            let children = pg_com.children.filter(e => {
                return !e.comObj.__pg_slot__;
            })

            if (children && children.length) {
                let childParsed = doMerge(children);
                parsed.html = parsed.html.replace(CHILDREN_PLACEHOLDER, childParsed.html);
                parsed.style = mergeStyle(parsed.style, childParsed.style)
                parsed.data = mergeData(parsed.data, childParsed.data)
                parsed.hooks = mergeHook(parsed.hooks, childParsed.hooks)
                parsed.methods = mergeMethod(parsed.methods, childParsed.methods)
                parsed.computed = mergeMethod(parsed.computed, childParsed.computed)
                parsed.watch = mergeMethod(parsed.watch, childParsed.watch)
            }else{
                parsed.html = parsed.html.replace(CHILDREN_PLACEHOLDER, '');
            }

            //收集slot组件数据
            //  { [slotId]:[pg_com1,pg_com2,...] }
            let slots = pg_com.slots || {};
            Object.keys(slots).forEach(slotId => {
                let slotList = slots[slotId];
                let childParsed = doMerge(slotList);
                parsed.html = parsed.html.replace(SLOT_PLACEHOLDER + slotId, childParsed.html);
                parsed.style = mergeStyle(parsed.style, childParsed.style)
                parsed.data = mergeData(parsed.data, childParsed.data)
                parsed.hooks = mergeHook(parsed.hooks, childParsed.hooks)
                parsed.methods = mergeMethod(parsed.methods, childParsed.methods)
                parsed.computed = mergeMethod(parsed.computed, childParsed.computed)
                parsed.watch = mergeMethod(parsed.watch, childParsed.watch)
            })

            //向上级交付
            target.html = mergeHtml(target.html, parsed.html)
            if (pg_com.setDataWrapper) {
                parsed.data.trimRight().slice(-1) == ',' && (parsed.data = parsed.data.trimRight().slice(0, -1)) //去除内部多余的逗号
                target.data = mergeData(target.data, `${pg_com.comObj.name}:{${parsed.data}}`)
            } else { //单属性data 或 无属性data
                target.data = mergeData(target.data, parsed.data)
            }
            target.methods = mergeMethod(target.methods, parsed.methods)
            target.style = mergeStyle(target.style, parsed.style)
            target.hooks = mergeHook(target.hooks, parsed.hooks)
            target.computed = mergeMethod(target.computed, parsed.computed)
            target.watch = mergeMethod(target.watch, parsed.watch)
            return target;
        }, {
            html: '',
            style: '',
            data: '',
            methods: '',
            hooks: {},
            computed: '',
            watch: ''
        })
    }

    //合并块策略（a组件位于b组件的前面，a和b是兄弟节点）
    function mergeHtml(a, b) {
        return a.trim() + b.trim();
    }

    function mergeData(a, b) {
        if (a.trimRight() && a.trimRight().slice(-1) !== ',') {
            return a.trim() + ',' + b.trim();
        } else {
            return a.trim() + b.trim();
        }
    }

    //=mergeComputed =mergeWatch
    function mergeMethod(a, b) {
        if (a.trimRight() && a.trimRight().slice(-1) !== ',') {
            return a.trim() + ',' + b.trim();
        } else {
            return a.trim() + b.trim();
        }
    }

    function mergeHook(a, b) {
        return Object.keys(b).reduce((a, hook) => {
            a[hook] || (a[hook] = '')
            a[hook] += '\n' + b[hook];
            return a;
        }, a)
    }

    function mergeStyle(a, b) {
        a = a.trim();
        b = b.trim();
        if (a && b) {
            return a + '\n' + b
        } else if (a || b) {
            return a || b
        } else {
            return ''
        }
    }

    function parse(pg_com) {
        //生成产出的数据结构
        //templace
        let replaced = pg_com.replaced;

        //data
        let scriptData = getScriptData(replaced);

        let data = {
            html: '',
            style: '',
            data: scriptData.data.body,
            methods: scriptData.methods.body,
            hooks: Object.keys(scriptData.hooks).reduce((target, hook) => {
                target[hook] || (target[hook] = '');
                target[hook] += scriptData.hooks[hook].body
                return target;
            }, {}),
            watch: scriptData.watch.body,
            computed: scriptData.computed.body
        }

        let htmlSFC = getHtml(replaced);
        htmlSFC && (data.html = replaced.slice(htmlSFC.start, htmlSFC.end));

        let singleStyleSFC = getStyles(replaced)[0];
        singleStyleSFC && (data.style = pg_com.ignoreStyle ? '' : replaced.slice(singleStyleSFC.start, singleStyleSFC.end));

        return data;
    }
    let ret = doMerge(pg_map.components)

    ret.html = `<div>\n${ret.html}\n</div>`;

    if (pg_map.vueTemplate) {

        //替换 template/style 占位符
        pg_map.vueTemplate.replaced = pg_map.vueTemplate.replaced.replace('____pg_template____', ret.html)
            .replace('____pg_style____', ret.style)

        let parsed = parse(pg_map.vueTemplate);

        ret.data = mergeData(parsed.data, ret.data)
        ret.methods = mergeMethod(parsed.methods, ret.methods)
        ret.hooks = mergeHook(parsed.hooks, ret.hooks)
        ret.computed = mergeMethod(parsed.computed, ret.computed)
        ret.watch = mergeMethod(parsed.watch, ret.watch)
    }


    //删除末尾逗号
    ret.data.slice(-1) === ',' && (ret.data = ret.data.slice(0, -1))
    ret.methods.slice(-1) === ',' && (ret.methods = ret.methods.slice(0, -1))
    ret.watch.slice(-1) === ',' && (ret.watch = ret.watch.slice(0, -1))
    ret.computed.slice(-1) === ',' && (ret.computed = ret.computed.slice(0, -1))

    return {
        html: ret.html,
        style: ret.style,
        data: ret.data,
        methods: ret.methods,
        hooks: ret.hooks,
        watch: ret.watch,
        computed: ret.computed
    }

}

/**
 * 
 * @param {html,data,methods,hooks} data 输出信息
 */
function render(data) {
    logger('render', data)
    let output;
    if (pg_map.vueTemplate) {
        let vue = pg_map.vueTemplate.replaced;
        let t = `data() {
                return {
                    {{{data}}}
                };
            },
            {{{each hooks}}}
                {{{if $value.trim()}}}
                {{{$index}}}() {
                    {{{$value}}}
                },
                {{{/if}}}
            {{{/each}}}
            {{{if computed.trim()}}}
            computed:{
                {{{computed}}}
            },
            {{{/if}}}
            {{{if watch.trim()}}}
            watch:{
                {{{watch}}}
            },
            {{{/if}}}
            methods: {
                {{{methods}}}
            }`;
        let tt = template.render(t, data);

        let script = helpers.getSFCText(vue,'script');

        //删除相关选项
        let ast = babylon.parse(script, {
            sourceType: 'module'
        });
        let p = ast.program.body;
        let i;
        for (i = 0; i < p.length; i++) {
            if (p[i].type === 'ExportDefaultDeclaration') {
                let pp = p[i].declaration.properties;
                for (let i = 0; i < pp.length; i++) {
                    let block = pp[i];
                    if (block.key.name == 'data' ||
                        block.key.name == 'methods' ||
                        HOOKS_NAME.includes(block.key.name) ||
                        block.key.name == 'watch' ||
                        block.key.name == 'computed'
                    ) {
                        pp[i] = null //删除属性
                    }
                }
                break;
            }
        }
        if (i >= p.length) {
            throw new Error('根组件必须含有一个export default块')
        }


        //添加选项
        let removedOptionScript = babel_generator(ast).code;
        ast = babylon.parse(removedOptionScript, {
            sourceType: 'module'
        });
        let newScript = '';
        p = ast.program.body;
        for (let i = 0; i < p.length; i++) {
            if (p[i].type === 'ExportDefaultDeclaration') {
                p = p[i].declaration;
                newScript += removedOptionScript.slice(0, p.end - 1);
                newScript += (newScript.trim().slice(-1) !== ',' ? ',' : '') + tt + removedOptionScript.slice(p.end - 1);
            }
        }
        output = helpers.replaceSFC(vue,'script',newScript)
    } else {
        output = template(path.join(__dirname, 'App.vue.art'), data)
    }
    return beautify(output);
}


/**
 * 编译模板
 * @param {comObj} comObj 
 * @param {Function} imports 
 * @param {name:Path} comPaths 组件路径 
 */
function compile(comObj, imports, comPaths) {
    Object.assign(template.defaults.imports, imports)
    let comPath = comPaths[comObj.type]
    let root = path.dirname(comPath)

    //I/O
    let art = fs.readFileSync(path.join(comPath, comObj.type + '.vue.art'), 'utf-8');

    return template.render(art, comObj.props, {
        ...template.defaults,
        root
    })
}

//获取vue单文件组件的template/script/style块，不包括标签本身（可以包含不合法标识符）
function getHtml(vue) {
    return vueCompiler.parse({
        source: vue,
        needMap: false
    }).template
}

function getScript(vue) {
    return vueCompiler.parse({
        source: vue,
        needMap: false
    }).script;
}

function getStyles(vue) {
    return vueCompiler.parse({
        source: vue,
        needMap: false
    }).styles;
}

function renameComputed(allKeys) {
    let renameList = []

    function traverse(list) {
        list.forEach(e => {
            let newKeys = [] //该组件的methosKey集合
            e.initComputedKeys.forEach(key => {
                let newKey = key;
                if (allKeys.includes(key)) {
                    if (e.comObj) newKey = prefixComName(e.comObj, key)
                    while (allKeys.includes(newKey)) {
                        newKey = newKey + '$'
                    }
                    renameList.push({
                        node: e,
                        value: newKey,
                        raw: key
                    });
                }
                newKeys.push(newKey);
                allKeys.push(newKey);
            })
            e.computedKeys = newKeys; //修改pg_map中的methodsKey
            traverse(e.children || []);
        })
    }
    if (pg_map.vueTemplate) {
        traverse([pg_map.vueTemplate, ...pg_map.components]);
    } else {
        traverse(pg_map.components);
    }
    logger('renameComputed: renameList', renameList)

    if (!renameList.length) return;

    pg_map.renameMap.computed = renameList
}

//generate renameMap/pg_com.methodsKey
function renameMethods() {
    let AllMethodsKey = pg_map.components.filter(e => { //获取首层data
        return e.setDataWrapper;
    }).map(pg_com => {
        return pg_com.name;
    }).concat(pg_map.vueTemplate ? pg_map.vueTemplate.dataKeys : []);
    let renameList = []

    function traverse(list) {
        list.forEach(e => {
            let newMethodsKey = [] //该组件的methosKey集合
            e.initMethodsKeys.forEach(key => {
                let newKey = key;
                if (AllMethodsKey.includes(key)) {
                    if (e.comObj) newKey = suffixComName(e.comObj, key);
                    while (AllMethodsKey.includes(newKey)) {
                        newKey = newKey + '$'
                    }
                    renameList.push({
                        node: e,
                        value: newKey,
                        raw: key
                    });
                }
                newMethodsKey.push(newKey)
                AllMethodsKey.push(newKey);
            })
            e.methodsKeys = newMethodsKey; //修改pg_map中的methodsKey
            traverse(e.children || []);
        })
    }
    if (pg_map.vueTemplate) {
        traverse([pg_map.vueTemplate, ...pg_map.components]);
    } else {
        traverse(pg_map.components);
    }
    logger('renameMethods: AllMethodsKey', AllMethodsKey)
    logger('renameMethods: renameList', renameList)


    if (!renameList.length) return AllMethodsKey;

    pg_map.renameMap.methods = renameList

    return AllMethodsKey;
}

function prefixComName(comObj, key) {
    return comObj.name + key[0].toUpperCase() + key.slice(1);
}

function suffixComName(comObj, key) {
    return key + comObj.name[0].toUpperCase() + comObj.name.slice(1);
}

//generate renameMap/pg_com.dataKeys
function renameData() {
    let toRename = []

    function traverse(list, isRoot) {
        let result = [];
        list.forEach(e => {
            let children = traverse(e.children);
            let local = e.initDataKeys.map(key => {
                return {
                    node: e, // pg_com对象
                    value: key, // 更改后的变量值
                    raw: key // 原变量值
                }
            })

            // set dataKeys
            e.dataKeys = e.initDataKeys.slice();

            let nodes = local.concat(children);

            if (!nodes.length) return;

            let keys = nodes.map(node => {
                return node.value
            })

            if (children.length) {
                for (let i = local.length; i < nodes.length; i++) {
                    if (nodes[i].raw === '') { //以组件名称命名的key
                        let t = keys[i];
                        delete keys[i];
                        while (~keys.indexOf(t)) {
                            keys[keys.indexOf(t)] = keys[keys.indexOf(t)] + '$';
                        }
                        keys[i] = t;
                    } else {
                        let t = keys[i];
                        delete keys[i];
                        while (~keys.indexOf(t)) {
                            t = t + '$';
                        }
                        keys[i] = t;
                    }
                }

                //检测新数组和原数组的不一致，添加入toRename
                nodes.map(node => {
                    return node.value
                }).forEach((key, idx) => {
                    if (key !== keys[idx]) {
                        toRename.push({
                            node: nodes[idx].node,
                            value: keys[idx], //新值
                            raw: nodes[idx].raw
                        })
                    }
                })
            }

            if (!isRoot) {
                if (nodes.length > 1) {
                    result.push({
                        node: e,
                        value: e.comObj.name,
                        raw: ''
                    })
                    e.setDataWrapper = true;
                } else if (nodes.length == 1) {
                    if (nodes[0].node === e) { //是本组件的单属性
                        result.push({
                            node: e,
                            value: prefixComName(e.comObj, nodes[0].value),
                            raw: nodes[0].value
                        })
                        toRename.push({
                            node: e,
                            value: prefixComName(e.comObj, nodes[0].value),
                            raw: nodes[0].value
                        })
                    } else { //是子组件的单属性
                        result.push(nodes[0]);
                    }
                }
            } else {
                if (nodes.length > 0) {
                    result.push(e.comObj.name)
                    e.setDataWrapper = true;
                }
            }
        })
        return result;
    }
    let dataKeys = traverse(pg_map.components, true);
    if (pg_map.vueTemplate) {
        pg_map.vueTemplate.dataKeys = pg_map.vueTemplate.initDataKeys.slice();
        for (let i = 0; i < pg_map.vueTemplate.dataKeys.length; i++) {
            let key = pg_map.vueTemplate.dataKeys[i];
            let newKey = key;
            while (
                dataKeys.includes(newKey) ||
                ~pg_map.vueTemplate.dataKeys.indexOf(newKey) &&
                pg_map.vueTemplate.dataKeys.indexOf(newKey) !== i
            ) {
                newKey = key + '$';
            }
            if (newKey !== key) {
                toRename.push({
                    node: pg_map.vueTemplate,
                    value: newKey,
                    raw: key
                })
            }
        }
    }

    if (!toRename.length) return;

    //TODO:合并raw值相同、node相同的toRename item，较后的覆盖较前的
    toRename = toRename.reverse().filter((e, idx) => {
        return toRename.findIndex(t => {
            return t.node === e.node && t.raw === e.raw;
        }) === idx
    }).reverse()

    pg_map.renameMap.data = toRename

    logger('renameData: toRename', toRename)

    //修改pg_map
    toRename.forEach(({
        node,
        value,
        raw
    }) => {
        if (node.dataKeys.includes(raw)) {
            node.dataKeys[node.dataKeys.indexOf(raw)] = value;
        }
    })
}

function renameVueOptions() {
    //需保证同一个raw不出现两次
    trav(reduce(pg_map.renameMap.data), 'data')
    trav(reduce(pg_map.renameMap.methods), 'methods')
    trav(reduce(pg_map.renameMap.computed), 'computed')

    function reduce(renameMap) {
        if (!renameMap) return;
        return renameMap.reduce((target, item) => {
            let idx = target.findIndex(e => {
                return e.node === item.node;
            })
            let map = {
                raw: item.raw,
                value: item.value
            }
            if (~idx) {
                target[idx].maps.push(map)
            } else {
                target.push({
                    node: item.node,
                    maps: [map]
                })
            }
            return target;
        }, [])
    }

    function trav(renameMap, type) {
        if (!renameMap) return;
        renameMap.forEach(item => {
            let node = item.node
            let scriptSFC = getScript(node.compiled);
            if (!scriptSFC) return;
            script = node.compiled.slice(scriptSFC.start, scriptSFC.end)
            //替换掉@@为合法标识符
            let cleared = clearControlChar(script);
            script = cleared.text;

            var ast = babylon.parse(script, {
                sourceType: 'module'
            });
            let p = ast.program.body; //找出export语句
            for (let i = 0; i < p.length; i++) {
                if (p[i].type == 'ExportDefaultDeclaration') {
                    p = p[i].declaration.properties; //属性遍历找出methods
                    for (let i = 0; i < p.length; i++) {
                        if (type === 'data' && p[i].key.name == 'data') {
                            p = p[i].body.body; //找出return语句
                            for (let i = 0; i < p.length; i++) {
                                if (p[i].type == 'ReturnStatement') {
                                    let properties = p[i].argument.properties;
                                    properties.forEach(val => {
                                        let map = item.maps.find(map => {
                                            return map.raw === val.key.name;
                                        })
                                        if (map) {
                                            val.key.name = map.value;
                                        }
                                    })
                                };
                            }
                            break;
                        } else if (type === 'methods' && p[i].key.name == 'methods') {
                            let list = p[i].value.properties;
                            list.forEach(val => {
                                let map = item.maps.find(map => {
                                    return map.raw === val.key.name;
                                })
                                if (map) {
                                    val.key.name = map.value;
                                }
                            })
                            break;
                        } else if (type === 'computed' && p[i].key.name == 'computed') {
                            let list = p[i].value.properties;
                            list.forEach(val => {
                                let map = item.maps.find(map => {
                                    return map.raw === val.key.name;
                                })
                                if (map) {
                                    val.key.name = map.value;
                                }
                            })
                            break;
                        };
                    }
                    break;
                }
            }
            let newScript = babel_generator(ast).code;
            newScript = newScript.replace(new RegExp(cleared.pgHash, 'g'), '@@').replace(new RegExp(cleared.pgColonHash, 'g'), ':')
            let vueArr = node.compiled.split('');
            vueArr.splice(scriptSFC.start, scriptSFC.end - scriptSFC.start, newScript)
            node.compiled = vueArr.join('')
        })
    }

}

/**
 * 解析Script内容
 * @param {String} vue 组件文本
 * @return {Object} {
 *  data:{
 *      keys:Array,
 *      body:String
 *  },
 *  hooks:{
 *      created:{
 *          body:String
 *      }
 *  },
 *  methods:{
 *      keys:Array,
 *      body:String
 *  }
 * }
 */
function getScriptData(vue) {
    let scriptSFC = getScript(vue);
    let ret = {
        data: {
            keys: [],
            body: ''
        },
        hooks: {},
        methods: {
            keys: [],
            body: ''
        },
        watch: {
            body: ''
        },
        computed: {
            keys: [],
            body: ''
        }
    }
    if (!scriptSFC) return ret;
    let script = vue.slice(scriptSFC.start, scriptSFC.end)

    let cleared = clearControlChar(script);
    script = cleared.text

    var ast = babylon.parse(script, {
        sourceType: 'module'
    });

    function trimAndReplaceObjectExpression(value) {
        return value.match(/^\s*\{([\s\S]*)\}\s*$/)[1].trim().replace(new RegExp(cleared.pgHash, 'g'), '@@').replace(new RegExp(cleared.pgColonHash, 'g'), ':')
    }

    const blockParser = {
        data(block) { //ObjectExpression
            if (block.type === 'ObjectMethod') {
                block = block.body;
            }
            // else if (block.type === 'ObjectProperty' && block.value.type === 'FunctionExpression') {
            //     block = block.value.body;
            // } 
            else {
                throw new Error('data属性必须为一个ES6方法')
            }

            let p = block.body; //找出return语句
            for (let i = 0; i < p.length; i++) {
                if (p[i].type == 'ReturnStatement') {
                    let arg = p[i].argument;
                    if (arg.type !== 'ObjectExpression') throw new Error('data方法必须return一个对象字面量');
                    let properties = arg.properties; //无属性则为[]
                    return {
                        keys: properties.map((property, idx) => {
                            if (properties.findIndex(p => {
                                    return p.key.name === property.key.name;
                                }) !== idx) throw new Error(`data ${property.key.name} 重复声明`)
                            return property.key.name
                        }),
                        body: trimAndReplaceObjectExpression(script.slice(arg.start, arg.end))
                    }
                };
            }
            throw new Error('data方法必须return一个对象字面量');

        },
        methods(block) {
            if (block.type !== 'ObjectProperty' || block.value.type !== 'ObjectExpression') throw new Error('methods块声明格式不正确');
            let methods = block.value;
            return {
                keys: methods.properties.map((property, idx) => {
                    if (methods.properties.findIndex(p => {
                            return p.key.name === property.key.name;
                        }) !== idx) throw new Error(`method ${property.key.name} 重复声明`)
                    return property.key.name
                }),
                body: trimAndReplaceObjectExpression(script.slice(methods.start, methods.end))
            }
        },
        hook(block) {
            let name = block.key.name;
            if (block.type === 'ObjectMethod') {
                block = block.body;
            }
            // else if (block.type === 'ObjectProperty' && block.value.type === 'FunctionExpression') {
            //     block = block.value.body;
            // } 
            else {
                throw new Error(name + '块声明格式不正确')
            }
            return {
                body: trimAndReplaceObjectExpression(script.slice(block.start, block.end))
            }
        },
        watch(block) {
            if (block.type !== 'ObjectProperty' || block.value.type !== 'ObjectExpression') throw new Error('watch块声明格式不正确');
            block = block.value;
            return {
                body: trimAndReplaceObjectExpression(script.slice(block.start, block.end))
            }
        },
        computed(block) {
            if (block.type !== 'ObjectProperty' || block.value.type !== 'ObjectExpression') throw new Error('computed块声明格式不正确');
            block = block.value;
            return {
                keys: block.properties.map((property, idx) => {
                    if (block.properties.findIndex(p => {
                            return p.key.name === property.key.name;
                        }) !== idx) throw new Error(`computed ${property.key.name} 重复声明`)
                    return property.key.name
                }),
                body: trimAndReplaceObjectExpression(script.slice(block.start, block.end))
            }
        }
    }

    let p = ast.program.body; //找出export语句
    for (let i = 0; i < p.length; i++) {
        if (p[i].type === 'ExportDefaultDeclaration') {
            p = p[i].declaration.properties; //属性遍历找出data
            for (let i = 0; i < p.length; i++) {
                let block = p[i];
                if (block.key.name == 'data') {
                    ret.data = blockParser.data(block)
                } else if (block.key.name == 'methods') {
                    ret.methods = blockParser.methods(block)
                } else if (HOOKS_NAME.includes(block.key.name)) {
                    ret.hooks[block.key.name] = blockParser.hook(block)
                } else if (block.key.name == 'watch') {
                    ret.watch = blockParser.watch(block)
                } else if (block.key.name == 'computed') {
                    ret.computed = blockParser.computed(block)
                }
            }
        }
    }

    return ret;

}

function clearControlChar(text) {
    const pgHash = pgHashPrefix + Date.now();
    const pgColonHash = pgColonHashPrefix + Date.now();
    text = text.replace(/@@([$a-zA-Z][$\w]*)?(:)?/g, function (_, word, colon) {
        if (colon) {
            return pgHash + (word || '') + pgColonHash
        } else {
            return pgHash + (word || '')
        }
    })
    return {
        text,
        pgHash,
        pgColonHash
    }
}

function initMap(components, comPaths, vueTemplatePath) {
    pg_map.components = [];
    pg_map.renameMap = {};
    pg_map.vueTemplate = null;

    function doCompile(comObj, list) {
        let pg_com = {
            name: comObj.name,
            comObj: comObj,
            children: []
        }
        //编译子组件，加入父组件列表
        comObj.children && comObj.children.forEach(subComObj => {
            doCompile(subComObj, pg_com.children)
        })
        let imports = {
            /**
             * 插入子组件
             */
            insertChildren() {
                //过滤slot children
                let children = comObj.children.filter((e) => {
                    return !e.__pg_slot__;
                });
                if (!children.length) return '';
                return CHILDREN_PLACEHOLDER;
            },
            /**
             * 插入slot
             */
            insertSlot(arg) {
                if (!arg) throw new Error('\n' + comObj.name + '：insertSlot参数为空');
                let nameArr = arg.value;
                if (!nameArr) throw new Error('\n' + comObj.name + '：insertSlot参数为空');
                let slotId = '';
                let children = pg_com.children.filter((e) => {
                    if (e.comObj.__pg_slot__ && nameArr.includes(e.name)) {
                        slotId = e.comObj.__pg_slot__;
                        return true;
                    }
                });
                if (!children.length) throw new Error('\n' + comObj.name + '：insertSlot不存在对应的子组件');
                pg_com.slots || (pg_com.slots = {});
                pg_com.slots[slotId] = children.sort((a, b) => {
                    return nameArr.indexOf(a.name) - nameArr.indexOf(b.name)
                });
                return SLOT_PLACEHOLDER + slotId;
            },
            /**
             * 引用其它组件的data/method
             */
            refer(arg, property, modifier) {
                if (!arg) throw new Error('\n' + comObj.name + '：refer参数为空');
                let comName = arg.value;
                let varName = arg.property;
                if (!varName) {
                    varName = property;
                } else {
                    modifier = property;
                }
                if (!comName) {
                    throw new Error('\n' + comObj.name + '：refer参数为空');
                } else if (modifier !== 'wrapper' && !varName) {
                    throw new Error('\n' + comObj.name + '：未设置property的refer类型应当为refer传入第二个参数引用变量');
                } else if (varName && !utils.isValidIdentifier(varName)) {
                    throw new Error('\n' + comObj.name + '：refer 引用变量名不合法');
                } else if (modifier && !modifiers.includes(modifier)) {
                    throw new Error('\n' + comObj.name + '：refer 修饰符仅支持 wrapper|last');
                }
                return '@@' + comName + '__pg_refer__' + (varName || '') + (modifier ? ':' + modifier : '');
            }
        }

        //编译模板
        pg_com.compiled = compile(comObj, imports, comPaths);

        console.log(pg_com.name,pg_com.compiled)

        //抽取需重命名的vue选项数据
        let scriptData;
        try {
            scriptData = getScriptData(pg_com.compiled);
        } catch (err) {
            throw new Error(comObj.name + ' 组件编译后语法树解析错误：' + err.message)
        }
        pg_com.initDataKeys = scriptData.data.keys;
        pg_com.initMethodsKeys = scriptData.methods.keys;
        pg_com.initComputedKeys = scriptData.computed.keys;
        list.push(pg_com);
    }
    components.forEach((comObj) => {
        doCompile(comObj, pg_map.components)
    })
    if (vueTemplatePath) {
        pg_map.vueTemplate = {};
        let art = fs.readFileSync(vueTemplatePath, 'utf-8');
        pg_map.vueTemplate.compiled = template.render(art, {
            template: '____pg_template____',
            style: '____pg_style____'
        })
        let scriptData;
        try {
            scriptData = getScriptData(pg_map.vueTemplate.compiled);
        } catch (err) {
            throw new Error('根组件编译后语法树解析错误：' + err.message)
        }
        pg_map.vueTemplate.initDataKeys = scriptData.data.keys;
        pg_map.vueTemplate.initMethodsKeys = scriptData.methods.keys;
        pg_map.vueTemplate.initComputedKeys = scriptData.computed.keys;
    }
    logger('initMap', pg_map)
}

module.exports = async function (data, comPaths, pagePaths, supportVueTemplate = true) {
    let vueTemplatePath = data.page && (pagePaths[data.page] || pagePaths[data.page + '.vue.art'])
    initMap(data.components, comPaths, supportVueTemplate && vueTemplatePath); //init pg_map tree
    let output = render(merge());
    return output
}