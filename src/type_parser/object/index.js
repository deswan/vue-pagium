const utils = require('../../utils/utils');

let hasError = (conf) => {
    const {
        checkProps
    } = require('../../utils/checkConfigValid');

    let format = conf.format;
    if (!format) {
        return '必须填写 format 属性'
    }

    if(format.some && format.some(conf=>{
        return Array.isArray(conf.value) || conf.value === 'object';
    })){
        return 'object类型不可嵌套array或object类型'
    }
    
    try {
        checkProps(format)
    } catch (err) {
        return err.message;
    }

}


function isValid(value) {
    const {
        getIsValid,
    } = require('../index');

    let format = this.format;

    if (!utils.isPlainObject(value)) {
        return false
    }

    let keys = Object.keys(value)
    let valid = keys.every(key => {
        let conf = format.find(formatConf => {
            return formatConf.name === key
        });
        return conf && getIsValid(conf.value).call(conf, value[conf.name])
    })

    if (!valid) {
        return false;
    }
    return true;
}

function patch(value) {
    const {
        getDefaultValue,
        getPatch
    } = require('../index');

    return this.format.reduce((target, conf) => {
        target[conf.name] =
            value[conf.name] === undefined ?
            getDefaultValue(conf.value).call(conf) :
            getPatch(conf.value).call(conf, value[conf.name])
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

function upgrade(value) {
    let format = this.format;
    if (utils.isPlainObject(value)) {
        return Object.keys(value).reduce((target, key) => {
            let conf = format.find(formatConf => {
                return formatConf.name === key
            });
            if (conf) {
                let upgraded = require('../index').getUpgrade(conf.value).call(conf, value[key]);
                if (upgraded !== undefined) target[key] = upgraded;
            }
            return target;
        }, {})
    } else {
        return;
    }
}

module.exports = {
    hasError,
    isValid,
    patch,
    defaultValue,
    upgrade
}