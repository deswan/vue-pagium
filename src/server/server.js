require('./check-versions')()

const express = require('express');
var bodyParser = require('body-parser');
const app = express()
const merge = require('webpack-merge')
const webpack = require('webpack')
const rm = require('rimraf')
const path = require('path');
const fs = require('fs');
const Mock = require('mockjs');
const Log = require('log');
const webpackIndexConfig = require('./webpack.index.conf')
const webpackPreviewConfig = require('./webpack.preview.conf')
const ora = require('ora');
const chalk = require('chalk');
const opn = require('opn');
const ncp = require('ncp');

const scheme2Default = require('../utils/scheme2Default');
const postProcessor = require('./postProcessor');
const {
    getAllComponent
} = require('./util');

const config = require('../config')

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded

Error.stackTraceLimit = 100;

function copyComponent(dir, cb) {
    let paths = getAllComponent(path.join(dir, config.target.comDir));
    let counter = Object.keys(paths).length;
    Object.keys(paths).forEach(name => {
        let p = paths[name]
        ncp(p, path.join(config.componentDir, name), (err) => {
            if (err) throw err;
            counter--;
            end()
        })
    })

    function end() {
        if (!counter) {
            cb()
        }
    }
}

function copyTemplatesFile(dir) {

}

function startServer(targetDir) {
    app.use(express.static(path.resolve(__dirname, './index')));

    app.get('/', (req, res) => {
        return res.sendFile(path.resolve(__dirname, './index', 'index.html'))
    })

    app.get('/preview', (req, res) => {
        return res.sendFile(path.resolve(__dirname, './index', 'preview.html'))
    })

    app.post('/save', function (req, res) {
        let output = postProcessor(req.body);
        write();

        function write() {
            let finish = 0;
            fs.writeFile(config.outputPath, output, (err) => {
                if (err) throw err;
                webpack(webpackPreviewConfig, (err, stats) => {
                    if (err) throw err;
                    finish++;
                    end();
                })
            });
            fs.writeFile(path.join(targetDir, config.target.pageName), output, (err) => {
                if (err) throw err;
                finish++;
                end();
            });

            function end() {
                if (finish == 2) {
                    res.json({
                        code: 0
                    })
                }
            }
        }

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


    var server = app.listen(3000, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log('app listening at http://%s:%s', host, port);
        opn('http://127.0.0.1:3000/')
    });
}


function launch(targetDir) {
    process.env.NODE_ENV === 'production'

    copyComponent(targetDir, () => {
        //webpack 打包
        const spinner = ora('building ...')
        spinner.start()
        rm(path.join('./dist', 'static'), err => {
            if (err) throw err
            webpack(merge(webpackIndexConfig, {
                plugins: [
                    new webpack.DefinePlugin({
                        'process.Components': JSON.stringify(getAllComponent())
                    }),
                ]
            }), (err, stats) => {
                spinner.stop()
                if (err) throw err;
                startServer(targetDir);
            })
        })
    })

}


module.exports = launch