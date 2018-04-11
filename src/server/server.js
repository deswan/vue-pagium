const express = require('express');
var bodyParser = require('body-parser');
const app = express()

const path = require('path');
const fs = require('fs');
const template = require('./art');
const Mock = require('mockjs');
const Log = require('log');
const log = new Log('debug', fs.createWriteStream('./my.log'))

const scheme2Default = require('./scheme2Default');
const postProcessor = require('./postProcessor');

const componentDir = '../Components'

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded

const outputDir = path.join(__dirname, 'dist');

Error.stackTraceLimit = 100;

let props = {
    cols: [{
        label: '姓名',
        prop: 'name',
        "min-width": '80px'
    }, {
        label: '年龄',
        prop: 'age',
        "min-width": '180px'
    }],
    pagination: false,
    pageSizes: '[50,100]',
    load: true,
    method: 'get',
    url: '/api/table-data',
    params: {
        param1: '111',
        param2: '222'
    },
}

/**
 * 获取组件文件夹绝对路径
 * 输入结果Vue组件
 * @return {code:0} 
 */
app.post('/save', function (req, res) {
    let output = postProcessor(req.body);
    fs.writeFileSync(path.join(outputDir, 'App.vue'), output);
    res.json({
        code: 0
    })
});

app.get('/api/table-data', function (req, res) {
    res.json(Mock.mock({
        'total': 60,
        'items|60': [{
            name: '@name',
            age: '@integer(20,60)'
        }]
    }))
});

/**
 * 获取组件文件夹绝对路径
 * @return [string]
 */
app.get('/getAllComponents', function (req, res) {
    let componentPaths = []
    let dirs = fs.readdirSync(componentDir, 'utf-8');
    dirs.forEach(dir => {
        let dirPath = path.resolve(componentDir, dir);
        if (fs.statSync(dirPath).isDirectory()) {
            let files = fs.readdirSync(dirPath, 'utf-8');
            let hasConfig, hasVue, hasArt;
            files.forEach(file => {
                let filePath = path.join(componentDir, dir, file);
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
                componentPaths.push(dirPath);
            } else {
                throw new Error(`组件文件夹${dir}缺少config.js/Vue组件/模板文件`)
            }
        }
    })
    return res.json(componentPaths)
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('app listening at http://%s:%s', host, port);
});