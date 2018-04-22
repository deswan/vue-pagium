let hasError = (conf) => {
    
}

function isValid(value){
    return typeof value == 'boolean'
}

function patchDefault(value) {
    return value;
}

function defaultValue(){
    return false;
}

module.exports = {
    hasError,
    isValid,
    patchDefault,
    defaultValue
}