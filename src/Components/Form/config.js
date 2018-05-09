module.exports = {
    name:'form',
    description:'表单',
    props: [{
        name: "inline",
        label: "是否行内表单",
        type: "boolean"
    }, {
        name: "labelPosition",
        label: "标签位置",
        type: "select",
        default: "",
        options: ["left", "right", "top"]
    }, {
        name: "labelWidth",
        label: "标签宽度",
        type: "string",
        default: "80px"
    }, {
        name: "statusIcon",
        label: "是否在输入框中显示校验结果反馈图标",
        type: "boolean"
    }, {
        name: "size",
        label: "表单内组件尺寸",
        type: "string"
    }]
}