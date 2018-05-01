//config是否填写正确
let hasError = (conf) => {
    return require('../index').getTypeHasError(conf.type[0])({
        ...conf,
        type: conf.type[0]
    })
}

//值是否合法
function isValid(value) {
    const {
        getIsValid
    } = require('../index');
    return Array.isArray(value) && value.every(item => {
        return getIsValid(this.type[0]).call({
            ...this,
            type: this.type[0]
        }, item)
    })
}


//前提：isValid
//值补完
function patch(value) {
    let innerConf = {
        ...this,
        type: this.type[0]
    }
    return value.map(e => {
        return require('../index').getPatch(innerConf.type).call(innerConf, e)
    })
    
}

//默认值
function defaultValue() {
    return [];
}

function upgrade(value) {
    if (Array.isArray(value)) {
        let innerConf = {
            ...this,
            type: this.type[0]
        }
        return value.map(e => {
            return require('../index').getUpgrade(innerConf.type).call(innerConf, e)
        }).filter(e => {
            return e !== undefined
        })
    } else {
        return;
    }
}

module.exports = {
    hasError,
    isValid,
    defaultValue,
    patch,
    upgrade
}