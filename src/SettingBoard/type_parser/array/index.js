import input from './array.vue';
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
    props._itemCOM = scheme2Input([{...conf,value:conf.value[0],label:null}])[0]
    return {
        name:conf.name,
        label:conf.label,
        input,
        props,
        conf
    }
}
