import string from './type_parser/string'
import boolean from './type_parser/boolean'
import object from './type_parser/object'
import array from './type_parser/array'
const components = {
    string,boolean,object,array
}
export default function(config){
    let coms = [];
    config.forEach((item)=>{
        let loader = getLoader(item.value)
        coms = coms.concat(loader(item))
    })
    return coms
}
function getLoader(type){
    if(typeof type === 'function'){
        return components[type.name.toLowerCase()];
    }else if(Array.isArray(type) && type.length == 1){
        return components.array;
    }
}