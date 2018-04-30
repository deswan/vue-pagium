module.exports = {
    "name": 'dialog',
    "isDialog": true,
    "exposeProperty": ["open"],
    "props": [{
        "name": "title",
        "value": "string",
        "label": "标题"
    }, {
        "name": "loadComponent",
        "label": "加载组件",
        "value": "refer",
        property: 'load'
    }, {
        "name": "clearComponent",
        "label": "清空组件",
        "value": "refer",
        property: 'clear'
    }]
}