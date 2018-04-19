var hasError = (conf) => {}

function isValid(value) {
    return typeof value == 'string'
}

function patchDefault(value) {
    return value;
}

function defaultValue() {
    return '';
}

module.exports = {
    hasError,
    isValid,
    patchDefault,
    defaultValue
}