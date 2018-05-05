const {
    getIsValid,
    getDefaultValue,
    getPatch
} = require('../type_parser')

module.exports = function (config) {
    let def = {}
    Object.assign(def, conf2Default(config, true))
    return def;

    function getDefault(conf, isRoot) {
        let type = conf.type
        if (type === 'string' ||
            type === 'select' ||
            type === 'slot' ||
            type === 'refer' ||
            type === 'object' || type === 'boolean' || type === 'number') {
            return getDefaultValue(type).call(conf)
        } else if (Array.isArray(type) && type.length == 1) {
            let item = getDefaultValue(type).call(conf)
            Object.assign(def, {
                [`_${conf.name}`]: JSON.parse(JSON.stringify( conf.default === undefined ? getDefaultValue(type[0]).call(conf) :  getPatch(conf.type).call(conf, conf.default) ))
            }) //!!!有副作用
            return item
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
            if (conf.default !== undefined) {
                def[conf.name] = getPatch(conf.type).call(conf, conf.default)
            }else{
                def[conf.name] = getDefault(conf, isRoot);
            }
        })
        return def;
    }

}