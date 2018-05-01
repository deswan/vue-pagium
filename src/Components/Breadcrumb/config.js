module.exports = {
    "name": 'breadcrumb',
    "props": [{
        "name": "items",
        "label": "导航列表",
        "type": ['object'],
        "format": [{
            label: '路由跳转对象',
            "name": 'to',
            type: 'string',
        }, {
            label: '文本',
            "name": 'title',
            type: 'string',
        }]
    }, {
        "name": "marginTop",
        "label": "margin-top(px)",
        "type": "number"
    }, {
        "name": "marginBottom",
        "label": "margin-bottom(px)",
        "type": "number"
    }]
}