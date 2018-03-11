import input from './object.vue';
import scheme2Input from '../../scheme2Input.js';
const pass = ['format'];
const configStrategy = {
    format(config){
        return scheme2Input(config)
    }
}
export default function (conf) {
    const props = {};
    pass.forEach((name)=>{
        let v;
        if((v = conf[name]) !== undefined){
            props[name] = configStrategy[name] ? configStrategy[name](v) : v;
        }
    })
    return {
        name:conf.name,
        label:conf.label,
        input,
        props,
        conf
    }
}
