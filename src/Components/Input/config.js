module.exports = {
    "nestable": false,
    "props": [{
        "name": "label",
        "label": "label",
        "value": "string"
    }, {
        "name": "size",
        "label": "尺寸",
        "value": "select",
        "options": ["medium", "small", "mini"]
    }, {
        "name": "type",
        "label": "类型",
        "value": "select",
        "default": "text",
        "options": ["text", "textarea"]
    }, {
        "name": "placeholder",
        "label": "placeholder",
        "value": "string"
    }, {
        "name": "clearable",
        "label": "是否可清空",
        "value": "boolean"
    }, {
        "name": "disabled",
        "label": "禁用",
        "value": "boolean"
    }, {
        "name": "prefixIcon",
        "label": "输入框头部图标",
        "value": "string"
    }, {
        "name": "suffixIcon",
        "label": "输入框尾部图标",
        "value": "string"
    }, {
        "name": "rows",
        "label": "输入框行数，只对 type=\"textarea\" 有效",
        "value": "number"
    }, {
        "name": "autosize",
        "label": "自适应内容高度，只对 type=\"textarea\" 有效",
        "value": "string"
    }, {
        "name": "autoComplete",
        "label": "自动补全",
        "value": "boolean"
    }, {
        "name": "name",
        "label": "name",
        "value": "string"
    }, {
        "name": "readonly",
        "label": "readonly",
        "value": "boolean"
    }, {
        "name": "autofocus",
        "label": "autofocus",
        "value": "boolean"
    }]
}