const logger = require('../logger')('create');
const {
    checkData
} = require('../utils/checkTemplateValid');
const {
    getPatch
} = require('../type_parser');
const {
    getOriginComponents,
} = require('../lib/helper');
const parser = require('../lib/parser');
const path = require('path');
const compile = require('../lib/compile');
const fs = require('fs-extra');


module.exports = async function (info) {
    let json = require(info.source);

    let comPaths = getOriginComponents(info.temporaryDir)

    logger('comsPath', comPaths)

    let customAndOrigin = {
        ...comPaths.origin,
        ...comPaths.custom
    };

    let allComsConfig = Object.keys(customAndOrigin).reduce((target, name) => {
        target[name] = require(path.join(customAndOrigin[name], 'config.js'))
        return target;
    }, {})

    //验证data的有效性
    try {
        checkData(json, allComsConfig)
    } catch (err) {
        throw new Error(path.basename(info.source) + ' 解析错误\n' + err.message)
    }

    //patch default
    function patch(list) {
        if (!list) return [];
        list.forEach(item => {
            item.props = Object.keys(item.props).reduce((target, propName) => {
                let conf = allComsConfig[item.type].props.find(e => {
                    return e.name === propName;
                })

                target[propName] = getPatch(conf.value).call(conf, item.props[propName]);
                return target
            }, {})
            item.children = patch(item.children);
            return item;
        })
        return list;
    }
    json = patch(json);

    let data = parser(json, allComsConfig)

    const generating = ora({
        text: 'generating page'
    }).start();

    return compile(data, comPaths, info.temporaryDir).then(output => {
        return fs.outputFile(info.target, output)
    }).then(_ => {
        generating.succeed(`${chalk.green(path.basename(info.target))} is created in ${chalk.green(info.target)}`)
    }).catch(err => {
        generating.fail();
        throw err;
    })

}