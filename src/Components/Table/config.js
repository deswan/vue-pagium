module.exports = {
    "name": 'table',
    "exposeProperty": ["load", "clear"],
    description:'表格/列表',
    "props": [{
        "name": "cols",
        "label": "设置列",
        "type": ["object"],
        "format": [{
            "name": "fixed",
            "label": "fixed",
            "type": "select",
            "options": ["left", "right"]
        }, {
            "name": "label",
            "label": "label",
            "type": "string"
        }, {
            "name": "prop",
            "label": "prop",
            "type": "string"
        }, {
            "name": "minWidth",
            "label": "min-width",
            "type": "string"
        }, {
            "name": "scope",
            "label": "scope",
            "type": "slot",
            scope: 'scope'
        }, {
            "name": "align",
            "label": "align",
            "type": "select",
            "options": ['left', 'center', 'right']
        }, {
            "name": "type",
            "label": "type",
            "type": "select",
            "options": ['selection', 'index', 'expand']
        }]
    }, {
        "name": "isLoad",
        "label": "是否立即加载",
        "type": "boolean"
    }, {
        "name": "pagination",
        "label": "分页器",
        "type": "boolean"
    }, {
        "name": "height",
        "label": "height",
        "type": "string"
    }, {
        "name": "maxHeight",
        "label": "maxHeight",
        "type": "string"
    }, {
        "name": "size",
        "label": "size",
        "type": "select",
        "options": ['medium', 'small', 'mini']
    }, {
        "name": "fit",
        "label": "宽度是否自撑开",
        "type": "boolean",
        "default": true
    }, {
        "name": "method",
        "label": "请求method",
        "type": "string",
        "default": "get"
    }, {
        "name": "url",
        "label": "请求url",
        "type": "string"
    }, {
        "name": "pageName",
        "default": "page",
        "label": "请求page字段",
        "type": "string"
    }, {
        "name": "pageSizeName",
        "default": "pageSize",
        "label": "请求pageSize字段",
        "type": "string"
    }, {
        "name": "totalName",
        "label": "响应total字段",
        "default": "total",
        "type": "string"
    }, {
        "name": "itemsName",
        "label": "响应items字段",
        "default": "items",
        "type": "string"
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