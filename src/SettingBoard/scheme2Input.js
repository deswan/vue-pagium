import string from './type_parser/string'
import boolean from './type_parser/boolean'
import object from './type_parser/object'
import array from './type_parser/array'
const TYPES = {
    string,boolean,object,array
}
export default function(config){
    let inputs = [];
    config.forEach((item)=>{
        let loader = getLoader(item.value)
        inputs = inputs.concat(loader(item))
    })
    return inputs
}
/**
 * @param {*} type 输入类型
 * @return Loader
 */
function getLoader(type){
    if(typeof type === 'function'){
        return TYPES[type.name.toLowerCase()];
    }else if(Array.isArray(type) && type.length == 1){
        return TYPES.array;
    }
}