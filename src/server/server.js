require('./check-versions')()

const express = require('express');
var bodyParser = require('body-parser');
const app = express()

const webpack = require('webpack')
const rm = require('rimraf')
const path = require('path');
const fs = require('fs');
const Mock = require('mockjs');
const Log = require('log');
const webpackConfig = require('./webpack.conf')
const ora = require('ora');
const chalk = require('chalk');

const scheme2Default = require('../utils/scheme2Default');
const postProcessor = require('./postProcessor');

const config = require('../config')

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded

Error.stackTraceLimit = 100;

function launch(targetDir){
    console.log(targetDir)
    process.env.NODE_ENV === 'production'
    
    //webpack 打包
    const spinner = ora('building ...')
    spinner.start()
    
    rm(path.join('./dist', 'static'), err => {
        if (err) throw err
        webpack(webpackConfig, (err, stats) => {
            spinner.stop()
            if (err) throw err
            // process.stdout.write(stats.toString({
            //     colors: true,
            //     modules: false,
            //     children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
            //     chunks: false,
            //     chunkModules: false
            // }) + '\n\n')
    
            // if (stats.hasErrors()) {
            //     console.log(chalk.red('  Build failed with errors.\n'))
            //     process.exit(1)
            // }
    
            // console.log(chalk.cyan('  Build complete.\n'))
            // console.log(chalk.yellow(
            //     '  Tip: built files are meant to be served over an HTTP server.\n' +
            //     '  Opening index.html over file:// won\'t work.\n'
            // ))
    
            app.use(express.static(path.resolve(__dirname, './dist')));
    
            app.get('/',(req,res)=>{
                return res.sendFile(path.resolve(__dirname, './dist','index.html'))
            })
    
            app.post('/save', function (req, res) {
                let output = postProcessor(req.body);
                fs.writeFile(config.outputPath, output,(err)=>{
                    if(err) throw err;
                    res.json({
                        code: 0
                    })
                });
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
            });
        })
    })
}


module.exports = launch