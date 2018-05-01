const utils = require('./utils')
const {
    getIsValid
} = require('../type_parser')

function checkData(data, allComsConfig,noCheckConfig) {
    if (!Array.isArray(data)) {
        throw new Error('格式不合法')
    }
    data.forEach(item => {
        let config = allComsConfig[item.type];
        if(!config && noCheckConfig) return; //不检查无相应组件的项
        try {
            checkItem(item,config);
        } catch (err) {
            throw new Error(JSON.stringify(item, null, 2) + "\n" + err.message)
        }
        if (item.children) {
            checkData(item.children, allComsConfig,noCheckConfig)
        }
    })

    function checkItem(item,config) {
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
            throw new Error('name 不合法')
        }

        if (item.props && !noCheckConfig) {
            checkProps(item.props, config, item.type)
        }

    }

    function checkProps(props, config, comName) {
        Object.keys(props).forEach(propName => {
            let conf = utils.getConfByPropName(propName, config)
            //验证组件是否存在该prop
            if (!conf) {
                throw new Error(`组件 ${comName} 不存在 prop: ${propName}`)
            }
            if (!getIsValid(conf.type).call(conf, props[propName])) {
                throw new Error(`prop 不合法: ${propName}`)
            }
        })
    }
}

module.exports = checkData