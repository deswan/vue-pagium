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