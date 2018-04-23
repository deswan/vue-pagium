require('./check-versions')()

const express = require('express');
var bodyParser = require('body-parser');
const app = express()
const merge = require('webpack-merge')
const webpack = require('webpack')
const rm = require('rimraf')
const path = require('path');
const fs = require('fs-extra');
const Mock = require('mockjs');
const logger = require('../logger')('start.js');
const webpackIndexConfig = require('./webpack/webpack.index.conf')
const webpackPreviewConfig = require('./webpack/webpack.preview.conf')
const ora = require('ora');
const chalk = require('chalk');
const opn = require('opn');
const ncp = require('ncp');
const builder = require('./builder');

const scheme2Default = require('../utils/scheme2Default');
const {
    checkConfig
} = require('../utils/checkConfigValid');
const constant = require('../const');
const compile = require('./compile');

const inquirer = require('inquirer');

const {
    getCustomComponentAndArt,
    getOriginComponents,
    linkComponent
} = require('./helper');

const config = require('../config')

var nodeCleanup = require('node-cleanup');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded

Error.stackTraceLimit = 100;

let template_uuid = 1;

let template = []

let allComponentPaths = {};

let inputData = [];

/**
 * 读取用户目录下的模板数据到template变量中并添加id
 * @param {*} configDir 
 */
async function readTemplatesFile(configDir) {
    let tempPath = path.join(configDir, config.target.tempName)

    if (await fs.pathExists(tempPath) && fs.statSync(tempPath).isFile()) {
        template = require(path.join(configDir, config.target.tempName)).map(e => {
            e.id = template_uuid++;
            return e;
        });
    } else {
        template = []
    }
}

/**
 * 将当前template数据写入用户目录
 * @param {*} configDir 
 */
async function writeTemplatesFile(configDir) {
    let tempPath = path.join(configDir, config.target.tempName)
    let templateWithoutId = template.map(e => {
        return {
            name: e.name,
            date: e.date,
            remark: e.remark,
            data: e.data
        }
    })
    await fs.outputFile(tempPath, JSON.stringify(templateWithoutId, null, 2));
}

function startServer(info) {

    app.use(express.static(path.resolve(__dirname, './dist')));

    app.get('/', (req, res) => {
        return res.sendFile(path.resolve(__dirname, './dist', 'index.html'))
    })

    app.get('/preview', (req, res) => {
        return res.sendFile(path.resolve(__dirname, './dist', 'preview.html'))
    })

    app.post('/preview', function (req, res) {
        let output = compile(req.body, allComponentPaths, info.temporaryDir);
        let finish = 0;

        //将结果写入preview目录下后打包
        compile(req.body, allComponentPaths, info.temporaryDir).then(output => {
            return fs.outputFile(config.previewOutputPath, output)
        }).then(_ => {
            return new Promise((resolve) => {
                webpack(webpackPreviewConfig, (err, stats) => {
                    if (err) throw err;

                    process.stdout.write(stats.toString({
                        colors: true,
                        modules: false,
                        children: false,
                        chunks: false,
                        chunkModules: false
                    }) + '\n\n')

                    resolve();
                })
            })
        }).then(_ => {
            res.json({
                code: 0
            })
        }).catch(err => {
            res.json({
                data: err.message,
                code: 1
            })
        })
    });

    //将结果写入用户目录
    app.post('/save', function (req, res) {

        compile(req.body, allComponentPaths, info.temporaryDir).then(output => {
            return fs.outputFile(info.target, output)
        }).then(_ => {
            res.json({
                data: info.target,
                code: 0
            })
        }).catch(err => {
            res.json({
                data: err.message,
                code: 1
            })
        })
    });

    //上传用户填写数据
    app.post('/input', function (req, res) {
        inputData = req.body;
        res.json({
            code: 0
        })
    });

    //获取用户填写数据
    app.get('/input', function (req, res) {
        res.json({
            data: inputData,
            code: 0
        })
    });

    /**
     * 保存为模板
     * @data {data,name,date,remark,isCover}
     */
    app.post('/saveAsTemplate', function (req, res) {
        let data = req.body
        let isNameDuplicate = template.some(e => {
            return e.name === data.name
        })
        if (!data.isCover && isNameDuplicate) {
            res.json({
                code: 1
            })
        } else if (data.isCover && isNameDuplicate) {
            let output = builder(req.body.data)
            template.some(e => {
                if (e.name === data.name) {
                    e.remark = data.remark;
                    e.data = output;
                    return true;
                }
            })
            writeTemplatesFile(info.configDir).then(_ => {
                res.json({
                    code: 0
                })
            })
        } else {
            let output = builder(req.body.data)
            let d = new Date();
            let date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " +
                d.getHours() + ":" + d.getMinutes() + ':' + d.getSeconds();
            template.push({
                id: template_uuid++,
                name: data.name,
                date,
                remark: data.remark,
                data: output
            });
            writeTemplatesFile(info.configDir).then(_ => {
                res.json({
                    code: 0
                })
            })
        }
    });

    app.get('/mock/table', function (req, res) {
        res.json(Mock.mock({
            'total': 60,
            'items|60': [{
                name: '@name',
                age: '@integer(20,60)'
            }]
        }))
    });

    /**
     * 获取模板列表（未解析）
     */
    app.get('/templates', function (req, res) {
        res.json({
            data: template,
            code: 0
        })
    });

    app.get('/template', function (req, res) {
        let id = parseInt(req.query.id);
        res.json({
            data: template.find(e => {
                return e.id === id;
            }),
            code: 0
        })
    });

    /**
     * 删除模板
     * @data {id}
     */
    app.post('/delTemplate', function (req, res) {
        let id = req.body.id;
        template = template.filter((e, idx) => {
            return e.id !== id
        })
        writeTemplatesFile(info.configDir)
        res.json({
            code: 0
        })
    });


    var server = app.listen(info.port, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log(`server listening at http://${host}:${port}`);
        opn(`http://127.0.0.1:${info.port}/`)
    });
}


module.exports = async function (info) {
    allComponentPaths = getOriginComponents(info.temporaryDir)

    await readTemplatesFile(info.configDir); //读取模板

    //webpack 打包
    if (process.env.NODE_ENV === 'production') {
        return new Promise(resolve=>{
            const spinner = ora('building ...')
            spinner.start()
            rm(path.join('./dist', 'static'), err => {
                if (err) throw err
                webpack(merge(webpackIndexConfig, {
                    plugins: [
                        new webpack.DefinePlugin({
                            'process.Components': JSON.stringify(allComponentPaths),
                            'process.ComponentsRoot':JSON.stringify(path.basename(info.temporaryDir))
                        }),
                    ]
                }), (err, stats) => {
                    spinner.stop()
                    if (err) throw err;
    
                    process.stdout.write(stats.toString({
                        colors: true,
                        modules: false,
                        children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
                        chunks: false,
                        chunkModules: false
                    }) + '\n\n')

                    startServer(info);
                    
                    resolve();
                })
            })
        })
    } else {
        startServer(info);
    }
}