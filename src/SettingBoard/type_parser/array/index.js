import input from './array.vue';
import scheme2Input from '../../scheme2Input.js';
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
    props._itemCOM = scheme2Input([{...config,value:config.value[0],label:null}])[0]
    return {
        name:config.name,
        label:config.label,
        input,
        props,
        config
    }
}
