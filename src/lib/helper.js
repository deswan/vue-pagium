const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')
const logger = require('../logger')('lib/helper')
const constant = require('../const')
const config = require('../config');
const {
    checkConfig
} = require('../utils/checkConfigValid');
const vueCompiler = require('@vue/component-compiler-utils');

function warn(info) {
    console.warn(chalk.yellow(info))
}

/**
 * 获取用户所有组件路径
 * @param {Path} root 组件文件夹
 * @return {art:{name:Path},dir:{name:Path}}
 */
function getComponents(root) {
    let paths = {}

    let duplicatedComs = [];
    config.componentDir !== root && getComs(config.componentDir, paths)
    getComs(root, paths)

    if (duplicatedComs.length) {
        warn(`系统自带组件 ${duplicatedComs.join(',')} 将被覆盖`)
    }

    function getComs(root, target) {
        fs.readdirSync(root).forEach(dir => {
            if (dir.startsWith('.')) return;

            let dirPath = path.resolve(root, dir);

            if (fs.statSync(dirPath).isDirectory()) {
                let files = fs.readdirSync(dirPath);
                let hasConfig, hasArt;
                files.forEach(file => {
                    if (!fs.statSync(path.join(root, dir, file)).isFile()) return;
                    file === dir + '.vue.art' && (hasArt = true);
                    file === 'config.js' && (hasConfig = true);
                })
                if (hasConfig && hasArt) {
                    try{
                        checkConfig(require(path.join(dirPath, 'config.js')));
                    }catch(err){
                        throw new Error(`${dir}/config.js 错误：${err.message}`)
                    }
                    if (target[dir]) {
                        delete target[dir]
                        duplicatedComs.push(dir)
                    }
                    target[dir] = dirPath
                } else {
                    warn(`组件文件夹${dir}缺少 ${!hasConfig ? 'config.js' : ''} ${!hasArt ? dir+'.vue.art' : ''}`)
                }
            }
        })
    }
    return paths
}

function getSFCText(vue, type) {
    let sfc = vueCompiler.parse({
        source: vue,
        needMap: false
    })[type];
    return sfc ? vue.slice(sfc.start, sfc.end) : null
}

function replaceSFC(vue, type, text) {
    let sfc = vueCompiler.parse({
        source: vue,
        needMap: false
    })[type];
    if (sfc) {
        let vueArr = vue.split('');
        vueArr.splice(sfc.start, sfc.end - sfc.start, text);
        return vueArr.join('');
    } else {
        return vue;
    }
}


module.exports = {
    getComponents,
    warn,
    getSFCText,
    replaceSFC
}