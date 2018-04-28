module.exports = {
    "name": 'breadcrumb',
    "props": [{
        "name": "items",
        "label": "导航列表",
        "value": ['object'],
        "format": [{
            label: '路由跳转对象',
            "name": 'to',
            value: 'string',
        }, {
            label: '文本',
            "name": 'title',
            value: 'string',
        }]
    }, {
        "name": "separator",
        "label": "分隔符",
        "value": "string"
    }, {
        "name": "marginTop",
        "label": "margin-top(px)",
        "value": "number"
    }, {
        "name": "marginBottom",
        "label": "margin-bottom(px)",
        "value": "number"
    }]
}