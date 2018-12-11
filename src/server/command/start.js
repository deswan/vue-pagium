const express = require('express');
var bodyParser = require('body-parser');
const app = express()
const path = require('path');
const fs = require('fs-extra');
const Mock = require('mockjs');
const opn = require('opn');
const dayjs = require('dayjs');
const portfinder = require('portfinder');
const builder = require('../builder');
const compile = require('../compile');
const compilePreview = require('../compilePreview');
const utils = require('../../utils/utils');
const helpers = require('../helper');

const is_demo = !!process.env.PAGIUM_DEMO;

const config = require('../../config')

const distPath = require('../../gui/config').build.assetsRoot;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded

Error.stackTraceLimit = 100;

let template_uuid = 1;

let template = []

let inputData = [];

let previewOutput = ''

function clearEditorProps(data) {
    utils.traverse(item => {
        for (let key in item.props) {
            if (key.startsWith('__')) {
                delete item.props[key];
            }
        }
    }, data.components)
}

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
            data: e.data,
            page: e.page
        }
    })
    await fs.outputFile(tempPath, JSON.stringify(templateWithoutId));
}

function startServer(info) {
    let jsonTarget = path.join(path.dirname(info.target), path.basename(info.target, '.vue') + '.json')

    let allComsConfig = Object.keys(info.componentPaths).reduce((target, name) => {
        target[name] = require(path.join(info.componentPaths[name], 'config.js'));
        return target;
    }, {})


    app.get('/', (req, res) => {
        return res.sendFile(path.join(distPath, 'index.html'))
    })

    !is_demo && app.get('/preview', (req, res) => {
        return res.sendFile(path.join(distPath, 'preview.html'))
    })

    !is_demo && app.post('/preview', function (req, res) {
        let finish = 0;
        clearEditorProps(req.body)
        //将结果写入preview目录下后打包
        compile(req.body, info.componentPaths, info.pages, false).then(output => {
            //替换export default
            let newScript = helpers.getSFCText(output, 'script').replace('export default', 'module.exports =');
            previewOutput = helpers.replaceSFC(output, 'script', newScript)
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
        clearEditorProps(req.body)
        let resultPromise = compile(req.body, info.componentPaths, info.pages);
        if(is_demo){
            resultPromise.then(output => {
                res.attachment('vue_pagium_output.vue').send(output);
                // res.download(info.target, 'vue_pagium_output.vue')
            })
        }else{
            resultPromise.then(output => {
                return fs.outputFile(info.target, output)
            }).then(_ => {
                res.json({
                    data: path.basename(info.target),
                    code: 0
                })
            }).catch(err => {
                res.json({
                    data: err.message,
                    code: 1
                })
                throw err;
            })
        }
    });

    //将结果写入用户目录
    !is_demo && app.post('/saveAsJSON', function (req, res) {
        let page = req.body.page;
        let output = builder(req.body);
        fs.outputFile(jsonTarget, JSON.stringify(output, null, 2)).then(_ => {
            res.json({
                data: path.basename(jsonTarget),
                code: 0
            })
        }).catch(err => {
            res.json({
                data: err.message,
                code: 1
            })
            throw err;
        })
    });

    //上传用户填写数据
    !is_demo && app.post('/input', function (req, res) {
        inputData = req.body;
        res.json({
            code: 0
        })
    });

    //获取用户填写数据
    !is_demo && app.get('/input', function (req, res) {
        res.json({
            data: inputData,
            code: 0
        })
    });
    //获取组件配置对象
    app.get('/allComsConfig', function (req, res) {
        res.json({
            data: allComsConfig,
            code: 0
        })
    });
    //获取根组件名称
    !is_demo && app.get('/pages', function (req, res) {
        res.json({
            data: info.pages,
            code: 0
        })
    });

    /**
     * 保存为模板
     * @data {data,name,date,remark,isCover}
     */
    !is_demo && app.post('/saveAsTemplate', function (req, res) {
        let data = req.body
        let nameDuplicateTemp = template.find(e => {
            return e.name === data.name
        })
        if (!data.isCover && nameDuplicateTemp) {
            res.json({
                code: 1 //前端需确认是否覆盖
            })
        } else if (data.isCover && nameDuplicateTemp) {
            let output = builder(req.body.data)
            attachconfigSnapShoot(output.components, req.body.allComsConfig)
            nameDuplicateTemp.remark = data.remark;
            nameDuplicateTemp.data = output;
            nameDuplicateTemp.date = dayjs().format('YYYY-MM-DD HH:mm:ss')

            writeTemplatesFile(info.configDir).then(_ => {
                res.json({
                    data: nameDuplicateTemp,
                    code: 0
                })
            })
        } else {
            let output = builder(req.body.data)
            attachconfigSnapShoot(output.components, req.body.allComsConfig)
            let newTemp = {
                id: template_uuid++,
                name: data.name,
                date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                remark: data.remark,
                data: output
            }
            template.push(newTemp);
            writeTemplatesFile(info.configDir).then(_ => {
                res.json({
                    data: newTemp,
                    code: 0
                })
            })
        }

        function attachconfigSnapShoot(data, allComsConfig) {
            utils.traverse((item) => {
                item.configSnapShoot = JSON.stringify(allComsConfig[item.type]);
            }, data)
        }
    });

    app.get('/mock', function (req, res) {
        res.json(Mock.mock({
            'total': 60,
            'items|60': [{
                name: '@name',
                age: '@integer(20,60)',
                desc: '@sentence',
                id: '@id',
            }]
        }))
    });

    /**
     * 获取模板列表（未解析）
     */
    app.get('/templates', function (req, res) {
        let sortedTemplate = template.slice().sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        })
        res.json({
            data: sortedTemplate,
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
    !is_demo && app.get('/getSavePath', function (req, res) {
        res.json({
            savePath: info.target,
            jsonSavePath: jsonTarget
        })
    });

    app.get('/realTimePreview.vue', function (req, res) {
        let type = req.query.com;
        let props = JSON.parse(req.query.props);
        res.send(compilePreview(type, info.componentPaths[type], props))
    });

    !is_demo && app.get('/preview.vue', function (req, res) {
        res.send(previewOutput);
    });

    /**
     * 删除模板
     * @data {id}
     */
    !is_demo && app.post('/delTemplate', function (req, res) {
        let id = req.body.id;
        template = template.filter((e, idx) => {
            return e.id !== id
        })
        writeTemplatesFile(info.configDir)
        res.json({
            code: 0
        })
    });

    app.use(express.static(distPath));

    app.use(function(err, req, res, next){
        res.send({
            code: -1,
            msg: 'server error'
        })
    })

    portfinder.basePort = info.port;
    portfinder.getPort(function (err, port) {
        app.listen(port, function () {
            console.log(`server listening at http://127.0.0.1:${port}`);
            process.env.NODE_ENV !== 'development' && !is_demo && opn(`http://127.0.0.1:${port}/`)
        });
    });
}


module.exports = async function (info) {
    await readTemplatesFile(info.configDir); //读取模板

    startServer(info);
}