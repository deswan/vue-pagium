const path = require('path')
const fs = require('fs-extra')
const helpers = require('./helper')

const template = require('./art');

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

    //替换export default
    let newScript = helpers.getSFCText(replaced, 'script').replace('export default', 'module.exports =');
    replaced = helpers.replaceSFC(replaced, 'script', newScript)

    //替换el-dialog
    replaced = replaceSingleDialog(replaced);

    function replaceSingleDialog(vue) {
        let template = helpers.getSFCText(vue, 'template').replace(/<el-dialog([^>]*)>/g, '<pagium-dialog2018$1>').replace(/<\/el-dialog\s*>/g, '</pagium-dialog2018>')
        return helpers.replaceSFC(vue, 'template', template);
    }
    return replaced;

}

module.exports = compile