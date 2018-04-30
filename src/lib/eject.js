const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const config = require('../config');
module.exports = async function (info) {
    let comPath = path.join(info.configDir, config.target.comDir)
    if (!fs.existsSync(comPath)) {
        fs.mkdirSync(comPath)
        console.log(chalk.cyan(`${comPath} created`))
    }
    let questions = info.names.reduce((queue, name) => {
        if (fs.existsSync(path.join(comPath, name))) {
            queue.push({
                type: 'confirm',
                name:name.replace(/\./g,'/'),
                message: `${name} 将被覆盖，是否覆盖？`
            })
        }
        return queue;
    }, [])
    return inquirer.prompt(questions).then(answers => {
        let promises = info.names.filter(name => {
            name = name.replace(/\./g,'/');
            return answers[name] !== false
        }).map(name => {
            return fs.copy(path.join(config.componentDir, name), path.join(comPath, name))
        })
        return Promise.all(promises).then(_ => {
            console.log(chalk.green('导出成功'))
        })
    })
}