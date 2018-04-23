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

module.exports = {
    hasError,
    isValid,
    patch,
    defaultValue
}