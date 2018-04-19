const string = require('./string')
const boolean = require('./boolean')
const object = require('./object')
const array = require('./array')
const select = require('./select')
const number = require('./number')
const slot_component = require('./slot-component')
const refer_component = require('./refer-component')

const TYPES = {
    string,
    boolean,
    object,
    array,
    select,
    number,
    'slot-component':slot_component,
    'refer-component':refer_component
}

function getType(type){
    if (typeof type == 'string' && TYPES[type]) {
        return TYPES[type];
    }else if (Array.isArray(type) && type.length == 1) {
        return TYPES.array;
    }
}
module.exports = {
    getType,
    getAllTypesString(){
        return ['string','boolean','object','select','number','slot-component','refer-component','[Any]'];
    },
    getTypeHasError(type){
        return getType(type) && getType(type).hasError
    },
    getIsValid(type){
        return getType(type) && getType(type).isValid
    },
    getPatchDefault(type){
        return getType(type) && getType(type).patchDefault
    },
    getDefaultValue(type){
        return getType(type) && getType(type).defaultValue
    }
}