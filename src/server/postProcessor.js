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

const Log = require('log');
const log = new Log('debug', fs.createWriteStream('./my.log'))

let pg_map = {
    components: [],
    dialogs: []
}

//全局替换标识符 @@varName -> varName
function replaceIdentifier(vueText, comObj) {
    let {
        data,
        methods
    } = getScriptData(vueText);
    let comName = comObj.name;
    let regExp = /@@(\D[$\w]*)/g;
    let replacedVueText = vueText.replace(regExp, (match, word) => {
        if (!~data.keys.indexOf(word) && !~methods.keys.indexOf(word)) {
            throw new Error('data 或 methods 标识符不存在：' + match)
        } else if (~data.keys.indexOf(word)) { //data
            return comName + '.' + word;
        } else { //methods
            return word;
        }
    })
    return replacedVueText
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
    let html = '';
    let data = '';
    let methods = '';
    let hooks = {};
    let AllMethodsKey = [];

    function renameMethodKey(comObj, key) {
        if (~AllMethodsKey.indexOf(key)) {
            key = comObj.name + key.replace(/^./, (val) => {
                return val.toUpperCase();
            });
            while (~AllMethodsKey.indexOf(key)) {
                key = key + '$'
            }
            return key;
        } else {
            return false
        }
    }

    pg_map.components.forEach(pg_com => {
        let {
            comObj,
            compiled,
            methodsKeys
        } = pg_com;
        let methodsNeedRename = {}
        let newMethods = [];
        methodsKeys.forEach((key) => {
            let newKey;
            if (newKey = renameMethodKey(comObj, key)) {
                methodsNeedRename[key] = newKey
            } else {
                newKey = key
            }
            newMethods.push(newKey);
        })
        pg_com.methodsKeys = newMethods;
        AllMethodsKey = AllMethodsKey.concat(newMethods)
        let renamed = renameMethods(compiled, methodsNeedRename)
        let replaced = replaceIdentifier(renamed, comObj);
        html += getHtml(replaced);
        let scriptData = getScriptData(replaced);
        if (scriptData.data.body.trim()) {
            scriptData.data.body.trimRight().slice(-1) == ',' && (scriptData.data.body = scriptData.data.body.trimRight().slice(0, -1))
            data += `${comObj.name}:{${scriptData.data.body}},`
        }
        if (scriptData.methods.body.trim()) {
            scriptData.methods.body.trimRight().slice(-1) != ',' && (scriptData.methods.body = scriptData.methods.body.trimRight() + ',')
            methods += scriptData.methods.body
        }
        Object.keys(scriptData.hooks).forEach((hook) => {
            if (scriptData.hooks[hook].body.trim()) {
                hooks[hook] === undefined && (hooks[hook] = '');
                hooks[hook] += scriptData.hooks[hook].body
            }
        })
    })

    return {
        html,
        data,
        methods,
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
function compile(comObj) {
    var comType = comObj.type;
    let config = require(path.join(componentDir, comType, 'config.js'));
    let vueText = template(path.join(componentDir, comType, comType + '.vue.art'), Object.assign(scheme2Default(config.props), comObj.props))
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

function renameMethods(compiled, methodsNeedRename) {
    if (!Object.keys(methodsNeedRename).length) return compiled;
    let script = getScript(compiled);

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
                        if (methodsNeedRename[val.key.name]) {
                            val.key.name = methodsNeedRename[val.key.name];
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

    newVue = compiled.replace(script, newScript);

    newVue = newVue.replace(new RegExp('@@(' + Object.keys(methodsNeedRename).join('|') + ')', 'g'), (val, word) => {
        return '@@' + methodsNeedRename[word];
    })

    log.debug('renameMethods script', methodsNeedRename)
    log.debug('renameMethods script', newVue)
    return newVue;
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
    states.components.forEach((comObj) => {
        let compiled = compile(comObj);
        let scriptData = getScriptData(compiled);
        pg_map.components.push({
            comObj: comObj,
            dataKeys: scriptData.data.keys,
            methodsKeys: scriptData.methods.keys,
            compiled
        })
    })
}

module.exports = (states) => {
    initMap(states);
    return render(merge())
}