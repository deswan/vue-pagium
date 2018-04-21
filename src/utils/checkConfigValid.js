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
            throw new Error('name属性不能为空')
        }
        if (typeof conf.name != 'string') {
            throw new Error('name属性需是字符串')
        }
        if (conf.name == 'name') {
            throw new Error('name属性值不能为"name"')
        }
        if (!utils.isValidIdentifier(conf.name)) {
            throw new Error('name不是合法js标识符')
        }
        if (!conf.value) {
            throw new Error('value属性不能为空')
        }
        if (!type_parser.getType(conf.value)) {
            throw new Error('value值不合法，合法值为' + type_parser.getAllTypesString().map(e => {
                return JSON.stringify(e);
            }).join(','))
        }
        if (type_parser.getTypeHasError(conf.value)(conf)) {
            throw new Error(type_parser.getTypeHasError(conf.value)(conf))
        }

        if (conf.default && !type_parser.getIsValid(conf.value).call(conf, conf.default)) {
            throw new Error('default值不合法')
        }

        conf.default !== undefined && (conf.default = type_parser.getPatchDefault(conf.value).call(conf, conf.default))

    }
}

module.exports = {
    checkConfig,
    checkProps
}