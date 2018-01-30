import string from './type_parser/string'
import boolean from './type_parser/boolean'
const components = {
    string,boolean
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
    let arrExp =  /^Array\[(.*)\]$/;
    if(typeof type === 'function'){
        return components[type.name.toLowerCase()];
    }else if(arrExp.test(type)){
        
    }
}