const htmlcs = require('htmlcs');
const esformatter = require('esformatter');
const path = require('path');
const fs = require('fs');
const beautify_html = require('js-beautify').html;

const crypto = require('crypto');
const hash = crypto.createHash('sha256');

const output = './dist';

const componentDir = path.join(__dirname, '../Components');
const outTemplDir = path.join(__dirname, './');

const scheme2Default = require('./scheme2Default');
const template = require('./art');
const babylon = require('babylon');
const babel_generator = require('babel-generator').default;

const CHILDREN_PLACEHOLDER = '_____pg_chilren_____';
const SLOT_PLACEHOLDER = '_____pg_slot______';

let logger = require('./logger')

let pg_map = {
    components: [],
    dialogs: []
}

//全局替换标识符 @@varName -> varName
function replaceIdentifier() {
    let regExp = /@@(\D[$\w]*)/g;

    function doReplace(list, wrapper = '') {
        if (!list || !list.length) return;
        list.forEach((pg_com) => {
            let comWrapper = pg_com.setDataWrapper ? pg_com.comObj.name : '';
            let curWrapper = wrapper;
            if (comWrapper) {
                curWrapper = curWrapper + comWrapper + '.';
            }
            let replaced = pg_com.compiled.replace(regExp, (match, word) => {
                if (!pg_com.dataKeys.includes(word) && !pg_com.methodsKeys.includes(word)) {
                    throw new Error('data 或 methods 标识符不存在：' + match)
                } else if (pg_com.dataKeys.includes(word)) { //data
                    return curWrapper + word;
                } else { //methods
                    return word;
                }
            })
            pg_com.replaced = replaced;
            doReplace(pg_com.children, curWrapper)
        })
    }
    doReplace(pg_map.components);
    doReplace(pg_map.dialogs);
    logger('after replaceIdentifier',pg_map)
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
    let comp = doMerge(pg_map.components)
    let dialog = doMerge(pg_map.dialogs)
    let hooks = {};
    Object.keys(dialog.hooks).forEach(hook => {
        comp.hooks[hook] += dialog.hooks[hook];
    })

    return {
        html: comp.html + dialog.html,
        data: comp.data + dialog.data,
        methods: comp.methods + dialog.methods,
        hooks
    }

}

/**
 * 
 * @param {html,data,methods,hooks} data 输出信息
 */
function render(data) {
    let output = template(path.join(outTemplDir, 'App.vue.art'), data)
    return beautify(output);
}


/**
 * 编译模板
 * @param {comObj} comObj 
 */
