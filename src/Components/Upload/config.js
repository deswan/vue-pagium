module.exports = {
    name: 'upload',
    description:'文件上传',
    props: [{
        name: "action",
        label: "上传url",
        type: "string"
    }, {
        name: "accept",
        label: "accept",
        type: "select",
        options:['.png,.jpg,.gif','.png']
    }, {
        name: "multiple",
        label: "multiple",
        type: "boolean"
    }, {
        name: "withCredentials",
        label: "发送cookie",
        type: "boolean"
    }, {
        name: "name",
        label: "name",
        type: "string"
    }, {
        name: "sizeLimit",
        label: "大小限制（KB）",
        type: "number"
    }]
}