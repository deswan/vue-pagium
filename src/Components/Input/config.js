module.exports = {
    name:'input',
    description:'文本输入框',
    props: [{
        name: "label",
        label: "label",
        type: "string"
    }, {
        name: "required",
        label: "required",
        type: "boolean"
    }, {
        name: "isFormItem",
        label: "是否表单内元素",
        type: "boolean",
        default:true
    },{
        name: "width",
        label: "宽度",
        type: "string"
    },{
        name: "size",
        label: "尺寸",
        type: "select",
        options: ["medium", "small", "mini"]
    },{
        name: "scopeRowKey",
        label: "scope row key",
        type: "string"
    }, {
        name: "placeholder",
        label: "placeholder",
        type: "string"
    }, {
        name: "clearable",
        label: "是否可清空",
        type: "boolean"
    }, {
        name: "prefixIcon",
        label: "输入框头部图标",
        type: "string"
    }, {
        name: "suffixIcon",
        label: "输入框尾部图标",
        type: "string"
    },{
        name: "readonly",
        label: "readonly",
        type: "boolean"
    }]
}