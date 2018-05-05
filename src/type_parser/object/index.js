const utils = require('../../utils/utils');

let hasError = (conf) => {
    const {
        checkProps
    } = require('../../utils/checkConfigValid');

    let format = conf.format;
    if (!format || !format.length) {
        return 'format必须存在'
    }

    if(format.some && format.some(conf=>{
        return Array.isArray(conf.type) || conf.type === 'object';
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
    let format = this.format;

    if (!utils.isPlainObject(value)) {
        return false
    }

    let valid = Object.keys(value).every(key => {
        let conf = format.find(formatConf => {
            return formatConf.name === key
        });
        return conf && require('../index').getIsValid(conf.type).call(conf, value[key])
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
            conf.default === undefined ? getDefaultValue(conf.type).call(conf) : getPatch(conf.type).call(conf, conf.default) :
            getPatch(conf.type).call(conf, value[conf.name])
        return target;
    }, {})
}

function defaultValue() {
    const {
        getDefaultValue,
        getPatch
    } = require('../index');

    return this.format.reduce((target, conf) => {
        target[conf.name] = conf.default === undefined ? getDefaultValue(conf.type).call(conf) : getPatch(conf.type).call(conf, conf.default)
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
                let upgraded = require('../index').getUpgrade(conf.type).call(conf, value[key]);
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