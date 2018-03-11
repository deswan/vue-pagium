export default function (config) {
    let def = {}
    Object.assign(def, conf2Default(config, true))
    return def;

    function getDefault(conf, isRoot) {
        let type = conf.value
        if (type === String) {
            return ''
        } else if (type === Boolean) {
            if (conf.on && isRoot) { //仅限Root
                Object.assign(def, conf2Default(conf.on)) //!!!有副作用
            }
            return false;
        } else if (type === Object) {
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
            return new Array(2).fill('').map(() => {
                return JSON.parse(JSON.stringify(item));    //防止引用同一个实例
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