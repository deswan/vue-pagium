//Table
module.exports = {
    "name": "tag",
    "props": [{
        "name": "title",
        "label": "文本",
        "type": "string"
    }, {
        "name": "type",
        "label": "主题",
        "type": "select",
        "options": ["success", "info", "warning", "danger"]
    }, {
        "name": "color",
        "label": "背景色",
        "type": "string"
    }, {
        "name": "hit",
        "label": "是否有边框描边",
        "type": "boolean"
    }, {
        "name": "size",
        "label": "尺寸",
        "type": "select",
        "options": ["medium", "small", "mini"]
    }]
}