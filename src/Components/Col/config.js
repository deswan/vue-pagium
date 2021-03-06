module.exports = {
    name: 'col',
    description:'栅格列',
    props: [{
        name: "span",
        label: "列数",
        type: "number",
        default: 24
    }, {
        name: "offset",
        label: "左侧的间隔格数",
        type: "number",
    }, {
        name: "push",
        label: "向右移动格数",
        type: "number",
    }, {
        name: "pull",
        label: "向左移动格数",
        type: "number",
    }, {
        name: "xs",
        label: "xs",
        type: "string",
    }, {
        name: "sm",
        label: "sm",
        type: "string",
    }, {
        name: "md",
        label: "md",
        type: "string",
    }, {
        name: "lg",
        label: "lg",
        type: "string",
    }, {
        name: "xl",
        label: "xl",
        type: "string",
    }, {
        name: "tag",
        label: "tag",
        type: "string",
        default: 'div'
    }]
}