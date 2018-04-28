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