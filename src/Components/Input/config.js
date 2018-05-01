module.exports = {
    "name":'input',
    "props": [{
        "name": "label",
        "label": "label",
        "type": "string"
    }, {
        "name": "required",
        "label": "required",
        "type": "boolean"
    },{
        "name": "width",
        "label": "宽度",
        "type": "string"
    },{
        "name": "size",
        "label": "尺寸",
        "type": "select",
        "options": ["medium", "small", "mini"]
    }, {
        "name": "type",
        "label": "类型",
        "type": "select",
        "default": "text",
        "options": ["text", "textarea"]
    }, {
        "name": "placeholder",
        "label": "placeholder",
        "type": "string"
    }, {
        "name": "clearable",
        "label": "是否可清空",
        "type": "boolean"
    }, {
        "name": "prefixIcon",
        "label": "输入框头部图标",
        "type": "string"
    }, {
        "name": "suffixIcon",
        "label": "输入框尾部图标",
        "type": "string"
    }, {
        "name": "rows",
        "label": "输入框行数，只对 type=\"textarea\" 有效",
        "type": "number"
    }, {
        "name": "autosize",
        "label": "自适应内容高度，只对 type=\"textarea\" 有效",
        "type": "string"
    }, {
        "name": "name",
        "label": "name",
        "type": "string"
    }, {
        "name": "readonly",
        "label": "readonly",
        "type": "boolean"
    }]
}