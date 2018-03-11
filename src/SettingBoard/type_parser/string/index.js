import input from './string.vue';
const configStrategy = {
}
const pass = ['options']
export default function (conf) {
    const props = {};
    pass.forEach((name)=>{
        let v;
        if((v = conf[name]) !== undefined){
            props[name] = configStrategy[name] ? configStrategy[name](v) : v;
        }
    })
    return {
        name:conf.name,   //变量名
        label:conf.label, //中文label
        input,
        props
    }
}