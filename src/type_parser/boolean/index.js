let hasError = (conf) => {
    
}

function isValid(value){
    return typeof value == 'boolean'
}

function patch(value) {
    return value;
}

function defaultValue(){
    return false;
}

module.exports = {
    hasError,
    isValid,
    patch,
    defaultValue
}