const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const config = require('../config');

function configExample(comName) {
    return `
module.exports = {
    name: '${comName[0].toLowerCase() + comName.slice(1)}',
    description:''
    isDialog:false,
    exposeProperty:[],
    props: [{
        name: "argName",
        label: "参数标注名",
        type: "string",
    }]
}
    `.trim();
}

function artExample(comName) {
    return `
<template>

</template>

<script>
export default {
    data() {
        return {

        };
    }
};
</script>

<style>
</style>
    `.trim();
}
module.exports = async function (info) {
    let comPath = path.join(info.configDir, config.target.comDir)
    if (!fs.existsSync(comPath)) {
        fs.mkdirSync(comPath)
        console.log(chalk.cyan(`${comPath} 已创建`))
    }
    if (fs.existsSync(path.join(comPath, info.comName))) {
        console.log(chalk.red(`组件文件夹 ${info.comName} 已存在`));
        process.exit(1);
    }
    Promise.all([
        fs.outputFile(path.join(comPath, info.comName, 'config.js'), configExample(info.comName)),
        fs.outputFile(path.join(comPath, info.comName, `${info.comName}.vue.art`), artExample(info.comName))
    ]).then(_=>{
        console.log(chalk.green(`组件文件夹 ${info.comName} 创建成功`));
    }).catch(err=>{
        throw err;
    })
}