const logger = require('../logger')('create');
const checkData = require('../utils/checkDataValid');
const {
    getPatch
} = require('../type_parser');
const {
    getLocalComponents,
} = require('../lib/helper');
const json2compile = require('./json2compile');
const path = require('path');
const compile = require('../lib/compile');
const utils = require('../utils/utils');
const fs = require('fs-extra');
const ora = require('ora');
const chalk = require('chalk');


module.exports = async function (info) {
    let json = require(info.source);

    let comPaths = getLocalComponents(info.temporaryDir)

    logger('comsPath', comPaths)

    let allComsConfig = Object.keys(comPaths).reduce((target, name) => {
        target[name] = require(path.join(comPaths[name], 'config.js'))
        return target;
    }, {})

    let data = json2compile(json, allComsConfig)

    const generating = ora({
        text: 'generating page'
    }).start();

    return compile(data, comPaths, info.temporaryDir,info.vueTemplate).then(output => {
        return fs.outputFile(info.target, output)
    }).then(_ => {
        generating.succeed(`${chalk.green(path.basename(info.target))} is created in ${chalk.green(info.target)}`)
    }).catch(err => {
        generating.fail();
        throw err;
    })

}