const fs = require('fs')
const path = require('path')
const {componentDir} = require('../config');

function getAllComponent($dir = componentDir){
    let componentPaths = {}
    let dirs = fs.readdirSync($dir, 'utf-8');
    dirs.forEach(dir => {
        let dirPath = path.resolve($dir, dir);
        if (fs.statSync(dirPath).isDirectory()) {
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
                componentPaths[dir] = dirPath
            } else {
                throw new Error(`组件文件夹${dir}缺少config.js/Vue组件/模板文件`)
            }
        }
    })
    return componentPaths
}

module.exports = {
    getAllComponent
}