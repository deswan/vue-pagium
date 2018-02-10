import input from './object.vue';
import scheme2Input from '../../scheme2Input.js';
const pass = ['default','format'];
const configStrategy = {
    format(config){
        return scheme2Input(config)
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
        input,
        props,
        config
    }
}
