const {
    isPlainObject,isValidIdentifier
} = require('../../utils/utils')
const {
    SLOT_TYPE
} = require('../../const')
let hasError = (conf) => {
    if (conf.default) {
        return '该类型不允许设置default值'
    }
    if (conf.scope && (typeof conf.scope != 'string' || !isValidIdentifier(conf.scope) )) {
        return 'scope属性不合法'
    }
}

function isValid(value) {
    if (isPlainObject(value)) {
        return value.type === SLOT_TYPE && Array.isArray(value.value) && (value.scope === this.scope);
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
            value,
            scope: this.scope
        };
    }
}

function defaultValue() {
    return {
        type: SLOT_TYPE,
        value: [],
        scope: this.scope
    };
}

function upgrade(value) {
    if (isValid.call(this, value)) {
        return value
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