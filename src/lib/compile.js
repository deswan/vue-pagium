const htmlcs = require('htmlcs');
const esformatter = require('esformatter');
const path = require('path');
const fs = require('fs-extra');
const beautify_html = require('js-beautify').html;

const crypto = require('crypto');
const hash = crypto.createHash('sha256');

const output = './dist';

const scheme2Default = require('../utils/scheme2Default');
const utils = require('../utils/utils')
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

const template = require('art-template');

//art options
template.defaults.rules[1].test = /{{{([@#]?)[ \t]*(\/?)([\w\W]*?)[ \t]*}}}/;
Object.assign(template.defaults, {
    minimize: false,
    escape: false,
})
Object.assign(template.defaults.imports, {
    Object,
    Array,
    String,
    Number,
    Math,
    JSON
})

let pg_map = {
    components: [],
    renameMap: {}
}

function warn(info) {
    console.warn('解析警告:' + info)
}

//全局替换标识符 @@varName -> varName
function replaceIdentifier() {
    let regExp = /@@([$a-zA-Z][$\w]*)?(:[$a-zA-Z][$\w]*)?/g;
    let externalRegExp = /@@([$a-zA-Z][$\w]*)__pg_external__([$a-zA-Z][$\w]*)?(:[$a-zA-Z][$\w]*)?/g;

    //init pg_com.wrapper for each one
    function calcWrapper(list, wrapper = '') {
        if (!list || !list.length) return;
        list.forEach((pg_com) => {
            let curWrapper = wrapper;
            if (pg_com.setDataWrapper) {
                curWrapper = curWrapper + pg_com.comObj.name + '.';
            }
            pg_com.wrapper = curWrapper
            calcWrapper(pg_com.children, curWrapper)
        })
    }

    calcWrapper(pg_map.components);

    function doReplace(list) {
        if (!list || !list.length) return;
        list.forEach((pg_com) => {
            let externalReplaced = pg_com.compiled.replace(externalRegExp, (match, comName, varName, modifier) => {
                let externalCom = utils.getComponentByName(pg_map.components, comName)
                if (!externalCom) {
                    throw new Error(`${pg_com.name} 引用的 ${comName} 组件不存在`)
                }

                let idx, renamedVarName = varName;

                //匹配
                let isData = externalCom.initDataKeys.includes(varName)
                let isMethod = externalCom.initMethodsKeys.includes(varName);
                let isComputed = externalCom.initComputedKeys.includes(varName);

                if (varName) {
                    //修改为rename后的值（data优先级较高）
                    isComputed && pg_map.renameMap.methods && (renamedVarName = getRenamed(pg_map.renameMap.methods, varName, externalCom) || renamedVarName)
                    isMethod && pg_map.renameMap.computed && (renamedVarName = getRenamed(pg_map.renameMap.computed, varName, externalCom) || renamedVarName)
                    isData && pg_map.renameMap.data && (renamedVarName = getRenamed(pg_map.renameMap.data, varName, externalCom) || renamedVarName)
                }

                function getRenamed(renameMap, varName, comObj) {
                    let idx = renameMap.findIndex(toRename => {
                        return toRename.node === comObj && toRename.raw === varName
                    })
                    if (~idx) {
                        return renameMap[idx].value
                    }

                }

                modifier && (modifier = modifier.slice(1))

                if (modifier) {
                    if (modifier === 'wrapper') {
                        let match = externalCom.wrapper.match(/(?:\.|^)([$a-zA-Z][$\w]*)\.$/);
                        if (match) {
                            return match[1];
                        } else {
                            throw new Error(`组件${externalCom.name}的wrapper不存在，因该组件及其子组件没有data`)
                        }
                    } else if (modifier === 'last') {
                        if(!isData && !isMethod && !isComputed) throw new Error(`${externalCom.name}组件的变量${varName}不存在`)
                        return renamedVarName;
                    } else {
                        throw new Error(externalCom.name + '：' + modifier + ' 修饰符不存在')
                    }
                } else {
                    if (isData) { //data
                        return externalCom.wrapper + renamedVarName;
                    } else if (isComputed || isMethod) {
                        return renamedVarName;
                    } else {
                        throw new Error(`${externalCom.name}组件的变量${varName}不存在`)
                    }
                }
            })

            let replaced = externalReplaced.replace(regExp, (match, word, modifier) => {

                modifier && (modifier = modifier.slice(1))

                //匹配
                let isData = pg_com.dataKeys.includes(word)
                let isComputed = pg_com.computedKeys.includes(word);
                let isMethod = pg_com.methodsKeys.includes(word);

                if (modifier) {
                    if (modifier === 'wrapper') {
                        let match = pg_com.wrapper.match(/(?:\.|^)([$a-zA-Z][$\w]*)\.$/);
                        if (match) {
                            return match[1];
                        } else {
                            throw new Error(`组件${pg_com.name}的wrapper不存在，因该组件及其子组件没有data`)
                        }
                    } else if (modifier === 'last') {
                        if(!isData && !isMethod && !isComputed) throw new Error(`${pg_com.name}组件的变量${word}不存在`)
                        return word;
                    } else {
                        throw new Error(externalCom.name + '：' + modifier + ' 修饰符不存在')
                    }
                } else {
                    if (isData) { //data
                        return pg_com.wrapper + word;
                    } else if (isComputed || isMethod) {
                        return word;
                    }  else {
                        throw new Error(`${pg_com.name}组件的变量${word}不存在`)
                    }
                }


            })
            pg_com.replaced = replaced;
            doReplace(pg_com.children)
        })
    }
    doReplace(pg_map.components);
    logger('after replaceIdentifier', pg_map)
}

/**
 * 代码美化
 * @param {String} vue .vue组件文本
 */
function beautify(vue) {

    logger('before beautify', vue)

    let idxStart = vue.indexOf('<template>');
    let idxEnd = vue.lastIndexOf('</template>');
    let html = vue.slice(idxStart, idxEnd + '</template>'.length);

    let formattedHtml = beautify_html(html, {
        preserve_newlines: false,
        max_preserve_newlines: 1,
        "unformatted": ["a", "abbr", "area", "audio", "b", "bdi", "bdo", "br", "button", "canvas", "cite", "code", "data", "datalist", "del", "dfn", "em", "embed", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "map", "mark", "math", "meter", "noscript", "object", "output", "progress", "q", "ruby", "s", "samp", "select", "small", "span", "strong", "sub", "sup", "svg", "textarea", "time", "u", "var", "video", "wbr", "text", "acronym", "address", "big", "dt", "ins", "small", "strike", "tt", "pre", "h1", "h2", "h3", "h4", "h5", "h6"],
        "indent_scripts": "keep"
    });

    idxStart = vue.indexOf('<script>');
    idxEnd = vue.lastIndexOf('</script>');
    let script = vue.slice(idxStart + '<script>'.length, idxEnd);

    let formattedScript = esformatter.format(script, require('./esformatter-pg.json'));

    let vueText = `${formattedHtml}\n<script>${formattedScript}\n</script>${vue.slice(idxEnd + '</script>'.length)}`
    return vueText;
}

function merge() {
    renameData();
    let allKeys = renameMethods();
    renameComputed(allKeys)
    replaceIdentifier();

    /**
     * 合并组件
     * @param {} list 
     */
    function doMerge(list) {
        let html = '';
        let data = '';
        let methods = '';
        let watch = '';
        let computed = '';
        let hooks = {};
        list.forEach(pg_com => {
            let parsed = parse(pg_com);

            //子组件
            let children = pg_com.children.filter(e => {
                return !e.comObj.__pg_slot__;
            })

            //slot组件
            //  { [slotId]:[pg_com1,pg_com2,...] }
            let slots = pg_com.slots || {};

            if (children && children.length) {
                let childParsed = doMerge(children);
                parsed.html = parsed.html.replace(CHILDREN_PLACEHOLDER, childParsed.html);
                parsed.data = mergeData(parsed.data, childParsed.data)
                parsed.methods = mergeMethod(parsed.methods, childParsed.methods)
                parsed.hooks = mergeHook(parsed.hooks, childParsed.hooks)
                parsed.computed = mergeMethod(parsed.computed, childParsed.computed)
                parsed.watch = mergeMethod(parsed.watch, childParsed.watch)
            }

            Object.keys(slots).forEach(slotId => {
                let slotList = slots[slotId];
                let childParsed = doMerge(slotList);
                parsed.html = parsed.html.replace(SLOT_PLACEHOLDER + slotId, childParsed.html);
                parsed.data = mergeData(parsed.data, childParsed.data)
                parsed.methods = mergeMethod(parsed.methods, childParsed.methods)
                parsed.hooks = mergeHook(parsed.hooks, childParsed.hooks)
                parsed.computed = mergeMethod(parsed.computed, childParsed.computed)
                parsed.watch = mergeMethod(parsed.watch, childParsed.watch)
            })

            html = mergeHtml(html, parsed.html)
            if (pg_com.setDataWrapper) {
                parsed.data.trimRight().slice(-1) == ',' && (parsed.data = parsed.data.trimRight().slice(0, -1)) //去除内部多余的逗号
                data = mergeData(data, `${pg_com.comObj.name}:{${parsed.data}}`)
            } else { //单属性data 或 无属性data
                data = mergeData(data, parsed.data)
            }
            methods = mergeMethod(methods, parsed.methods)
            hooks = mergeHook(hooks, parsed.hooks)
            computed = mergeMethod(computed, parsed.computed)
            watch = mergeMethod(watch, parsed.watch)
        })

        return {
            html,
            data,
            methods,
            hooks,
            computed,
            watch
        }
    }

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

    function parse(pg_com) {
        //生成产出的数据结构
        //templace
        let replaced = pg_com.replaced;
        html = getHtml(replaced);

        //data
        let scriptData = getScriptData(replaced);

        return {
            html: getHtml(replaced),
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
    }
    let ret = doMerge(pg_map.components)

    //删除末尾逗号
    ret.html.slice(-1) === ',' && (ret.html = ret.html.slice(0, -1))
    ret.data.slice(-1) === ',' && (ret.data = ret.data.slice(0, -1))
    ret.methods.slice(-1) === ',' && (ret.methods = ret.methods.slice(0, -1))
    ret.watch.slice(-1) === ',' && (ret.watch = ret.watch.slice(0, -1))
    ret.computed.slice(-1) === ',' && (ret.computed = ret.computed.slice(0, -1))

    return {
        html: ret.html,
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
function render(data, vueTemplate) {
    logger('render', data)
    let options = template.render(`
        data() {
            return {
                {{{data}}}
            };
        },
        {{{each hooks}}}
            {{{$index}}}() {
                {{{$value}}}
            },
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
        }
    `, data)
    let html = template.render(`
        <div>
            {{{html}}}
        </div>
    `, data)
    let templPath = vueTemplate || path.join(__dirname, 'App.vue.art');
    let output = template(templPath, {
        template: html,
        options
    })
    return beautify(output);
}


/**
 * 编译模板
 * @param {comObj} comObj 
 * @param {Function} imports 
 * @param {name:Path} comPaths 组件路径 
 * @param {String} root 本地组件文件夹路径
 */
function compile(comObj, imports, comPaths, root) {
    Object.assign(template.defaults.imports, imports)

    let comPath = comPaths[comObj.type]
    let config = require(path.join(comPath, 'config.js'));
    let art = fs.readFileSync(path.join(comPath, comObj.type + '.vue.art'), 'utf-8');
    return template.render(art, comObj.props, {
        ...template.defaults,
        root
    })
}

function getHtml(vue) {
    let sfc = vueCompiler.parse({
        source: vue,
        needMap: false
    }).template
    return sfc ? vue.slice(sfc.start, sfc.end).trim() : '';
}

function getScript(vue) {
    let sfc = vueCompiler.parse({
        source: vue,
        needMap: false
    }).script;
    if (!sfc) throw new Error('<script>块必须存在')
    return vue.slice(sfc.start, sfc.end).trim();
}

function renameComputed(allKeys) {
    let renameList = []

    function traverse(list) {
        list.forEach(e => {
            let newKeys = [] //该组件的methosKey集合
            e.initComputedKeys.forEach(key => {
                let newKey = key;
                if (allKeys.includes(key)) {
                    newKey = prefixComName(e.comObj, key)
                    while (allKeys.includes(newKey)) {
                        newKey = newKey + '$'
                    }
                    renameList.push({
                        node: e,
                        value: newKey,
                        raw: key
                    });
                }
                newKeys.push(newKey)
            })
            e.computedKeys = newKeys; //修改pg_map中的methodsKey
            allKeys = allKeys.concat(newKeys);
            traverse(e.children);
        })
    }
    traverse(pg_map.components);
    logger('renameComputed: renameList', renameList)

    if (!renameList.length) return;

    pg_map.renameMap.computed = renameList

    let toRename = renameList.reduce((target, item) => {
        let idx = target.findIndex(e => {
            return e.node === item.node
        })
        if (~idx) {
            target[idx].keys[item.raw] = item.value;
        } else {
            target.push({
                node: item.node,
                keys: {
                    [item.raw]: item.value
                }
            })
        }
        return target;
    }, [])

    //compiled -> methodRenamed
    toRename.forEach(({
        node,
        keys
    }) => {
        let script = getScript(node.compiled);

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
                    if (p[i].key.name == 'computed') {
                        list = p[i].value.properties;
                        list.forEach(val => {
                            if (keys[val.key.name]) {
                                val.key.name = keys[val.key.name];
                            }
                        })
                        break;
                    };
                }
                break;
            }
        }
        script = script.replace(new RegExp(cleared.pgHash, 'g'), '@@');
        script = script.replace(new RegExp(cleared.pgColonHash, 'g'), ':');

        let newScript = babel_generator(ast).code;
        newScript = newScript.replace(new RegExp(cleared.pgHash, 'g'), '@@');
        newScript = newScript.replace(new RegExp(cleared.pgColonHash, 'g'), ':');

        //替换原script部分
        let newVue = node.compiled.replace(script, newScript);

        //替换compiled
        node.compiled = newVue.replace(new RegExp('@@(' + Object.keys(keys).join('|') + ')([^$\\w])', 'g'), (val, word, suffix) => {
            return '@@' + keys[word] + suffix;
        })
    })
}

function renameMethods() {
    let AllMethodsKey = pg_map.components.map(pg_com => {
        return pg_com.name;
    });
    let renameList = []

    function traverse(list) {
        list.forEach(e => {
            let newMethodsKey = [] //该组件的methosKey集合
            e.initMethodsKeys.forEach(key => {
                let newKey = key;
                if (AllMethodsKey.includes(key)) {
                    newKey = prefixComName(e.comObj, key)
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
            })
            e.methodsKeys = newMethodsKey; //修改pg_map中的methodsKey
            AllMethodsKey = AllMethodsKey.concat(newMethodsKey);
            traverse(e.children);
        })
    }
    traverse(pg_map.components);
    logger('renameMethods: AllMethodsKey', AllMethodsKey)
    logger('renameMethods: renameList', renameList)

    if (!renameList.length) return AllMethodsKey;

    pg_map.renameMap.methods = renameList

    let toRename = renameList.reduce((target, item) => {
        let idx = target.findIndex(e => {
            return e.node === item.node
        })
        if (~idx) {
            target[idx].keys[item.raw] = item.value;
        } else {
            target.push({
                node: item.node,
                keys: {
                    [item.raw]: item.value
                }
            })
        }
        return target;
    }, [])

    //compiled -> methodRenamed
    toRename.forEach(({
        node,
        keys
    }) => {
        let script = getScript(node.compiled);

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
                    if (p[i].key.name == 'methods') {
                        list = p[i].value.properties;
                        list.forEach(val => {
                            if (keys[val.key.name]) {
                                val.key.name = keys[val.key.name];
                            }
                        })
                        break;
                    };
                }
                break;
            }
        }
        script = script.replace(new RegExp(cleared.pgHash, 'g'), '@@');
        script = script.replace(new RegExp(cleared.pgColonHash, 'g'), ':');

        let newScript = babel_generator(ast).code;
        newScript = newScript.replace(new RegExp(cleared.pgHash, 'g'), '@@');
        newScript = newScript.replace(new RegExp(cleared.pgColonHash, 'g'), ':');

        //替换原script部分
        let newVue = node.compiled.replace(script, newScript);

        //替换compiled
        node.compiled = newVue.replace(new RegExp('@@(' + Object.keys(keys).join('|') + ')([^$\\w])', 'g'), (val, word, suffix) => {
            return '@@' + keys[word] + suffix;
        })
    })

    return AllMethodsKey;
}

function prefixComName(comObj, key) {
    return comObj.name + key[0].toUpperCase() + key.slice(1);
}

function renameData() {
    let toRename = []

    function traverse(list, isRoot) {
        let result = [];
        list.forEach(e => {
            let children = traverse(e.children);
            let local = e.initDataKeys.map(key => {
                return {
                    node: e,
                    value: key,
                    raw: key
                }
            })

            e.dataKeys = e.initDataKeys.slice();

            let nodes = local.concat(children);

            if (!nodes.length) return;

            let keys = nodes.map(node => {
                return node.value
            })

            if (children.length) { //push to toRename
                //去重
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
                            value: keys[idx],
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
                    e.setDataWrapper = true;
                }
            }
        })
        return result;
    }
    traverse(pg_map.components, true);
    logger('renameData: toRename', toRename)

    if (!toRename.length) return;

    //TODO:合并raw值相同、node相同的toRename item，较后的覆盖较前的
    toRename = toRename.reverse().filter((e, idx) => {
        if (toRename.findIndex(t => {
                return t.node === e.node && t.raw === e.raw;
            }) != idx) {
            return false
        }
        return true;
    }).reverse()

    pg_map.renameMap.data = toRename

    //修改pg_map && 修改compiled
    toRename.forEach(({
        node,
        value,
        raw
    }) => {
        //修改pg_map
        if (node.dataKeys.includes(raw)) {
            node.dataKeys[node.dataKeys.indexOf(raw)] = value;
        }

        let script = getScript(node.compiled);

        let startIdx = node.compiled.indexOf(script);
        let scriptLength = script.length

        //替换掉@@为合法标识符
        let cleared = clearControlChar(script)
        script = cleared.text

        //替换原script部分
        var ast = babylon.parse(script, {
            sourceType: 'module'
        });

        let p = ast.program.body; //找出export语句
        for (let i = 0; i < p.length; i++) {
            if (p[i].type == 'ExportDefaultDeclaration') {
                p = p[i].declaration.properties; //属性遍历找出methods
                for (let i = 0; i < p.length; i++) {
                    if (p[i].key.name == 'data') {
                        p = p[i].body.body; //找出return语句
                        for (let i = 0; i < p.length; i++) {
                            if (p[i].type == 'ReturnStatement') {
                                let properties = p[i].argument.properties;
                                properties.forEach(val => {
                                    if (val.key.name === raw) {
                                        val.key.name = value;
                                    }
                                })
                            };
                        }
                        break;
                    };
                }
                break;
            }
        }

        let newScript = babel_generator(ast).code.replace(new RegExp(cleared.pgHash, 'g'), '@@').replace(new RegExp(cleared.pgColonHash, 'g'), ':');
        let arr = node.compiled.split('');
        arr.splice(startIdx, scriptLength, newScript);
        let newVue = arr.join('')
        //替换标识符引用
        node.compiled = newVue.replace(new RegExp('@@(' + raw + ')([^$\\w])', 'g'), '@@' + value + '$2')
        logger('after renameData: compiled', node.compiled)
    })
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
    let script = getScript(vue);

    let cleared = clearControlChar(script);
    script = cleared.text

    var ast = babylon.parse(script, {
        sourceType: 'module'
    });

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
                    let properties = arg.properties;
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

function initMap(components, comPaths, root) {
    pg_map.components = [];
    pg_map.renameMap = {};

    function doCompile(comObj, list) {
        let pg_com = {
            name: comObj.name,
            comObj: comObj,
            children: []
        }
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
                if(!arg) throw new Error(comObj.name + '：insertSlot参数为空');
                let nameArr = arg.value;
                if (!nameArr) throw new Error(comObj.name + '：insertSlot参数为空');
                let slotId = '';
                let children = pg_com.children.filter((e) => {
                    if (e.comObj.__pg_slot__ && nameArr.includes(e.name)) {
                        slotId = e.comObj.__pg_slot__;
                        return true;
                    }
                });
                if (!children.length) throw new Error(comObj.name + '：insertSlot不存在对应的子组件');
                pg_com.slots || (pg_com.slots = {});
                pg_com.slots[slotId] = children.sort((a, b) => {
                    return nameArr.indexOf(a.name) - nameArr.indexOf(b.name)
                });
                return SLOT_PLACEHOLDER + slotId;
            },
            /**
             * 引用其它组件的data/method
             */
            external(arg, property, modifier) {
                if(!arg) throw new Error(comObj.name + '：external参数为空');
                let comName = arg.value;
                let varName = arg.property;
                if (!varName) {
                    varName = property;
                } else {
                    modifier = property;
                }
                if (!comName) {
                    throw new Error(comObj.name + '：external参数为空');
                } else if (modifier !== 'wrapper' && !varName) {
                    throw new Error(comObj.name + '：未设置property的refer类型应当为external传入第二个参数引用变量');
                } else if (varName && !utils.isValidIdentifier(varName)) {
                    throw new Error(comObj.name + '：external 引用变量名不合法');
                } else if (modifier && !modifiers.includes(modifier)) {
                    throw new Error(comObj.name + '：external 修饰符仅支持 wrapper|last');
                }
                return '@@' + comName + '__pg_external__' + (varName || '') + (modifier ? ':' + modifier : '');
            }
        }

        pg_com.compiled = compile(comObj, imports, comPaths, root);
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
    logger('initMap', pg_map)
}

module.exports = async function (components, comPaths, root, vueTemplate) {
    initMap(components, comPaths, root);
    return render(merge(), vueTemplate)
}