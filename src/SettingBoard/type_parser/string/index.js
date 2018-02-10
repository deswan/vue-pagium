import input from './string.vue';
export default function (config) {
    const pass = ['default'];
    const props = {};
    pass.forEach((name)=>{
        config[name] !== undefined && (props[name] = config[name]);
    })
    return {
        name:config.name,   //变量名
        label:config.label, //中文label
        input,
        props,
        config
    }
}