module.exports = {
    "name": 'upload',
    "props": [{
        "name": "action",
        "label": "上传url",
        "value": "string"
    }, {
        "name": "accept",
        "label": "accept",
        "value": "select",
        options:['.png,.jpg,.gif','.png']
    }, {
        "name": "multiple",
        "label": "multiple",
        "value": "boolean"
    }, {
        "name": "withCredentials",
        "label": "发送cookie",
        "value": "boolean"
    }, {
        "name": "name",
        "label": "name",
        "value": "string"
    }, {
        "name": "sizeLimit",
        "label": "大小限制（KB）",
        "value": "number"
    }]
}