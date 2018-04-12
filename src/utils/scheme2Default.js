export default function (config) {
    let def = {}
    Object.assign(def, conf2Default(config, true))
    return def;

    function getDefault(conf, isRoot) {
        let type = conf.value
        if (type === 'string') {
            return ''
        } else if (type === 'select') {
            return ''
        } else if (type === 'slot-component') {
            return {
                type: '__pg_type_new_component__',
                value: []
            }
        } else if (type === 'refer-component') {
            return {
                type: '__pg_type_refer_component__',
                value: ''
            }
        } else if (type === 'boolean') {
            if (conf.on && isRoot) { //仅限Root
                Object.assign(def, conf2Default(conf.on)) //!!!有副作用
            }
            return false;
        } else if (type === 'object') {
            if (conf.format) {
                return conf2Default(conf.format);
            } else {
                return {
                    name: '',
                    value: ''
                }
            }
        } else if (Array.isArray(type) && type.length == 1) {
            let item = getDefault({ ...conf,
                value: type[0]
            })
            Object.assign(def, {
                [`_${conf.name}`]: JSON.parse(JSON.stringify(item))
            }) //!!!有副作用
            return new Array(2).fill('').map(() => {
                return JSON.parse(JSON.stringify(item)); //防止引用同一个实例
            })
        }
    }
    /**
     * 
     * @param { Array<conf> } config 
     * @param { Boolean } isRoot 是否是根config
     */
    function conf2Default(config, isRoot) {
        let def = {};
        config.forEach(conf => {
            def[conf.name] = conf.default !== undefined ? conf.default : getDefault(conf, isRoot);
        })
        return def;
    }

}