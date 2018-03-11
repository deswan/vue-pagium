import input from './boolean.vue';
import scheme2Input from '../../scheme2Input.js';
const pass = [];
const configStrategy = {
}
export default function (conf) {
    const props = {};
    pass.forEach((name)=>{
        let v;
        if((v = conf[name]) !== undefined){
            props[name] = configStrategy[name] ? configStrategy[name](v) : v;
        }
    })
    let com = {
        name:conf.name,
        label:conf.label,
        input,
        props,
        conf
    }
    conf.on && (com.subInput = scheme2Input(conf.on))
    return com;
}
