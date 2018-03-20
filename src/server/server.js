const express = require('express');
const app = express()

const path = require('path');
const fs = require('fs');
const template = require('art-template');
const Mock = require('mockjs');

const componentDir = path.resolve(__dirname, './');
const scheme2Default = require('./scheme2Default');
const postProcessor = require('./postProcessor');

let tplName = 'Table';
const outputDir = path.join(__dirname, 'dist');


//art options
template.defaults.rules[1].test = /{{{([@#]?)[ \t]*(\/?)([\w\W]*?)[ \t]*}}}/;
template.defaults.imports.http = template.compile(fs.readFileSync('./http.art', 'utf-8'));
template.defaults.minimize = false;
template.defaults.escape = false;
template.defaults.imports.valuelize = (e) => {
    return JSON.stringify(e)
};

let props = {
    cols: [{
        fixed: 'left',
        label: '姓名',
        prop: 'name',
        "min-width": '80px'
    },{
        label: '年龄',
        prop: 'age',
        "min-width": '180px'
    }],
    pagination:true,
    pageSizes:'[50,100]',
    load:true,
    method:'get',
    url:'/api/table-data',
    params:{
        param1:'111',
        param2:'222'
    },
}

let config = require(path.join(componentDir, tplName, 'config.js'));
let html = template(path.join(componentDir, tplName, tplName + '.vue.art'), Object.assign(scheme2Default(config.props), props))

fs.exists(outputDir, (exists) => {
    if (!exists) {
        fs.mkdirSync(outputDir)
    }
    let replacedHtml = postProcessor.replaceIdentifier(html, {
        name: 'myTable'
    });
    fs.writeFileSync(path.join(outputDir, tplName) + '.vue', replacedHtml)
});

app.get('/api/table-data', function (req, res) {
    res.json(Mock.mock({
        'total':60,
        'items|60':[{
            name:'@name',
            age:'@integer(20,60)'
        }]
    }))
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('app listening at http://%s:%s', host, port);
});