const utils = require('./utils')
const type_parser = require('../type_parser')

function checkConfig(config) {
    if (!config.name) {
        throw new Error('请填写name属性')
    }

    if (typeof config.name != 'string') {
        throw new Error('name属性需是字符串')
    }

    if (!utils.isValidIdentifier(config.name)) {
        throw new Error('name不是合法js标识符')
    }

    if (!config.props) {
        throw new Error('请填写props属性')
    }

    checkProps(config.props)

}

function checkProps(props) {
    if (!Array.isArray(props)) {
        throw new Error('必须是数组')
    }
    props.forEach(conf => {
        try {
            checkConf(conf);
        } catch (err) {
            throw new Error(JSON.stringify(conf, null, 2) + "\n" + err.message)
        }
    })
    let allName = utils.getAllPropNameInConfig(props);
    let duplName = allName.find((name, idx) => {
        return allName.indexOf(name) !== idx;
    })
    if (duplName) {
        throw new Error(`name 不得重复：` + duplName)
    }

    function checkConf(conf) {
        if (!conf.name) {
            throw new Error('name 不能为空')
        }
        if (typeof conf.name != 'string') {
            throw new Error('name 需是字符串')
        }
        if (conf.name.startsWith('_')) {
            throw new Error('name 不能以"_"开头')
        }
        if (!utils.isValidIdentifier(conf.name)) {
            throw new Error('name 不是合法js标识符')
        }
        if (!conf.type) {
            throw new Error('type 不能为空')
        }
        if (!type_parser.getType(conf.type)) {
            throw new Error('type 值不合法，合法值为' + type_parser.getAllTypesString().map(e => {
                return JSON.stringify(e);
            }).join(','))
        }
        if (type_parser.getTypeHasError(conf.type)(conf)) {
            throw new Error(type_parser.getTypeHasError(conf.type)(conf))
        }

        if (conf.default && !type_parser.getIsValid(conf.type).call(conf, conf.default)) {
            throw new Error('default值不合法')
        }
    }
}

module.exports = {
    checkConfig,
    checkProps
}