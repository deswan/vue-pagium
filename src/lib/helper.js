const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')
const ncp = require('ncp')
const fsExtra = require('fs-extra')
const logger = require('../logger')('lib/helper')
const constant = require('../const')
const config = require('../config');
const {
    checkConfig
} = require('../utils/checkConfigValid');

function getCustomComponentAndArt($dir) {
    let componentPaths = {
        art: {},
        dir: {}
    }
    let dirs = fs.readdirSync($dir, 'utf-8');
    dirs.forEach(dir => {
        let dirPath = path.resolve($dir, dir);

        let stat = fs.statSync(dirPath);

        if (path.extname(dir) === '.art' && stat.isFile()) {
            componentPaths.art[dir] = dirPath
        } else if (stat.isDirectory()) {
            let files = fs.readdirSync(dirPath, 'utf-8');
            let hasConfig, hasVue, hasArt;
            files.forEach(file => {
                let filePath = path.join($dir, dir, file);
                if (!fs.statSync(filePath).isFile()) return;
                if (file === dir + '.vue') {
                    hasVue = true;
                } else if (file === dir + '.vue.art') {
                    hasArt = true;
                } else if (file === 'config.js') {
                    hasConfig = true;
                }
            })
            if (hasConfig && hasArt && hasVue) {
                componentPaths.dir[dir] = dirPath
            } else {
                throw new Error(`组件文件夹${dir}缺少config.js/Vue组件/模板文件`)
            }
        }
    })
    return componentPaths
}

function getOriginComponents(root = config.componentDir) {
    let componentPaths = {
        custom: {},
        origin: {}
    }
    let customNames = [];
    if (fs.existsSync(path.join(root, '.custom'))) {
        let customDirs = fs.readdirSync(path.join(root, '.custom'), 'utf-8');
        customDirs.forEach(dir => {
            let dirPath = path.resolve(root, '.custom', dir);
            if (fs.statSync(dirPath).isFile()) return;
            customNames.push(dir);
            componentPaths.custom[dir] = dirPath
        })
    }

    let dirs = fs.readdirSync(root, 'utf-8');
    dirs.forEach(dir => {
        let dirPath = path.resolve(root, dir);
        if (fs.statSync(dirPath).isFile() || customNames.includes(dir) || dir.startsWith('.')) return;
        componentPaths.origin[dir] = dirPath
    })

    return componentPaths
}

/**
 * 拷贝用户自定义组件到src/Components中
 * @param {String} targetDir .pager
 * @param {String} toDir Components
 */
function linkComponent(targetDir, toDir) {
    return new Promise((resolve, reject) => {

        let comPath = path.join(targetDir, config.target.comDir);

        let customPath = path.join(toDir, '.custom');
        if (!fs.existsSync(customPath)) {
            logger('创建 .custom ：' + customPath)
            fs.mkdirSync(customPath)
        }

        if (!fs.existsSync(comPath) || !fs.statSync(comPath).isDirectory()) {
            logger('自定义组件路径' + comPath + '不合法，不拷贝')
            return resolve();
        }

        let allPaths = getCustomComponentAndArt(comPath);

        let duplicated = Object.keys(allPaths.dir).find(name => {
            return constant.ORIGINAL_COMPONENTS.includes(name)
        })

        if (duplicated) {
            inquirer.prompt([{
                type: 'confirm',
                name: 'isOverride',
                message: `是否覆盖原生组件 ${duplicated}`
            }]).then(answers => {
                if (answers.isOverride) {
                    buildLink(allPaths)
                } else {
                    delete allPath.dir[duplicated]
                    buildLink(allPaths)
                }
            });
        } else {
            buildLink(allPaths)
        }

        function buildLink(validPath) {

            let counter = Object.keys(validPath.art).length + Object.keys(validPath.dir).length;

            end();

            Object.keys(validPath.dir).forEach(name => {
                let p = validPath.dir[name]
                try {
                    checkConfig(require(path.join(p, 'config.js')));
                } catch (err) {
                    throw new Error(chalk.red(`${name} 组件 config.js 格式错误:`)+'\n'+chalk.white(err.message));
                }
                logger('config after check',require(path.join(p, 'config.js')))
                fsExtra.copy(p, path.join(customPath, name), (err) => {
                    if (err) throw err;
                    logger('已拷贝 ' + p + ' 至' + path.join(customPath, name))
                    counter--;
                    end()
                })
            })
            Object.keys(validPath.art).forEach(name => {
                let p = validPath.art[name]
                fsExtra.copy(p, path.join(customPath, name), (err) => {
                    if (err) throw err;
                    logger('已拷贝 ' + p + ' 至' + path.join(customPath, name))

                    counter--;
                    end()
                })
            })

            function end() {
                if (!counter) {
                    resolve()
                }
            }
        }
    })
}

module.exports = {
    getCustomComponentAndArt,
    getOriginComponents,
    linkComponent
}