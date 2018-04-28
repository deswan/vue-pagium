var hasError = (conf) => {}

function isValid(value) {
    return typeof value == 'string'
}

function patch(value) {
    return value;
}

function defaultValue() {
    return '';
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