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

function warn(info) {
    console.warn(chalk.yellow(info))
}

/**
 * 获取用户所有组件路径
 * @param {Path} root 组件文件夹
 * @return {art:{name:Path},dir:{name:Path}}
 */
function getComponents(root) {
    let customPaths = {}
    let localPaths = {}
    
    config.componentDir !== root && getComs(config.componentDir,localPaths)
    getComs(root,customPaths)
    
    let duplicatedComs = [];
    Object.keys(customPaths).forEach(comName=>{
        if(localPaths[comName]){
            delete localPaths[comName];
            duplicatedComs.push(comName);
        }
    })
    if (duplicatedComs.length) {
        warn(`系统自带组件 ${duplicatedComs.join(',')} 将被覆盖`)
    }

    function getComs(root,target) {
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
                    target[dir] = dirPath
                } else {
                    warn(`组件文件夹${dir}缺少 ${!hasConfig ? 'config.js' : ''} ${!hasArt ? dir+'.vue.art' : ''}`)
                }
            }
        })
    }
    return {
        custom:customPaths,
        local:localPaths
    }
}

module.exports = {
    getComponents,
    // getLocalComponents,
    // copyComponent,
    warn
}