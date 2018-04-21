const utils = require('./utils')
const {
    getIsValid
} = require('../type_parser')
/**
 * { ---temlpate---
    "name": "342",
    "date": "2018-4-18 22:18:42",
    "remark": "",
    "data":
    ---data--- 
    [
        {
            ---item---
            "type": "Form",
            "name": "form2",
            "props": {
                ---props---
            },
            "children": []
        }
    ]
    }
 */

function checkTemplate(template, allComsConfig) {
    if (!template.name) {
        throw new Error('name属性缺失')
    }

    if (typeof template.name != 'string' || !utils.isValidIdentifier(template.name)) {
        throw new Error('name属性不合法')
    }

    if (!template.data) {
        throw new Error('data属性缺失')
    }

    // try {
    checkData(template.data, allComsConfig)
    // } catch (err) {
    //     throw new Error('template.data \n' + err.message)
    // }

}

function checkData(data, allComsConfig) {
    if (!Array.isArray(data)) {
        throw new Error('格式不合法')
    }
    data.forEach(item => {
        // try {
        checkItem(item);
        if (item.children) {
            checkData(item.children, allComsConfig)
        }
        // } catch (err) {
        //     throw new Error(JSON.stringify(item, null, 2) + "\n" + err.message)
        // }
    })

    function checkItem(item) {
        if (!item.type) {
            throw new Error('type属性不能为空')
        }
        if (typeof item.type != 'string') {
            throw new Error('type属性不合法')
        }
        //验证组件是否存在
        if (!allComsConfig[item.type] && !allComsConfig[item.type]) {
            throw new Error(`不存在该组件：${item.type}，请检查组件路径`)
        }
        if (!item.name) {
            throw new Error('name属性不能为空')
        }
        if (typeof item.name != 'string' || !utils.isValidIdentifier(item.name)) {
            throw new Error('name属性不合法')
        }
        if (!item.props) {
            throw new Error('props属性不能为空')
        }

        checkProps(item.props, allComsConfig[item.type],item.type)
    }

    function checkProps(props, config,comName) {
        Object.keys(props).forEach(propName => {
            let conf = config.props.find(item => {
                return item.name === propName
            })
            //验证组件是否存在该prop
            if (!conf) {
                throw new Error(`组件 ${comName} 不存在 prop: ${propName}`)
            }
            if (!getIsValid(conf.value).call(conf, props[propName])) {
                
                throw new Error(`prop 不合法: ${propName}`)
            }
        })
    }
}

module.exports = {
    checkTemplate,
    checkData
}