//表单组件
export default [
    // {
    //     name: 'cols',
    //     label:'设置列',
    //     value: 'Array[Object]',
    //     item: {
    //         fixed: {
    //             name: '是否固定',
    //             value: Boolean
    //         },
    //         label: {
    //             name: '列名',
    //             value: String
    //         },
    //         prop: {
    //             name: 'prop',
    //             value: String
    //         },
    //         width: {
    //             name: '宽度',
    //             value: String
    //         }
    //     }
    // }, 
    {
        name: 'tableName',
        label: '表格名称',
        value: String     // data中的名称/ref值
    }
    , {
        name: 'load',
        label: '数据加载',
        value: Boolean,
        on: [{
            name: 'url',
            label: '接口名称',
            value: String
        }, {
            name: 'params',
            label: '请求参数',
            value: Object
        }]
    }
    // , {
    //     name: 'pagination',
    //     label: '分页器',
    //     value: Boolean,
    //     on: {
    //         current: {
    //             name: 'pagination',
    //             label: '当前页数字段名称',
    //             default: 'page',
    //             value: String,
    //         },
    //         showPageSize: {
    //             label: '可调整每页显示页数',
    //             default: false,
    //             value: Boolean,
    //             on: {
    //                 pageSize: {
    //                     label: '当前页数字段名称',
    //                     default: 'pageSize',
    //                     value: String,
    //                 },
    //                 sizes: {
    //                     label: '可选页数',
    //                     default: [50, 100],
    //                     value: [Number]
    //                 }
    //             }
    //         },
    //         total: {
    //             label: '总页数返回值字段',
    //             value: String    //'可以.分隔'
    //         }
    //     }
    // }
]
