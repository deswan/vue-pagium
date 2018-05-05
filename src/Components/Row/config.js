module.exports = {
    "name": 'row',
    description:'栅格行',
    "props": [{
        "name": "gutter",
        "label": "栅格间隔",
        "type": "number"
    }, {
        "name": "type",
        "label": "布局模式，可选 flex",
        "type": "string",
    }, {
        "name": "justify",
        "label": "flex 布局下的水平排列方式",
        "type": "select",
        default: 'start',
        options: ['start', 'end', 'center', 'space-around', 'space-between']
    }, {
        "name": "align",
        "label": "flex 布局下的垂直排列方式",
        "type": "select",
        default: 'top',
        options: ['top', 'middle', 'bottom']
    }, {
        "name": "tag",
        "label": "自定义元素标签",
        "type": "string",
        default: 'div'
    }, {
        "name": "marginTop",
        "label": "margin-top(px)",
        "type": "number"
    }, {
        "name": "marginBottom",
        "label": "margin-bottom(px)",
        "type": "number"
    }]
}