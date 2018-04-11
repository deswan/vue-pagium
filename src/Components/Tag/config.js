//Table
module.exports = {
    "name": "tag",
    "props": [{
        "name": "title",
        "label": "文本",
        "value": "string"
    }, {
        "name": "type",
        "label": "主题",
        "value": "select",
        "options": ["success", "info", "warning", "danger"]
    }, {
        "name": "color",
        "label": "背景色",
        "value": "string"
    }, {
        "name": "hit",
        "label": "是否有边框描边",
        "value": "boolean"
    }, {
        "name": "size",
        "label": "尺寸",
        "value": "select",
        "options": ["medium", "small", "mini"]
    }]
}