function compile(comObj, imports = {}) {
    Object.assign(template.defaults.imports, imports)
    var comType = comObj.type;
    let config = require(path.join(componentDir, comType, 'config.js'));
    let art = fs.readFileSync(path.join(componentDir, comType, comType + '.vue.art'), 'utf-8');
    let vueText = template.render(art, Object.assign(scheme2Default(config.props), comObj.props), {...template.defaults,root:path.resolve(__dirname,'..','Components')})
    return vueText;
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
    let toRename = []

    function traverse(list) {
        if (!list || !list.length) return;
        list.forEach(e => {
            let t = {};
            let newMethodsKey = [] //该组件的methosKey集合
            e.methodsKeys.forEach(key => {
                let newKey = key;
                if (~AllMethodsKey.indexOf(key)) {
                    newKey = prefixComName(e.comObj, key)
                    while (~AllMethodsKey.indexOf(newKey)) {
                        newKey = newKey + '$'
                    }
                    t[key] = newKey;
                }
                newMethodsKey.push(newKey)
            })
            e.methodsKeys = newMethodsKey; //修改pg_map中的methodsKey
            AllMethodsKey = AllMethodsKey.concat(newMethodsKey);
            if (Object.keys(t).length) {
                toRename.push({
                    node: e,
                    keys: t
                });
            }
            traverse(e.children);
        })
    }
    traverse(pg_map.components);
    traverse(pg_map.dialogs);
    logger('renameMethods: AllMethodsKey', AllMethodsKey)
    logger('renameMethods: toRename', toRename)

    if (!toRename.length) return;

    //compiled -> methodRenamed
    toRename.forEach(({
        node,
        keys
    }) => {
        let script = getScript(node.compiled);

        //替换掉@@为合法标识符
        const pgHash = 'pg______' + Date.now();
        script = script.replace(/@@/g, pgHash)

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

        let newScript = babel_generator(ast).code;
        newScript = newScript.replace(new RegExp(pgHash, 'g'), '@@');

        //替换原script部分
        newVue = node.compiled.replace(script, newScript);

        //替换compiled
        node.compiled = newVue.replace(new RegExp('@@(' + Object.keys(keys).join('|') + ')', 'g'), (val, word) => {
            return '@@' + keys[word];
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
    traverse(pg_map.dialogs);
    logger('renameData: pg_map', pg_map)
    logger('renameData: toRename', toRename)

    if (!toRename.length) return;

    //TODO:合并raw值相同、node相同的toRename item

    //修改pg_map && 修改compiled
    toRename.forEach(({
        node,
        value,
        raw
    }) => {
        //修改pg_map
        if (~node.dataKeys[node.dataKeys.indexOf(raw)]) {
            node.dataKeys[node.dataKeys.indexOf(raw)] = value;
        }

        let script = getScript(node.compiled);

        //替换掉@@为合法标识符
        const pgHash = 'pg______' + Date.now();
        script = script.replace(/@@/g, pgHash)

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

        let newScript = babel_generator(ast).code;
        newScript = newScript.replace(new RegExp(pgHash, 'g'), '@@');

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
    const hooksName = ['created', 'mounted'];

    //替换掉@@为合法标识符
    const pgHash = 'pg______' + Date.now();
    script = script.replace(/@@/g, pgHash)

    var ast = babylon.parse(script, {
        sourceType: 'module'
    });

    let ret = {
        data: getData(ast, script),
        hooks: getHook(ast, script, hooksName),
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
                                    body: script.slice(p[i].argument.start, p[i].argument.end).match(/^\s*\{([\s\S]*)\}\s*$/)[1].replace(new RegExp(pgHash, 'g'), '@@')
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
                            body: script.slice(p.start, p.end).match(/^\s*\{([\s\S]*)\}\s*$/)[1].replace(new RegExp(pgHash, 'g'), '@@')
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
                            body: script.slice(methods.start, methods.end).match(/^\s*\{([\s\S]*)\}\s*$/)[1].replace(new RegExp(pgHash, 'g'), '@@')
                        }
                    };
                }
                break;
            }
        }
    }
}

function initMap(states) {
    pg_map.components = [];
    pg_map.dialogs = [];

    function doCompile(comObj, list) {
        let children = [];

        let compiled = compile(comObj, {
            insertChildren() {
                let subCom = comObj.subCom.filter((e) => {
                    return !e.__pg_slot__;
                });
                if (!subCom || !subCom.length) return '';
                subCom.forEach(comObj => {
                    doCompile(comObj, children)
                })
                return CHILDREN_PLACEHOLDER;
            },
            insertSlot(names) {
                let nameArr = names.split(',');
                let slotId = '';
                let subCom = comObj.subCom.filter((e) => {
                    if (e.__pg_slot__ && nameArr.includes(e.name)) {
                        slotId = e.__pg_slot__;
                        return true;
                    }
                });
                if (!subCom || !subCom.length) return '';
                subCom.forEach(comObj => {
                    doCompile(comObj, children)
                })
                return SLOT_PLACEHOLDER + slotId;
            }
        });
        let scriptData = getScriptData(compiled);
        list.push({
            comObj: comObj,
            dataKeys: scriptData.data.keys,
            methodsKeys: scriptData.methods.keys,
            compiled,
            children
        });
    }
    states.components.forEach((comObj) => {
        doCompile(comObj, pg_map.components)
    })
    states.dialogs.forEach((comObj) => {
        doCompile(comObj, pg_map.dialogs)
    })
    logger('init', pg_map)
}

module.exports = (states) => {
    initMap(states);
    return render(merge())
}