const htmlcs = require('htmlcs');
const esformatter = require('esformatter');
const path = require('path');
const fs = require('fs');
const beautify_html = require('js-beautify').html;

const crypto = require('crypto');
const hash = crypto.createHash('sha256');

const output = './dist';

const outTemplDir = path.join(__dirname, './');

const scheme2Default = require('../utils/scheme2Default');
const template = require('./art');
const babylon = require('babylon');
const babel_generator = require('babel-generator').default;

const CHILDREN_PLACEHOLDER = '_____pg_chilren_____';
const SLOT_PLACEHOLDER = '_____pg_slot______';

const HOOKS_NAME = ['created', 'mounted'];

let logger = require('../logger')('postProcessor')

let pg_map = {
    components: [],
    renameMap: {}
}

function warn(info) {
    console.warn('解析警告:' + info)
}

//全局替换标识符 @@varName -> varName
function replaceIdentifier() {
    let regExp = /@@(\D[$\w]*)(:pg_last)?/g;
    let externalRegExp = /@@(\D[$\w]*)__pg_external__(\D[$\w]*)/g;

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
            let externalReplaced = pg_com.compiled.replace(externalRegExp, (match, comName, varName) => {
                let externalCom = getComponent(comName)
                if (!externalCom) {
                    throw new Error(`${comName} 组件不存在`)
                }

                let idx, renamedVarName = varName;

                //修改为rename后的值
                if (pg_map.renameMap.data) {
                    idx = pg_map.renameMap.data.findIndex(toRename => {
                        return toRename.node === externalCom && toRename.raw === varName
                    })
                    if (~idx) {
                        renamedVarName = pg_map.renameMap.data[idx].value
                    }
                }

                if (pg_map.renameMap.methods) {
                    idx = pg_map.renameMap.methods.findIndex(toRename => {
                        return toRename.node === externalCom && toRename.raw === varName
                    })
                    if (~idx) {
                        renamedVarName = pg_map.renameMap.data[idx].value
                    }
                }

                //匹配
                let isData = externalCom.dataKeys.includes(renamedVarName)
                let isMethod = externalCom.methodsKeys.includes(renamedVarName);

                if (!isData && !isMethod) { //编译后组件的某些属性很有可能不存在，因此不必报错
                    warn(`${comName} 组件的属性（data/method） ${renamedVarName} 不存在`)
                } else if (isData) {
                    return externalCom.wrapper + renamedVarName;
                } else {
                    return renamedVarName;
                }

            })

            let replaced = externalReplaced.replace(regExp, (match, word, modifier) => {
                modifier && (modifier = modifier.slice(1))
                if (!pg_com.dataKeys.includes(word) && !pg_com.methodsKeys.includes(word)) {
                    throw new Error('data 或 methods 标识符不存在：' + match)
                } else if (pg_com.dataKeys.includes(word) && modifier === 'pg_last') {
                    return word;
                } else if (pg_com.dataKeys.includes(word)) { //data
                    return pg_com.wrapper + word;
                } else { //methods
                    return word;
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
    renameMethods()

    renameData();

    replaceIdentifier();

    /**
     * 合并组件
     * @param {} list 
     */
    function doMerge(list) {
        let html = '';
        let data = '';
        let methods = '';
        let hooks = {};
        list.forEach(pg_com => {
            let parsed = parse(pg_com);
            let children = pg_com.children.filter(e => {
                return !e.comObj.__pg_slot__;
            })
            let slots = pg_com.children.reduce((target, child) => {
                let slotId = child.comObj.__pg_slot__;
                if (slotId) {
                    target[slotId] || (target[slotId] = []);
                    target[slotId].push(child)
                }
                return target;
            }, {})

            if (children && children.length) {
                let childParsed = doMerge(children);
                parsed.html = parsed.html.replace(CHILDREN_PLACEHOLDER, childParsed.html);
                if (childParsed.data.trim() && parsed.data.trim()) {
                    parsed.data.trimRight().slice(-1) != ',' && (parsed.data = parsed.data.trimRight() + ',')
                }
                parsed.data += childParsed.data
                parsed.methods += childParsed.methods
                Object.keys(childParsed.hooks).forEach(hook => {
                    hooks[hook] || (hooks[hook] = '')
                    parsed.hooks[hook] += childParsed.hooks[hook];
                })
            }

            Object.keys(slots).forEach(slotId => {
                let slotList = slots[slotId];
                let childParsed = doMerge(slotList);
                parsed.html = parsed.html.replace(SLOT_PLACEHOLDER + slotId, childParsed.html);
                if (childParsed.data.trim() && parsed.data.trim()) {
                    parsed.data.trimRight().slice(-1) != ',' && (parsed.data = parsed.data.trimRight() + ',')
                }
                parsed.data += childParsed.data
                parsed.methods += childParsed.methods
                Object.keys(childParsed.hooks).forEach(hook => {
                    hooks[hook] || (hooks[hook] = '')
                    parsed.hooks[hook] += childParsed.hooks[hook];
                })
            })

            html += parsed.html;
            if (pg_com.setDataWrapper) {
                parsed.data.trimRight().slice(-1) == ',' && (parsed.data = parsed.data.trimRight().slice(0, -1))
                data += `${pg_com.comObj.name}:{${parsed.data}},`
            } else { //单属性data 或 无属性data
                if (data.trim() && parsed.data.trim()) {
                    data.trimRight().slice(-1) != ',' && (data = data.trimRight() + ',')
                }
                data += parsed.data
            }
            methods += parsed.methods;
            Object.keys(parsed.hooks).forEach(hook => {
                hooks[hook] || (hooks[hook] = '')
                hooks[hook] += parsed.hooks[hook];
            })
        })

        return {
            html,
            data,
            methods,
            hooks
        }
    }

    function parse(pg_com) {
        let {
            comObj,
            compiled,
            dataKeys,
            methodsKeys,
            children
        } = pg_com;

        let html = '';
        let data = '';
        let methods = '';
        let hooks = {};

        //生成产出的数据结构
        //templace
        let replaced = pg_com.replaced;
        html += getHtml(replaced);

        //data
        let scriptData = getScriptData(replaced);
        data += scriptData.data.body

        //methods
        if (scriptData.methods.body.trim()) {
            scriptData.methods.body.trimRight().slice(-1) != ',' && (scriptData.methods.body = scriptData.methods.body.trimRight() + ',')
            methods += scriptData.methods.body
        }

        //hooks
        Object.keys(scriptData.hooks).forEach((hook) => {
            if (scriptData.hooks[hook].body.trim()) {
                hooks[hook] === undefined && (hooks[hook] = '');
                hooks[hook] += scriptData.hooks[hook].body
            }
        })

        return {
            html,
            data,
            methods,
            hooks
        }
    }
    let ret = doMerge(pg_map.components)
    let hooks = {};
    Object.keys(ret.hooks).forEach(hook => {
        hooks[hook] = ret.hooks[hook];
    })

    return {
        html: ret.html,
        data: ret.data,
        methods: ret.methods,
        hooks
    }

}

/**
 * 
 * @param {html,data,methods,hooks} data 输出信息
 */
function render(data) {
    logger('render', data)
    let output = template(path.join(outTemplDir, 'App.vue.art'), data)
    return beautify(output);
}


/**
 * 编译模板
 * @param {comObj} comObj 
 */
function compile(comObj, imports = {}, comPaths, root = path.resolve(__dirname, '..', 'Components')) {
    Object.assign(template.defaults.imports, imports)
    var comType = comObj.type;
    let output;
    let config = require(path.join(comPaths.origin[comType] || comPaths.custom[comType], 'config.js'));
    let art = fs.readFileSync(path.join(comPaths.origin[comType] || comPaths.custom[comType], comType + '.vue.art'), 'utf-8');
    output = template.render(art, Object.assign(scheme2Default(config.props), comObj.props), { ...template.defaults,
        root: comPaths.origin[comType] ? root : path.join(root, '.custom')
    })
    return output;
}

/**
 * 获取标签内的内容
 * @param {String} vue 组件文本
 * @param {String} name TagName
 */
function getTag(vue, name) {
    let idxStart = vue.search(new RegExp('<' + name + '.*>'));
    let idxEnd = vue.lastIndexOf('</' + name + '>');
    let content = vue.slice(vue.indexOf('>', idxStart) + 1, idxEnd);
    return {
        idxStart,
        idxEnd,
        content
    }
}

function getHtml(vue) {
    return getTag(vue, 'template').content
}

function getScript(vue) {
    return getTag(vue, 'script').content
}

function renameMethods() {
    let AllMethodsKey = [];
    let renameList = []

    function traverse(list) {
        list.forEach(e => {
            let newMethodsKey = [] //该组件的methosKey集合
            e.methodsKeys.forEach(key => {
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

    if (!renameList.length) return;

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
        const pgHash = 'pg______' + Date.now();
        const pgColonHash = '__pg_colon__' + Date.now();
        script = script.replace(/@@(\D[$\w]*)(:?)/g, (_, word, colon) => {
            if (colon) {
                return pgHash + word + pgColonHash
            } else {
                return pgHash + word
            }
        })

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
        script = script.replace(new RegExp(pgHash, 'g'), '@@');
        script = script.replace(new RegExp(pgColonHash, 'g'), ':');

        let newScript = babel_generator(ast).code;
        newScript = newScript.replace(new RegExp(pgHash, 'g'), '@@');
        newScript = newScript.replace(new RegExp(pgColonHash, 'g'), ':');

        //替换原script部分
        newVue = node.compiled.replace(script, newScript);

        //替换compiled
        node.compiled = newVue.replace(new RegExp('@@(' + Object.keys(keys).join('|') + ')([^$\\w])', 'g'), (val, word,suffix) => {
            return '@@' + keys[word] + suffix;
        })
    })
}

function prefixComName(comObj, key) {
    return comObj.name + key[0].toUpperCase() + key.slice(1);
}

function renameData() {
    let toRename = []

    function traverse(list) {
        let result = [];
        list.forEach(e => {
            let children = traverse(e.children);
            let local = e.dataKeys.map(key => {
                return {
                    node: e,
                    value: key,
                    raw: key
                }
            })

            let nodes = local.concat(children);

            if (!nodes.length) return;

            let keys = nodes.map(node => {
                return node.value
            })

            if (children.length) { //push to toRename
                let childIndexStart = nodes.indexOf(children[0]);

                //去重
                for (let i = childIndexStart; i < nodes.length; i++) {
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
                } else { //非本组件（是子组件）的单属性
                    result.push(nodes[0]);
                }
            }
        })
        return result;
    }
    traverse(pg_map.components);
    logger('renameData: pg_map', pg_map)
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

        //替换掉@@为合法标识符
        const pgHash = 'pg______' + Date.now();
        const pgColonHash = '__pg_colon__' + Date.now();
        script = script.replace(/@@(\D[$\w]*)(:?)/g, (_, word, colon) => {
            if (colon) {
                return pgHash + word + pgColonHash
            } else {
                return pgHash + word
            }
        })

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
        script = script.replace(new RegExp(pgHash, 'g'), '@@');
        script = script.replace(new RegExp(pgColonHash, 'g'), ':');

        let newScript = babel_generator(ast).code;
        newScript = newScript.replace(new RegExp(pgHash, 'g'), '@@');
        newScript = newScript.replace(new RegExp(pgColonHash, 'g'), ':');


        //替换原script部分
        newVue = node.compiled.replace(script, newScript);

        //替换@@data
        node.compiled = newVue.replace(new RegExp('@@(' + raw + ')', 'g'), '@@' + value)
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

    //替换掉@@为合法标识符
    const pgHash = 'pg______' + Date.now();
    const pgColonHash = '__pg_colon__' + Date.now();
    script = script.replace(/@@(\D[$\w]*)(:?)/g, (_, word, colon) => {
        if (colon) {
            return pgHash + word + pgColonHash
        } else {
            return pgHash + word
        }
    })

    var ast = babylon.parse(script, {
        sourceType: 'module'
    });

    let ret = {
        data: getData(ast, script),
        hooks: getHook(ast, script, HOOKS_NAME),
        methods: getMethods(ast, script)
    }

    return ret;

    function getData(ast, script) {
        let p = ast.program.body; //找出export语句
        for (let i = 0; i < p.length; i++) {
            if (p[i].type == 'ExportDefaultDeclaration') {
                p = p[i].declaration.properties; //属性遍历找出data
                for (let i = 0; i < p.length; i++) {
                    if (p[i].key.name == 'data') {
                        p = p[i].body.body; //找出return语句
                        for (let i = 0; i < p.length; i++) {
                            if (p[i].type == 'ReturnStatement') {
                                let properties = p[i].argument.properties;

                                return {
                                    keys: properties.reduce((arr, obj) => {
                                        if (obj.key.type === 'Identifier') {
                                            return arr.concat(obj.key.name);
                                        } else {
                                            return arr;
                                        }
                                    }, []),
                                    body: script.slice(p[i].argument.start, p[i].argument.end).match(/^\s*\{([\s\S]*)\}\s*$/)[1].replace(new RegExp(pgHash, 'g'), '@@').replace(new RegExp(pgColonHash, 'g'), ':')
                                }
                            };
                        }
                        break;
                    };
                }
                break;
            }
        }
    }

    function getHook(ast, script, hooksName) {
        let hooksBody = {};
        let p = ast.program.body; //找出export语句
        for (let i = 0; i < p.length; i++) {
            if (p[i].type == 'ExportDefaultDeclaration') {
                p = p[i].declaration.properties; //属性遍历找出钩子方法
                for (let i = 0; i < p.length; i++) {
                    let keyName = p[i].key.name;
                    if (~hooksName.indexOf(keyName)) {
                        p = p[i].body;
                        hooksBody[keyName] = {
                            body: script.slice(p.start, p.end).match(/^\s*\{([\s\S]*)\}\s*$/)[1].replace(new RegExp(pgHash, 'g'), '@@').replace(new RegExp(pgColonHash, 'g'), ':')
                        }
                    };
                }
                break;
            }
        }
        return hooksBody
    }

    function getMethods(ast, script) {
        let p = ast.program.body; //找出export语句
        for (let i = 0; i < p.length; i++) {
            if (p[i].type == 'ExportDefaultDeclaration') {
                p = p[i].declaration.properties; //属性遍历找出methods
                for (let i = 0; i < p.length; i++) {
                    if (p[i].key.name == 'methods') {
                        methods = p[i].value;
                        return {
                            keys: methods.properties.reduce((arr, obj) => {
                                if (obj.key.type === 'Identifier') {
                                    return arr.concat(obj.key.name);
                                } else {
                                    return arr;
                                }
                            }, []),
                            body: script.slice(methods.start, methods.end).match(/^\s*\{([\s\S]*)\}\s*$/)[1].replace(new RegExp(pgHash, 'g'), '@@').replace(new RegExp(pgColonHash, 'g'), ':')
                        }
                    };
                }
                break;
            }
        }
    }
}

function getComponent(comName) {
    let ret = null;

    function find(list) {
        if (!list) return;
        for (let i = 0, len = list.length; i < len; i++) {
            if (list[i].name === comName) {
                return ret = list[i];
            } else {
                find(list[i].children)
            }
        }
    }
    find(pg_map.components)
    return ret;
}

function initMap(components, comPaths) {
    pg_map.components = [];
    pg_map.renameMap = {};

    function doCompile(comObj, list) {
        let children = [];

        let compiled = compile(comObj, {
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
            insertSlot({
                value: nameArr
            }) {
                let slotId = '';
                let children = comObj.children.filter((e) => {
                    if (e.__pg_slot__ && nameArr.includes(e.name)) {
                        slotId = e.__pg_slot__;
                        return true;
                    }
                });
                if (!children.length) return '';
                return SLOT_PLACEHOLDER + slotId;
            },
            /**
             * 引用其它组件的data/method
             */
            external({
                value: comName
            }, varName) {
                if (!comName || !varName) throw new Error('external参数不合法');
                return '@@' + comName + '__pg_external__' + varName;
            }
        }, comPaths);
        let scriptData = getScriptData(compiled);
        list.push({
            name: comObj.name,
            comObj: comObj,
            dataKeys: scriptData.data.keys,
            methodsKeys: scriptData.methods.keys,
            compiled,
            children
        });
        comObj.children && comObj.children.forEach(comObj => {
            doCompile(comObj, children)
        })
    }
    components.forEach((comObj) => {
        doCompile(comObj, pg_map.components)
    })
    logger('init', pg_map)
}

module.exports = (components, comPaths) => {
    initMap(components, comPaths);
    return render(merge())
}