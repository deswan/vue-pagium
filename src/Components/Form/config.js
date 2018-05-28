module.exports = {
    name:'form',
    exposeProperty:['clear'],
    description:'表单',
    props: [{
        name: "inline",
        label: "是否行内表单",
        type: "boolean"
    }, {
        name: "labelPosition",
        label: "标签位置",
        type: "select",
        default: "left",
        options: ["left", "right", "top"]
    }, {
        name: "labelWidth",
        label: "标签宽度（px）",
        type: "string",
        default: "80px"
    }, {
        name: "statusIcon",
        label: "是否在输入框中显示校验结果反馈图标",
        type: "boolean"
    }, {
        name: "size",
        label: "表单内组件尺寸",
        type: "select",
        options: ["medium", "small", "mini"]
    },{
        name: "clearFields",
        label: "特殊清空值",
        type: ['object'],
        format:[{
            name:'com',
            label:'组件',
            type:'refer'
        },{
            name:'attr',
            label:'属性',
            type:'string'
        }]
    }]
}