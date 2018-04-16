#!/usr/bin/env node

const prog = require('caporal');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const parser = require('../server/parser');
const postProcessor = require('../server/postProcessor');
const ora = require('ora');
const {
    getAllComponent
} = require('../server/util');
prog
    .version('1.0.0')
    .command('start', 'launch GUI')
    .option('-p, --output <dir1>', 'output dir')
    .action(function (args, options, logger) {
        let output = output ? path.resolve(options.output) : path.resolve('./.pager');

        try {
            if (!fs.existsSync(output)) {
                fs.mkdirSync(output)
            } else if (!fs.statSync(output).isDirectory()) {
                return console.log(`${chalk.red(output)} 不是文件夹`)
            }
            require('../server/server')(output)
        } catch (err) {
            throw err;
        }
    })


    .command('create', 'resolve data')
    .argument('<source>', 'source')
    .argument('[target]', 'target')
    .action(function (args, options, logger) {
        const check = ora({
            text: 'checking format'
        }).start();

        let sourcePath = path.resolve(args.source);
        let targetDir;
        if (args.target) {
            targetDir = path.resolve(args.target)
        } else {
            targetDir = path.dirname(sourcePath)
        }

        if (!fs.existsSync(sourcePath)) {
            return check.fail(chalk.red('source file is not exist'))
        } else if (!fs.statSync(sourcePath).isFile()) {
            return check.fail(chalk.red('source must be file'))
        } else if (!fs.statSync(targetDir).isDirectory()) {
            return check.fail(chalk.red('target must be file'))
        }

        let sourceFile = fs.readFileSync(sourcePath, 'utf-8');
        let json;
        try {
            json = JSON.parse(sourceFile)
        } catch (err) {
            check.fail(chalk.red('target file must be json'))
        }
        check.succeed('valid format')

        let componentPaths = getAllComponent()

        let components = parser(json, Object.keys(componentPaths).reduce((target, name) => {
            target[name] = require(path.join(componentPaths[name], 'config.js'))
        }, {}))

        const spinner = ora({
            text: 'generating page'
        }).start();
        let ret = postProcessor(components)
        fs.writeFile(path.join(targetDir, 'Page.vue'), ret, (err) => {
            if (err) throw err;
            spinner.succeed(`${chalk.green('Page.vue')} is created in ${chalk.green(targetDir)}`)
        })
    });

prog.parse(process.argv);