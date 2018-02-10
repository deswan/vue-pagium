import input from './string.vue';
export default function (config) {
    const props = {};
    return {
        name:config.name,   //变量名
        label:config.label, //中文label
        input,
        props,
        config
    }
}