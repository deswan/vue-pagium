let hasError = (conf) => {

}

function isValid(value){
    return typeof value == 'number'
}

function patch(value) {
    return value;
}

function defaultValue(){
    return 0;
}

module.exports = {
    hasError,
    isValid,
    patch,
    defaultValue
}