import string from './type_parser/string'
import boolean from './type_parser/boolean'
import object from './type_parser/object'
import array from './type_parser/array'
import select from './type_parser/select'
import number from './type_parser/number'
import new_component from './type_parser/new-component'
const TYPES = {
    string,
    boolean,
    object,
    array,
    select,
    number,
    new_component
}
export default function (config) {
    let inputs = [];
    config.forEach((item) => {
        let loader = getLoader(item.value)
        inputs = inputs.concat(loader(item))
    })
    return inputs
}
/**
 * @param {*} type 输入类型
 * @return Loader
 */
function getLoader(type) {
    if (typeof type == 'string' && TYPES[type]) {
        return TYPES[type];
    } else if(type == 'new-component'){
        return TYPES.new_component;
    } else if (Array.isArray(type) && type.length == 1) {
        return TYPES.array;
    }
}