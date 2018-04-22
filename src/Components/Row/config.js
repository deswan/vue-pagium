module.exports = {
    "name": 'row',
    "props": [{
        "name": "gutter",
        "label": "栅格间隔",
        "value": "number"
    }, {
        "name": "type",
        "label": "布局模式，可选 flex",
        "value": "string",
    }, {
        "name": "justify",
        "label": "flex 布局下的水平排列方式",
        "value": "select",
        default: 'start',
        options: ['start', 'end', 'center', 'space-around', 'space-between']
    }, {
        "name": "align",
        "label": "flex 布局下的垂直排列方式",
        "value": "select",
        default: 'top',
        options: ['top', 'middle', 'bottom']
    }, {
        "name": "tag",
        "label": "自定义元素标签",
        "value": "string",
        default: 'div'
    }]
}