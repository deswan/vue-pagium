const {isPlainObject} = require('../../utils/utils')
const {REFER_TYPE} = require('../../const')
let hasError = (conf) => {
    if (conf.default) {
        return '该类型不允许设置default值'
    }
    if (!conf.property) {
        return '请设置property属性以标明所引用的data/methods/computed名称'
    }
    if (typeof conf.property != 'string') {
        return 'property属性必须是字符串类型'
    }
}

function isValid(value) {
    if(isPlainObject(value)){
        return value.type === REFER_TYPE && typeof value.type === 'string' && value.property === this.property;
    }else if(typeof value === 'string'){
        return true;
    }
}

function patch(value) {
    if(isPlainObject(value)){
        return value;
    }else if(typeof value === 'string'){
        return {
            type: REFER_TYPE,
            value,
            property: this.property
        };
    }
}

function defaultValue() {
    return {
        type: REFER_TYPE,
        value: '',
        property: this.property
    };
}

function upgrade(value) {
    if(isValid.call(this,value)){
        return value
    }else{
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