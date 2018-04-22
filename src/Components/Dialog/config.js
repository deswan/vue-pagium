module.exports = {
    "name": 'dialog',
    "isDialog": true,
    "exposeProperty": ["open"],
    "props": [{
        "name": "title",
        "value": "string",
        "label": "标题"
    }, {
        "name": "showClose",
        "label": "显示关闭按钮",
        "value": "boolean"
    }, {
        "name": "center",
        "label": "对头部和底部采用居中布局",
        "value": "boolean"
    }, {
        "name": "loadComponent",
        "label": "加载组件",
        "value": "refer-component",
        property: 'load'
    }, {
        "name": "clearComponent",
        "label": "清空组件",
        "value": "refer-component",
        property: 'clear'
    }]
}