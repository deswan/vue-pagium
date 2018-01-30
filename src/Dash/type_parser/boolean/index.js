import component from './index.vue';
import config2Components from '../../config2Components.js';
const pass = ['label','default','on'];
const configStrategy = {
    on(config){
        return config2Components(config)
    }
}
export default function (config) {
    const props = {};
    pass.forEach((name)=>{
        let v;
        if((v = config[name]) !== undefined){
            if(configStrategy[name]){
                props[name] = configStrategy[name](v);
            }
            props[name] = v;
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
