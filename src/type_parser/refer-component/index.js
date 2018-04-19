let hasError = (conf) => {
    if(conf.default){
        return '该类型不允许设置default值'
    }
}

function isValid(value){
    return value.type === '__pg_type_refer_component__' && typeof value.value === 'string';
}

function patchDefault(value){
    return value;
}

function defaultValue(){
    return {
        type: '__pg_type_refer_component__',
        value: ''
    };
}

module.exports = {
    hasError,
    isValid,
    patchDefault,
    defaultValue
}