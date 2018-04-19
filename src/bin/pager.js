#!/usr/bin/env node

const prog = require('caporal');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const parser = require('../server/parser');
const postProcessor = require('../server/postProcessor');
const ora = require('ora');
const ncp = require('ncp');
const logger = require('../logger')('bin');


const rm = require('rimraf');
const nodeCleanup = require('node-cleanup');
const {
    getPatchDefault
} = require('../type_parser');
const {
    checkData
} = require('../utils/checkTemplateValid');
const config = require('../config');
const {
    getCustomComponentAndArt,
    getOriginComponents,
    linkComponent

} = require('../server/util');
prog
    .version('1.0.0')
    .command('start', 'launch GUI')
    .option('-p, --output <dir1>', 'pager dir')
    .action(function (args, options) {
        let output = options.output ? path.resolve(options.output) : path.resolve(config.target.dir);

        //若文件不存在则创建文件夹，存在则检验是否文件夹
        if (!fs.existsSync(output)) {
            fs.mkdirSync(output)
        } else if (!fs.statSync(output).isDirectory()) {
            return console.log(`${chalk.red(output)} 不是文件夹`)
        }

        require('../server/server')(output)
    })


    .command('create', 'resolve data')
    .argument('<source>', 'source')
    .argument('[target]', 'target')
    .option('-p, --pager <dir>', '.pager dir')
    .action(function (args, options) {

        const check = ora({
            text: 'checking format'
        }).start();

        //验证/获取 pager path
        let pagerPath = options.pager && path.resolve(options.pager);

        if (pagerPath) {
            if (!fs.existsSync(pagerPath)) {
                throw new Error(pagerPath + ' 不存在')
            } else if (!fs.statSync(pagerPath).isDirectory()) {
                throw new Error(pagerPath + ' 不是文件夹')
            }
        } else {
            pagerPath = path.resolve('.',config.target.dir);
            while (!fs.existsSync(pagerPath) || !fs.statSync(pagerPath).isDirectory()) {
                if (path.join(pagerPath, '..', config.target.dir) === path.join(pagerPath, '..', config.target.dir)) {
                    pagerPath = false; //无自定义组件
                    break;
                }
                pagerPath = path.join(pagerPath, '..', config.target.dir)
            }
        }

        //获取source/target
        let sourcePath = path.resolve(args.source);
        let targetDir;
        if (args.target) {
            targetDir = path.resolve(args.target) //指定目录
        } else {
            targetDir = path.resolve('.') //否则为当前目录
        }

        //验证source/target
        if (!fs.existsSync(sourcePath)) {
            return check.fail(chalk.red('source file is not exist'))
        } else if (!fs.statSync(sourcePath).isFile()) {
            return check.fail(chalk.red('source must be file'))
        } else if (!fs.statSync(targetDir).isDirectory()) {
            return check.fail(chalk.red('target must be file'))
        }

        logger('源文件：' + sourcePath)
        logger('输出文件夹：' + targetDir)

        logger('pagerPath' + pagerPath)

        //验证source是否为json文件
        if (path.extname(sourcePath) !== '.json') {
            return check.fail(chalk.red('target file must be json'))
        }

        //确定临时目录路径
        let tempDirSuffix = Date.now();
        while (fs.existsSync(config.tempComponentDir + '_' + tempDirSuffix)) {
            tempDirSuffix = tempDirSuffix + 1;
        }

        let uniqueTempDir = config.tempComponentDir + '_' + tempDirSuffix;

        //将原生组件、自定义组件拷贝至临时目录
        ncp(config.componentDir, uniqueTempDir, {
            filter(filename) {
                return filename !== '.custom';
            }
        }, (err) => {
            if (err) throw err;

            logger('已拷贝 ' + config.componentDir + ' 至' + uniqueTempDir)

            nodeCleanup((code) => {
                if (fs.existsSync(uniqueTempDir)) {
                    logger('删除' + uniqueTempDir)

                    rm.sync(uniqueTempDir);
                }
            })

            if (pagerPath && fs.existsSync(path.join(pagerPath, config.target.comDir)) && fs.statSync(path.join(pagerPath, config.target.comDir)).isDirectory()) {
                linkComponent(pagerPath, uniqueTempDir).then(_ => {
                    parse();
                }).catch(err => {
                    throw err;
                })
            } else {
                parse(); //无自定义组件
            }
        })

        //解析、写入结果
        function parse() {

            let json = require(sourcePath);

            let comPaths = getOriginComponents(uniqueTempDir)

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
                check.fail(path.basename(sourcePath) + '解析错误')
                console.log(chalk.red(err.message))
                process.exit(1);
            }
            check.succeed();

            //patch default
            function patchDefault(list) {
                if (!list) return [];
                list.forEach(item => {
                    item.props = Object.keys(item.props).reduce((target, propName) => {
                        let conf = allComsConfig[item.type].props.find(e => {
                            return e.name === propName;
                        })

                        target[propName] = getPatchDefault(conf.value).call(conf, item.props[propName]);
                        return target
                    }, {})
                    item.children = patchDefault(item.children);
                    return item;
                })
                return list;
            }
            json = patchDefault(json);

            let data = parser(json, allComsConfig)

            const generating = ora({
                text: 'generating page'
            }).start();

            let ret
            try {
                ret = postProcessor(data, comPaths)
            } catch (err) {
                generating.fail();
                throw err;
            }



            fs.writeFile(path.join(targetDir, config.target.pageName), ret, (err) => {
                if (err) throw err;
                generating.succeed(`${chalk.green(config.target.pageName)} is created in ${chalk.green(targetDir)}`)
            })
        }

    });

prog.parse(process.argv);