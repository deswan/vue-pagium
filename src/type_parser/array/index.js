//config是否填写正确
let hasError = (conf) => {

}

//值是否合法
function isValid(value) {
    const {
        getIsValid
    } = require('../index');
    return Array.isArray(value) && value.every(item => {
        return getIsValid(this.value[0]).call({
            ...this,
            value: this.value[0]
        }, item)
    })
}


//前提：isValid
//值补完
function patchDefault(value) {
    const {
        getPatchDefault
    } = require('../index');
    let innerConf = {
        ...this,
        value: this.value[0]
    }
    return value.map(e => {
        return getPatchDefault(innerConf.value).call(innerConf, e)
    })
}

//默认值
function defaultValue() {
    return [];
}

module.exports = {
    hasError,
    isValid,
    defaultValue,
    patchDefault
}