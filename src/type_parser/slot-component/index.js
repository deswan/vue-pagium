const {
    SLOT_TYPE
} = require('../../const')
let hasError = (conf) => {
    if (conf.default) {
        return '该类型不允许设置default值'
    }
}

//是否该组件的合法性在parser.js中判断
function isValid(value) {
    if (isPlainObject(value)) {
        return value.type === SLOT_TYPE && Array.isArray(value.value);
    } else if (Array.isArray(value)) {
        return true;
    }
}

function patch(value) {
    if (isPlainObject(value)) {
        return value;
    } else if (Array.isArray(value)) {
        return {
            type: SLOT_TYPE,
            value
        };
    }
}

function defaultValue() {
    return {
        type: SLOT_TYPE,
        value: []
    };
}

module.exports = {
    hasError,
    isValid,
    patch,
    defaultValue
}