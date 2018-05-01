module.exports = {
    "name": 'dialog',
    "isDialog": true,
    "exposeProperty": ["open"],
    "props": [{
        "name": "title",
        "type": "string",
        "label": "标题"
    }, {
        "name": "loadComponent",
        "label": "加载组件",
        "type": "refer",
        property: 'load'
    }, {
        "name": "clearComponent",
        "label": "清空组件",
        "type": "refer",
        property: 'clear'
    }]
}