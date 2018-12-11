const json2compile = require('../json2compile');
const path = require('path');
const compile = require('../compile');
const fs = require('fs-extra');
const chalk = require('chalk');

module.exports = async function (info) {

    let allComsConfig = Object.keys(info.componentPaths).reduce((target, name) => {
        target[name] = require(path.join(info.componentPaths[name], 'config.js'))
        return target;
    }, {})

    let output = json2compile(info.source, allComsConfig, info.pages)

    return compile(output, info.componentPaths, info.pages).then(output => {
        return fs.outputFile(info.target, output)
    }).then(_ => {
        console.log(chalk.green(`${info.target} 创建成功`))
    }).catch(err => {
        throw err;
    })

}