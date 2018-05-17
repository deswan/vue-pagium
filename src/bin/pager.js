#!/usr/bin/env node

const prog = require('caporal');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');
const logger = require('../logger')('pager.js');

const rm = require('rimraf');
const nodeCleanup = require('node-cleanup');
const config = require('../config');
const {
    getComponents
} = require('../lib/helper');
const start = require('../lib/start');
const create = require('../lib/create');
const eject = require('../lib/eject');
const add = require('../lib/add');
const {
    checkConfig
} = require('../utils/checkConfigValid');

process.env.NODE_ENV = process.env.NODE_ENV || 'production'

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
        console.log(chalk.cyan(`配置目录 ${p} 已创建`))
    } else if (!fs.statSync(p).isDirectory()) {
        throw new Error(`${p} 不是文件夹`)
    }
    return p;
}

function getPages(configDir) {
    let p = path.join(configDir, config.target.pages);
    let pages = {};
    if (fs.existsSync(p)) {
        fs.readdirSync(p).forEach(file => {
            if (!file.startsWith('.') && file.endsWith('.vue.art') && fs.statSync(path.join(p, file)).isFile()) {
                pages[path.basename(file, '.vue.art')] = path.join(p, file)
            }
        })
    }
    return pages;
}

prog
    .version('1.0.0')
    .command('start', 'launch GUI')
    .option('-c, --config <dir1>', 'config dir') //未指定则取当前目录下的.pager目录
    .option('-t, --target <dir1>', 'target') //可以是dir或file；dir:必须已存在 file:可存在可不存在，但其dirname必须存在
    .action(wrapCommand(beforeStart))

    .command('create', 'resolve data')
    .argument('<source>', 'source')
    .argument('[target]', 'target')
    .option('-c, --config <dir>', 'config dir')
    .action(wrapCommand(beforeCreate))

    .command('eject', 'eject components')
    .argument('[names]', 'choose component/art to eject', prog.LIST, [])
    .option('-c, --config <dir>', 'config dir')
    .action(wrapCommand(beforeEject))

    .command('add', 'add component')
    .argument('<name>', 'component name')
    .option('-c, --config <dir>', 'config dir')
    .action(wrapCommand(beforeAdd));

prog.parse(process.argv);

async function beforeAdd(args, options) {
    let info = {}
    info.configDir = resolveConfigDir(options.config)
    info.comName = args.name;
    console.log(chalk.white('----------------------'))
    console.log(chalk.white(`配置目录: ${info.configDir}`))
    console.log(chalk.white('----------------------'))
    return await add(info);
}

async function beforeEject(args, options) {
    let info = {}

    let dirs = fs.readdirSync(config.componentDir).filter(e => {
        return !e.startsWith('.');
    });
    args.names.forEach(name => {
        if (!dirs.includes(name)) {
            console.log(chalk.red(`eject fail: 系统自带组件 ${name} 不存在`))
            process.exit(1);
        }
    })
    if (!args.names.length) {
        args.names = dirs
    }

    info.names = args.names;
    info.configDir = resolveConfigDir(options.config)
    console.log(chalk.white('----------------------'))
    console.log(chalk.white(`配置目录: ${info.configDir}`))
    console.log(chalk.white('----------------------'))

    return await eject(info);
}

async function beforeStart(args, options) {
    let info = {}

    info.configDir = resolveConfigDir(options.config)

    console.log(chalk.white('----------------------'))
    console.log(chalk.white(`配置目录: ${info.configDir}`))

    info.pages = getPages(info.configDir)

    info.target = resolveTarget(options.target || info.configDir);
    console.log(chalk.white(`输出目标位置: ${info.target}`))
    console.log(chalk.white('----------------------'))

    info.port = process.env.PORT || 8001;

    info.componentPaths = {};
    if (fs.existsSync(path.join(info.configDir, config.target.comDir))) {
        info.componentPaths = getComponents(path.join(info.configDir, config.target.comDir))
    } else { //无自定义组件
        info.componentPaths = getComponents(config.componentDir)
    }

    return start(info);
}

async function beforeCreate(args, options) {
    //验证/获取 pager path（逐级向上查找）
    let configDir = options.config && path.resolve(options.config);
    if (configDir) {
        configDir = resolveConfigDir(configDir)
    } else {
        configDir = path.resolve('.', config.target.dir);
        while (!fs.existsSync(configDir) || !fs.statSync(configDir).isDirectory()) {
            if (configDir === path.join(configDir, '../../', config.target.dir)) {
                configDir = false;
                break;
            }
            configDir = path.join(configDir, '../../', config.target.dir)
        }
    }
    console.log(chalk.white('----------------------'))

    console.log(chalk.white(`配置目录: ${configDir || 'none'}`))

    let pages = getPages(info.configDir)

    let target = resolveTarget(args.target || '.');

    console.log(chalk.white(`输出目标位置: ${target}`))
    console.log(chalk.white('----------------------'))

    //获取source
    let sourcePath = path.resolve(args.source);
    if (!fs.existsSync(sourcePath)) {
        throw new Error('source file is not exist')
    } else if (!fs.statSync(sourcePath).isFile()) {
        throw new Error('source must be file')
    }

    //验证source是否为json文件
    if (path.extname(sourcePath) !== '.json') {
        throw new Error('source file must be json')
    }

    //是否合法json
    let source;
    try {
        source = require(sourcePath);
    } catch (err) {
        throw new Error('source file must be valid json')
    }

    let componentPaths = {};
    if (configDir && fs.existsSync(path.join(configDir, config.target.comDir))) {
        componentPaths = getComponents(path.join(configDir, config.target.comDir))
    } else { //无自定义组件
        componentPaths = getComponents(config.componentDir)
    }

    return create({
        componentPaths,
        target,
        source,
        configDir,
        pages
    })
}

function wrapCommand(fn) {
    return (...args) => {
        return fn(...args).catch(err => {
            console.error(chalk.red(err.stack))
        })
    }
}