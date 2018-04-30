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
    copyComponent
} = require('../lib/helper');
const start = require('../lib/start');
const create = require('../lib/create');
const eject = require('../lib/eject');
const {
    checkConfig
} = require('../utils/checkConfigValid');

function resolveTarget(target) {
    let p = path.resolve(target)
    if (fs.existsSync(p)) {
        let stat = fs.statSync(p);
        if (stat.isDirectory()) {
            return path.join(p, config.target.pageName)
        } else if (stat.isFile()) {
            return p
        } else {
            throw new Error(`${p} 不是文件夹或文件`)
        }
    } else {
        if (fs.existsSync(path.dirname(p))) {
            return p
        } else {
            throw new Error(`${path.dirname(p)} 该目录不存在`)
        }
    }
}

function resolveConfigDir(configDir) {
    let p = configDir ? path.resolve(configDir) : path.resolve(config.target.dir)

    //若文件不存在则创建文件夹，存在则检验是否文件夹
    if (!fs.existsSync(p)) {
        fs.mkdirsSync(p)
        console.log(chalk.cyan(`${p} created`))
    } else if (!fs.statSync(p).isDirectory()) {
        throw new Error(`${p} 不是文件夹`)
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

    if (process.env.NODE_ENV === 'development') uniqueTempDir = config.devTempComponentDir;

    fs.mkdirsSync(uniqueTempDir)

    nodeCleanup((code) => {
        if (fs.existsSync(uniqueTempDir)) {
            logger('删除' + uniqueTempDir)

            rm.sync(uniqueTempDir);
        }
    })

    //将原生组件拷贝至临时目录
    fs.copySync(config.componentDir, uniqueTempDir);

    if (process.env.NODE_ENV === 'development') {
        let dirs = fs.readdirSync(config.componentDir);
        dirs.forEach(filename => {
            if (!fs.statSync(path.join(config.componentDir, filename)).isDirectory()) return;
            try {
                checkConfig(require(path.join(config.componentDir, filename, 'config.js')));
            } catch (err) {
                throw new Error(`${filename} 组件 config.js 格式错误:\n${err.message}`);
            }
        })
    }

    return uniqueTempDir;
}

prog
    .version('1.0.0')
    .command('start', 'launch GUI')
    .option('-c, --config <dir1>', 'config dir') //未指定则取当前目录下的.pager目录
    .option('-t, --target <dir1>', 'target') //可以是dir或file；dir:必须已存在 file:可存在可不存在，但其dirname必须存在
    .option('-p, --port <dir1>', 'port') //指定端口
    .action(wrapCommand(beforeStart))

    .command('create', 'resolve data')
    .argument('<source>', 'source')
    .argument('[target]', 'target')
    .option('-c, --config <dir>', 'config dir')
    .action(wrapCommand(beforeCreate))

    .command('eject', 'eject components')
    .argument('[names]', 'choose component/art to eject', prog.LIST, [])
    .option('-c, --config <dir>', 'config dir')
    .action(wrapCommand(beforeEject));

prog.parse(process.argv);

async function beforeEject(args, options) {
    let describe = {}

    let dirs = fs.readdirSync(config.componentDir).filter(e => {
        return !e.startsWith('.');
    });
    args.names.forEach(name => {
        if (!dirs.includes(name)) {
            console.log(chalk.red(`eject fail: 组件/公用文件 ${name} 不存在`))
            process.exit(1);
        }
    })
    if (!args.names.length) {
        args.names = dirs
    }

    describe.names = args.names;
    describe.configDir = resolveConfigDir(options.config)
    console.log(chalk.white(`config dir: ${describe.configDir}`))

    return await eject(describe);
}

async function beforeStart(args, options) {
    let describe = {}

    describe.configDir = resolveConfigDir(options.config)
    console.log(chalk.white(`config dir: ${describe.configDir}`))

    if (fs.existsSync(path.join(describe.configDir, 'Page.art'))) {
        describe.vueTemplate = path.join(describe.configDir, 'Page.art')
    }

    describe.target = options.target ? resolveTarget(options.target) : path.join(describe.configDir, config.target.pageName)
    console.log(chalk.white(`target file: ${describe.target}`))

    describe.port = options.port || 8001;

    describe.temporaryDir = createTemporaryDir();

    return await copyComponent(describe.configDir, describe.temporaryDir).then(_ => {
        start(describe)
    })
}

async function beforeCreate(args, options) {
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
    console.log(chalk.white(`config dir: ${pagerPath || 'none'}`))

    let vueTemplate;
    if (pagerPath && fs.existsSync(path.join(pagerPath, 'Page.art'))) {
        vueTemplate = path.join(pagerPath, 'Page.art')
    }

    //获取source/target
    let sourcePath = path.resolve(args.source);
    if (!fs.existsSync(sourcePath)) {
        throw new Error('source file is not exist')
    } else if (!fs.statSync(sourcePath).isFile()) {
        throw new Error('source must be file')
    }

    //验证source是否为json文件
    if (path.extname(sourcePath) !== '.json') {
        throw new Error('target file must be json')
    }

    let target = resolveTarget(args.target || '.');

    console.log(chalk.white(`target file: ${target}`))


    logger('源文件：' + sourcePath)
    logger('输出文件：' + target)

    logger('pagerPath' + pagerPath)

    let uniqueTempDir = createTemporaryDir()

    if (pagerPath) {
        return copyComponent(pagerPath, uniqueTempDir).then(_ => {
            return parse();
        })
    } else {
        return parse(); //无自定义组件
    }

    async function parse() {
        return create({
            temporaryDir: uniqueTempDir,
            target,
            source: sourcePath,
            configDir: pagerPath,
            vueTemplate
        })
    }
}

function wrapCommand(fn) {
    return (...args) => {
        return fn(...args).catch(err => {
            console.error(chalk.red(err.stack))
        })
    }
}