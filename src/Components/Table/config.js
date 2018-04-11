module.exports = {
    "name":'table',
    "props": [{
        "name": "cols",
        "label": "设置列",
        "value": ["object"],
        "format": [{
            "name": "fixed",
            "label": "fixed",
            "value": "select",
            "options": ["left", "right"]
        }, {
            "name": "label",
            "label": "label",
            "value": "string"
        }, {
            "name": "prop",
            "label": "prop",
            "value": "string"
        }, {
            "name": "min-width",
            "label": "min-width",
            "value": "string"
        }, {
            "name": "scope",
            "label": "scope",
            "value": "new-component"
        }]
    }, {
        "name": "pagination",
        "label": "分页器",
        "value": "boolean",
        "on": [{
            "name": "pageSizes",
            "label": "可选页数",
            "value": "string"
        }, {
            "name": "paginationLayout",
            "label": "布局",
            "value": "string"
        }]
    }, {
        "name": "load",
        "label": "数据加载",
        "value": "boolean",
        "on": [{
            "name": "method",
            "default": "get",
            "label": "method",
            "value": "string"
        }, {
            "name": "url",
            "label": "接口名称",
            "value": "string"
        }, {
            "name": "params",
            "label": "请求参数",
            "value": "object"
        }, {
            "name": "totalName",
            "label": "响应total字段",
            "default": "total",
            "value": "string"
        }, {
            "name": "itemsName",
            "label": "响应items字段",
            "default": "items",
            "value": "string"
        }, {
            "name": "pageName",
            "default": "page",
            "label": "请求page字段",
            "value": "string"
        }, {
            "name": "pageSizeName",
            "default": "pageSize",
            "label": "请求pageSize字段",
            "value": "string"
        }]
    }]
}