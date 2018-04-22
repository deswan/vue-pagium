let hasError = (conf) => {
    if (conf.default) {
        return '该类型不允许设置default值'
    }
    if (!conf.property) {
        return '请设置property属性以标明所引用的data/methods名称'
    }
    if (typeof conf.property != 'string') {
        return 'property属性必须是字符串类型'
    }
}

function isValid(value) {
    return value.type === '__pg_type_refer_component__' && typeof value.value === 'string' && typeof value.property === 'string';
}

function patchDefault(value) {
    return value;
}

function defaultValue() {
    return {
        type: '__pg_type_refer_component__',
        value: '',
        property: this.property
    };
}

module.exports = {
    hasError,
    isValid,
    patchDefault,
    defaultValue
}