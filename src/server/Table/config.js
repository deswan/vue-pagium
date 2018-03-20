//表单组件
module.exports = {
    nestable:false,
    props:[
        {
            name: 'cols',
            label:'设置列',
            value: [Object],
            format: [{
                    name: 'fixed',
                    label:'fixed',
                    value: String,
                    options:[
                        {
                            key:'left',
                            value:'left'
                        },
                        {
                            key:'right',
                            value:'right'
                        }
                    ]
                },{
                    name: 'label',
                    label:'label',
                    value: String
                },{
                    name: 'prop',
                    label:'prop',
                    value: String
                },{
                    name: 'min-width',
                    label:'min-width',
                    value: String
                }
            ]
        }, 
        {
            name: 'pagination',
            label: '分页器',
            value: Boolean,
            on: [{
                name: 'pageSizes',
                label: '可选页数',
                value: String,
            }, {
                name: 'paginationLayout',
                label: '布局',
                value:String,
            }]
        },
        {
            name: 'load',
            label: '数据加载',
            value: Boolean,
            on: [ {
                name: 'method',
                default:'get',
                label: 'method',
                value: String
            }, {
                name: 'url',
                label: '接口名称',
                value: String,
            }, {
                name: 'params',
                label: '请求参数',
                value: Object
            }, {
                name: 'totalName',
                label: '响应total字段',
                default:'total',
                value: String
            },  {
                name: 'itemsName',
                label: '响应items字段',
                default:'items',
                value: String
            }, {
                name: 'pageName',
                default:'page',
                label: '请求page字段',
                value: String
            }, {
                name: 'pageSizeName',
                default:'pageSize',
                label: '请求pageSize字段',
                value: String
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
}
