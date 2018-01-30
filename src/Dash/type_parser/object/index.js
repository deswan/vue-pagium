import component from './object.vue';
import config2Components from '../../config2Components.js';
const pass = ['label','default','format'];
const configStrategy = {
    format(config){
        return config2Components(config)
    }
}
export default function (config) {
    const props = {};
    pass.forEach((name)=>{
        let v;
        if((v = config[name]) !== undefined){
            props[name] = configStrategy[name] ? configStrategy[name](v) : v;
        }
    })
    
    return {
        name:config.name,
        label:config.label,
        component,
        props,
        config
    }
}
