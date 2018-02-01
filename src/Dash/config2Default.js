export default function (conf) {
    return getDefault(conf);
}

function getDefault(conf) {
    if (conf.default !== undefined) return conf.default;
    let type = conf.value;
    const defaultMap = {
        String() {
            return '';
        },
        Boolean() {
            return false;
        },
        Object() {
            if(conf.format){
                return conf.format.map(conf => {
                    return {
                        label: conf.label,
                        name: conf.name,
                        value: defaultMap[conf.value.name]()
                    };
                })
            }else{
                return [{
                    label: '',
                    name: '',
                    value: ''
                }]
            }
        }
    }
    if (typeof type === 'function' && defaultMap[type.name] !== undefined) {
        return defaultMap[type.name]();
    } else if (Array.isArray(type) && type.length == 1) {
        return [defaultMap[type[0].name]()]
    }
}