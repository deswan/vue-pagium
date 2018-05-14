const path = require('path')
const fs = require('fs-extra')

const template = require('./art');
const vueCompiler = require('@vue/component-compiler-utils');

function compile(name, comPath, props) {
    Object.assign(template.defaults.imports, {
        insertChildren() {
            return '<slot></slot>'
        },
        insertSlot(arg) {
            return '';
        },
        refer(arg, property, modifier) {
            return 'SOME_REFER'
        }
    })
    template.defaults.root = path.dirname(comPath);
    let config = require(path.join(comPath, 'config.js'));
    let compiled = template(path.join(comPath, name + '.vue.art'), props)
    let replaced = compiled.replace(/@@([$a-zA-Z][$\w]*)?(:[$a-zA-Z][$\w]*)?/g, function (input, varName, modifier) {
        modifier && (modifier = modifier.slice(1))
        if (modifier === 'wrapper') {
            return '';
        } else {
            return varName;
        }
    })

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
        return sfc ? vue.slice(sfc.start, sfc.end).trim() : '';
    }

    //替换export default
    let script = getScript(replaced);
    let newScript = script.replace('export default', 'module.exports =');
    replaced = replaced.replace(script, newScript)

    //替换el-dialog
    if (config.isDialog) {
        replaced = replaceSingleDialog(replaced);
    }

    function replaceSingleDialog(vue) {
        let template = getHtml(vue);
        let newTemplate = template.replace(/<el-dialog([^>]*)>/g, '<pagium-dialog2018$1>').replace(/<\/el-dialog\s*>/g, '</pagium-dialog2018>')
        return vue.replace(template, newTemplate);
    }
    return replaced;

}

module.exports = compile