import input from './refer-component.vue';
const configStrategy = {
   
}
const pass = []
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
