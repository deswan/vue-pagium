//Table
module.exports = {
    nestable: false,
    props: [{
        name: 'title',
        label: '文本',
        value: String
    }, {
        name: 'type',
        label: '主题',
        value: 'select',
        options: ['success', 'info', 'warning', 'danger']
    }, {
        name: 'color',
        label: '背景色',
        value: String
    }, {
        name: 'hit',
        label: '是否有边框描边',
        value: Boolean
    }, {
        name: 'size',
        label: '尺寸',
        value: 'select',
        options: ['medium', 'small', 'mini']
    }]
}