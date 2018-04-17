import component from './select.vue';
const isPlainObject = require('../../utils/utils')
let options = {
    loader(options) {
        /**
         * options有两种写法，[Object<key,value>]为标准写法，[String]为简写法
         * 实现简写->标准写法的转换
         * etc.['name1','name2'] => [{key,value}]
         */
        return options.reduce((arr, item) => {
            if (typeof item != 'object') {
                arr.push({
                    key: item,
                    value: item
                })
            } else {
                arr.push(item)
            }
            return arr;
        }, [])
    },
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

let input = {
    component,
    propsLoader(conf) {
        return {
            options: options.loader(conf.options)
        }
    }
}

export {
    input,
    hasError
}