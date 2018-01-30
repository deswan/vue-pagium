import component from './array.vue';
import config2Components from '../../config2Components.js';
const pass = ['default'];
const configStrategy = {
}
export default function (config) {
    const props = {};
    pass.forEach((name)=>{
        let v;
        if((v = config[name]) !== undefined){
            props[name] = configStrategy[name] ? configStrategy[name](v) : v;
        }
    })
    props._itemCOM = config2Components([{...config,value:config.value[0],label:null}])
    
    return {
        name:config.name,
        label:config.label,
        component,
        props,
        config
    }
}
