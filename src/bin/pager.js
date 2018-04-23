#!/usr/bin/env node

const prog = require('caporal');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');
const ncp = require('ncp');
const logger = require('../logger')('pager.js');

const rm = require('rimraf');
const nodeCleanup = require('node-cleanup');
const config = require('../config');
const {
    getCustomComponentAndArt,
    getOriginComponents,
    linkComponent
} = require('../lib/helper');
const start = require('../lib/start');
const create = require('../lib/create');

function resolveTarget(target) {
    let p = path.resolve(target)
    if (fs.existsSync(p)) {
        let stat = fs.statSync(p);
        if (stat.isDirectory()) {
            return path.join(p, config.target.pageName)
        } else if (stat.isFile()) {
            return path.join(p)
        } else {
            console.log(chalk.red(`${p} 不是文件夹或文件`))
            process.exit(1)
        }
    } else {
        if (fs.existsSync(path.dirname(p))) {
            return p
        } else {
            console.log(chalk.red(`${path.dirname(p)} 该目录不存在`))
            process.exit(1)
        }
    }
}

function resolveConfigDir(configDir) {
    let p = configDir ? path.resolve(configDir) : path.resolve(config.target.dir)

    //若文件不存在则创建文件夹，存在则检验是否文件夹
    if (!fs.existsSync(p)) {
        fs.mkdirsSync(p)
    } else if (!fs.statSync(p).isDirectory()) {
        console.log(`${chalk.red(p)} 不是文件夹`)
        process.exit(1)
    }
    return p;
}

function createTemporaryDir() {
    //确定临时目录路径
    let tempDirSuffix = Date.now();
    while (fs.existsSync(config.tempComponentDir + '_' + tempDirSuffix)) {
        tempDirSuffix = tempDirSuffix + 1;
    }
    let uniqueTempDir = config.tempComponentDir + '_' + tempDirSuffix;
    fs.mkdirsSync(uniqueTempDir)

    nodeCleanup((code) => {
        if (fs.existsSync(uniqueTempDir)) {
            logger('删除' + uniqueTempDir)

            rm.sync(uniqueTempDir);
        }
    })

    //将原生组件拷贝至临时目录
    fs.copySync(config.componentDir, uniqueTempDir)

    return uniqueTempDir;
}

prog
    .version('1.0.0')
    .command('start', 'launch GUI')
    .option('-c, --config <dir1>', 'config dir') //未指定则取当前目录下的.pager目录
    .option('-t, --target <dir1>', 'target') //可以是dir或file；dir:必须已存在 file:可存在可不存在，但其dirname必须存在
    .option('-p, --port <dir1>', 'port') //指定端口
    .action(function (args, options) {

        let describe = {}

        describe.configDir = resolveConfigDir(options.config)

        describe.target = options.target ? resolveTarget(options.target) : path.join(describe.configDir, config.target.pageName)

        describe.port = options.port || 8001;
        describe.temporaryDir = createTemporaryDir();

        linkComponent(describe.configDir, describe.temporaryDir).then(_ => {
            wrapCommand(start)(describe)
        }).catch(err => {
            console.log(err.message)
        })
    })

    .command('create', 'resolve data')
    .argument('<source>', 'source')
    .argument('[target]', 'target')
    .option('-c, --config <dir>', 'config dir')
    .action(function (args, options) {

        // const check = ora({
        //     text: 'checking format'
        // }).start();

        //验证/获取 pager path（逐级向上查找）
        let pagerPath = options.config && path.resolve(options.config);

        if (pagerPath) {
            if (!fs.existsSync(pagerPath)) {
                throw new Error(pagerPath + ' 不存在')
            } else if (!fs.statSync(pagerPath).isDirectory()) {
                throw new Error(pagerPath + ' 不是文件夹')
            }
        } else {
            pagerPath = path.resolve('.', config.target.dir);
            while (!fs.existsSync(pagerPath) || !fs.statSync(pagerPath).isDirectory()) {
                if (path.join(pagerPath, '..', config.target.dir) === path.join(pagerPath, '..', config.target.dir)) {
                    pagerPath = false;
                    break;
                }
                pagerPath = path.join(pagerPath, '..', config.target.dir)
            }
        }

        //获取source/target
        let sourcePath = path.resolve(args.source);
        if (!fs.existsSync(sourcePath)) {
            return console.error(chalk.red('source file is not exist'))
        } else if (!fs.statSync(sourcePath).isFile()) {
            return console.error(chalk.red('source must be file'))
        }

        //验证source是否为json文件
        if (path.extname(sourcePath) !== '.json') {
            return console.error(chalk.red('target file must be json'))
        }

        let targetDir = resolveTarget(args.target || '.');

        logger('源文件：' + sourcePath)
        logger('输出文件夹：' + targetDir)

        logger('pagerPath' + pagerPath)

        let uniqueTempDir = createTemporaryDir()

        if (pagerPath) {
            console.log(' pager 路径：' + pagerPath)
            linkComponent(pagerPath, uniqueTempDir).then(_ => {
                parse();
            }).catch(err => {
                console.log(err.message)
            })
        } else {
            parse(); //无自定义组件
        }

        function parse() {
            wrapCommand(create)({
                temporaryDir: uniqueTempDir,
                target: targetDir,
                source: sourcePath,
                configDir: pagerPath
            })
        }

    });

prog.parse(process.argv);

function wrapCommand(fn) {
    return (...args) => {
        return fn(...args).catch(err => {
            console.error(chalk.red(err.stack))
        })
    }
}