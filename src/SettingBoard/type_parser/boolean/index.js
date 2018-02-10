import input from './boolean.vue';
import scheme2Input from '../../scheme2Input.js';
const pass = [];
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
    let com = {
        name:config.name,
        label:config.label,
        input,
        props,
        config
    }
    config.on && (com.subInput = scheme2Input(config.on))
    return com;
}
