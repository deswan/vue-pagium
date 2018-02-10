import input from './string.vue';
const configStrategy = {
}
const pass = ['options']
export default function (config) {
    const props = {};
    pass.forEach((name)=>{
        let v;
        if((v = config[name]) !== undefined){
            props[name] = configStrategy[name] ? configStrategy[name](v) : v;
        }
    })
    return {
        name:config.name,   //变量名
        label:config.label, //中文label
        input,
        props
    }
}