const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')
const ncp = require('ncp')
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
 * 获取用户自定义组件及其.art文件
 * @param {Path} root 组件文件夹
 * @return {art:{name:Path},dir:{name:Path}}
 */
function getCustomComponentAndArt(root) {
    let componentPaths = {
        art: {},
        comDir: {}
    }
    let dirs = fs.readdirSync(root, 'utf-8');
    dirs.forEach(dir => {
        let dirPath = path.resolve(root, dir);

        let stat = fs.statSync(dirPath);

        //忽略隐藏文件
        if (dir.startsWith('.')) return;

        if (path.extname(dir) === '.art' && stat.isFile()) {
            componentPaths.art[dir] = dirPath
        } else if (stat.isDirectory()) {
            let files = fs.readdirSync(dirPath, 'utf-8');
            let hasConfig, hasArt;
            files.forEach(file => {
                if (!fs.statSync(path.join(root, dir, file)).isFile()) return;
                file === dir + '.vue.art' && (hasArt = true);
                file === 'config.js' && (hasConfig = true);
            })
            if (hasConfig && hasArt) {
                componentPaths.comDir[dir] = dirPath
            } else {
                warn(`组件文件夹${dir}缺少 ${!hasConfig ? 'config.js' : ''} ${!hasArt ? dir+'.vue.art' : ''}`)
            }
        }
    })
    return componentPaths
}

/**
 * 获取本地组件（原生+自定义），自定义组件将覆盖原生组件
 * @param {Path} root 组件文件夹
 * @return {name:Path}
 */
function getLocalComponents(root) {
    if (!fs.existsSync(root)) throw new Error('路径 ' + root + ' 不存在')
    let dirs = fs.readdirSync(root, 'utf-8');
    let componentPaths = {};
    dirs.forEach(dir => {
        let dirPath = path.resolve(root, dir);
        if (fs.statSync(dirPath).isFile() || dir.startsWith('.')) return;
        componentPaths[dir] = dirPath
    })
    return componentPaths
}

/**
 * 拷贝用户自定义组件到本地
 * @param {String} targetDir .pager
 * @param {String} toDir ComponentsDir
 */
async function copyComponent(targetDir, toDir) {
    let comPath = path.join(targetDir, config.target.comDir);

    if (!fs.existsSync(comPath) || !fs.statSync(comPath).isDirectory()) {
        logger('自定义组件路径' + comPath + '不合法，不拷贝')
        return;
    }

    let allPaths = getCustomComponentAndArt(comPath);

    let originDirs = fs.readdirSync(toDir);

    let duplicated = Object.keys({...allPaths.comDir,...allPaths.art}).filter(name => {
        return originDirs.includes(name)
    })

    if (duplicated.length) {
        return inquirer.prompt([{
            type: 'confirm',
            name: 'isOverride',
            message: `是否覆盖原生组件/公用模板 ${duplicated.join(',')}`
        }]).then(answers => {
            if (answers.isOverride) {
                return buildLink(allPaths)
            } else {
                duplicated.forEach(name => {
                    if(allPaths.art[name]){
                        delete allPaths.art[name]
                    }else{
                        delete allPaths.comDir[name]
                    }
                })
                return buildLink(allPaths)
            }
        });
    } else {
        return buildLink(allPaths)
    }

    async function buildLink(validPath) {
        let promises = []

        Object.keys(validPath.comDir).forEach(name => {
            let p = validPath.comDir[name]
            try {
                checkConfig(require(path.join(p, 'config.js')));
            } catch (err) {
                throw new Error(`${name} 组件 config.js 格式错误:\n${err.message}`);
            }
            promises.push(fs.copy(p, path.join(toDir, name)).then(_ => {
                logger('已拷贝 ' + p + ' 至' + path.join(toDir, name))
            }))
        })
        Object.keys(validPath.art).forEach(name => {
            let p = validPath.art[name]
            promises.push(fs.copy(p, path.join(toDir, name)).then(_ => {
                logger('已拷贝 ' + p + ' 至' + path.join(toDir, name))
            }))
        })
        return Promise.all(promises)
    }
}

module.exports = {
    getCustomComponentAndArt,
    getLocalComponents,
    copyComponent,
    warn
}