let hasError = (conf) => {
    if(conf.default){
        return '该类型不允许设置default值'
    }
}

//是否该组件的合法性在parser.js中判断
function isValid(value){
    return value.type === '__pg_type_slot_component__' && Array.isArray(value.value);
}

function patchDefault(value){
    return value;
}

function defaultValue(){
    return {
        type: '__pg_type_slot_component__',
        value: []
    };
}

module.exports = {
    hasError,
    isValid,
    patchDefault,
    defaultValue
}