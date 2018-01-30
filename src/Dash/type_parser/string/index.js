import component from './string.vue';
export default function (config) {
    const pass = ['label','default'];
    const props = {};
    pass.forEach((name)=>{
        config[name] !== undefined && (props[name] = config[name]);
    })
    return {
        name:config.name,
        label:config.label,
        component,
        props,
        config
    }
}