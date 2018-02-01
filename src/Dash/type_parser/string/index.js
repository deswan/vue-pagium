import component from './string.vue';
export default function (config) {
    const props = {};
    return {
        name:config.name,
        label:config.label,
        component,
        props,
        config
    }
}