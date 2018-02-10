export default function (config) {
    return c2d(config);
}
function c2d(config) {
    let df = {};
    config.forEach(conf => {
        df[conf.name] = conf.default !== undefined ? conf.default : getDefault(conf.value,conf);
    })
    return df;
}
function getDefault(type,conf) {
    const defaultMap = {
        String: '',
        Boolean: false,
        Object:{}
    }
    if (typeof type === 'function') {
        return defaultMap[type.name]
    } else if (Array.isArray(type) && type.length == 1) {
        if(type[0] === Object){
            return conf.format ? [c2d(conf.format)] : [getDefault(Object)]
        }
    }
}