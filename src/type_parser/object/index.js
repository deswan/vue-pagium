const utils = require('../../utils/utils');

let hasError = (conf) => {
    const {
        checkProps
    } = require('../../utils/checkConfigValid');

    let format = conf.format;
    if (!format) {
        return '必须填写 format 属性'
    }

    try {
        checkProps(format)
    } catch (err) {
        return err.message;
    }

}


function isValid(defaultValue) {
    const {
        getIsValid,
    } = require('../index');

    let format = this.format;

    if (!utils.isPlainObject(defaultValue)) {
        return false
    }

    let keys = Object.keys(defaultValue)
    let valid = keys.every(key => {
        let conf = format.find(formatConf => {
            return formatConf.name === key
        });
        return conf && getIsValid(conf.value).call(conf, defaultValue[conf.name])
    })

    if (!valid) {
        return false;
    }
    return true;
}

function patchDefault(value) {
    const {
        getDefaultValue,
        getPatchDefault
    } = require('../index');

    return this.format.reduce((target, conf) => {
        target[conf.name] =
            value[conf.name] === undefined ?
            getDefaultValue(conf.value).call(conf) :
            getPatchDefault(conf.value).call(conf, value[conf.name])
        return target;
    }, {})
}

function defaultValue() {
    const {
        getDefaultValue,
    } = require('../index');

    return this.format.reduce((target, conf) => {
        target[conf.name] = getDefaultValue(conf.value).call(conf)
        return target;
    }, {})
}

module.exports = {
    hasError,
    isValid,
    patchDefault,
    defaultValue
}