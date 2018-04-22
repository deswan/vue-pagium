let hasError = (conf) => {

}

function isValid(value){
    return typeof value == 'number'
}

function patchDefault(value) {
    return value;
}

function defaultValue(){
    return 0;
}

module.exports = {
    hasError,
    isValid,
    patchDefault,
    defaultValue
}