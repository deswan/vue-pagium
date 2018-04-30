//config是否填写正确
let hasError = (conf) => {
    return require('../index').getTypeHasError(conf.value[0])({
        ...conf,
        value: conf.value[0]
    })
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
function patch(value) {
    let innerConf = {
        ...this,
        value: this.value[0]
    }
    console.log(value.map(e => {
        return require('../index').getPatch(innerConf.value).call(innerConf, e)
    }))
    return value.map(e => {
        return require('../index').getPatch(innerConf.value).call(innerConf, e)
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
            value: this.value[0]
        }
        return value.map(e => {
            return require('../index').getUpgrade(innerConf.value).call(innerConf, e)
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