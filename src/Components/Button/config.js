module.exports = {
    name: 'button',
    description:'按钮',
    props: [{
        name: "dialog",
        label: "打开对话框-选择组件",
        type: "refer"
    },{
        name: "copy",
        label: "将row中的字段拷贝到对话框组件上,为scope slot时有效",
        type: ['object'],
        format:[{
            name:'row',
            type:'string'
        },{
            name:'to',
            type:'string'
        }]
    }, {
        name: "title",
        label: "文本",
        type: "string"
    }, {
        name: "size",
        label: "尺寸",
        type: "select",
        options: ["medium", "small", "mini"]
    }, {
        name: "type",
        label: "类型",
        type: "select",
        options: ["primary", "success", "warning", "danger", "info", "text"]
    }, {
        name: "plain",
        label: "是否朴素按钮",
        type: "boolean"
    }, {
        name: "round",
        label: "是否圆形按钮",
        type: "boolean"
    }, {
        name: "icon",
        label: "图标类名",
        type: "string"
    },{
        name: "marginTop",
        label: "margin-top(px)",
        type: "number"
    }]
}