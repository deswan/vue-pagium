const utils = require('./utils')
const {
    getIsValid
} = require('../type_parser')

function checkData(data, allComsConfig, allPages, noCheckConfig) {
    let page = data.page;
    if (page && typeof page !== 'string') {
        throw new Error('page字段格式不合法')
    }
    if (page && !allPages[page]) {
        if (!noCheckConfig) throw new Error(`不存在根组件 ${page}`)
    }

    if(data.components) checkComponents(data.components || [])

    function checkComponents(components, allComsConfig, noCheckConfig) {
        if (!Array.isArray(components)) {
            throw new Error('components字段格式不合法')
        }
        components.forEach(item => {
            try {
                checkItem(item);
            } catch (err) {
                throw new Error(JSON.stringify(item, null, 2) + "\n" + err.message)
            }
            if (item.children) {
                checkComponents(item.children, allComsConfig, noCheckConfig)
            }
        })
    }

    function checkItem(item) {

        if (!item.type) {
            throw new Error('type 不能为空')
        }
        if (typeof item.type != 'string') {
            throw new Error('type 不合法')
        }

        if (!item.name) {
            throw new Error('name 不能为空')
        }
        if (typeof item.name != 'string' || !utils.isValidIdentifier(item.name)) {
            throw new Error('name 不合法（必须为合法js标识符）')
        }

        let config = allComsConfig[item.type];
        if (!config) {
            if (noCheckConfig) return;
            throw new Error(`组件 ${item.type} 未定义`)
        }

        if (item.props && !noCheckConfig) {
            checkProps(item.props, config, item.type)
        }

    }

    function checkProps(props, config, comName) {
        if (!utils.isPlainObject(props)) {
            throw new Error(`props属性不合法`)
        }
        Object.keys(props).forEach(propName => {
            let conf = utils.getConfByPropName(propName, config)
            //验证组件是否存在该prop
            if (!conf) {
                throw new Error(`组件 ${comName} 不存在 prop: ${propName}`)
            }
            if (!getIsValid(conf.type).call(conf, props[propName])) {
                throw new Error(`prop ${propName} 的值不符合对应的类型`)
            }
        })
    }
}

module.exports = checkData