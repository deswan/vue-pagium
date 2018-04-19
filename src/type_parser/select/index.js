const {isPlainObject} = require('../../utils/utils')
let options = {
    hasError(options) {
        if (!Array.isArray(options)) {
            return "options 必须是数组"
        } else {
            let isObject = options.every(e => {
                return isPlainObject(e)
            })
            if (isObject) {
                let valid = options.every(e => {
                    return e.key && e.value
                })
                if (!valid) {
                    return "options 参数缺少key或value"
                } else {
                    return false
                }
            }
            return false;
        }
    }
}
let hasError = (conf) => {
    if (conf.options) {
        return options.hasError(conf.options)
    }else{
        return "必须指定 options"
    }
    return false;
}

function isValid(value){
    return this.options.some(e=>{
        if(e.key && e.value){
            return value === e.key
        }else{
            return value === e
        }
    })
}

function patchDefault(value){
    return value;
}

function defaultValue(){
    return ''
}

module.exports = {
    hasError,
    isValid,
    patchDefault,
    defaultValue
}