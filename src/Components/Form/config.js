module.exports = {
    "name":'form',
    "props": [{
        "name": "inline",
        "label": "是否行内表单",
        "value": "boolean"
    }, {
        "name": "labelPosition",
        "label": "标签位置",
        "value": "select",
        "default": "",
        "options": ["left", "right", "top"]
    }, {
        "name": "labelWidth",
        "label": "标签宽度",
        "value": "string",
        "default": "80px"
    }, {
        "name": "statusIcon",
        "label": "是否在输入框中显示校验结果反馈图标",
        "value": "boolean"
    }, {
        "name": "size",
        "label": "表单内组件尺寸",
        "value": "string"
    }]
}