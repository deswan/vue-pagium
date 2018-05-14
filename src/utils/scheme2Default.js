const {
    getIsValid,
    getDefaultValue,
    getPatch
} = require('../type_parser')

module.exports = function (config, inEditor) {
    let def = {}
    Object.assign(def, conf2Default(config))
    return def;

    function getDefault(conf) {
        let type = conf.type
        if (type === 'string' ||
            type === 'select' ||
            type === 'slot' ||
            type === 'refer' ||
            type === 'object' || type === 'boolean' || type === 'number') {
            return getDefaultValue(type).call(conf)
        } else if (Array.isArray(type) && type.length == 1) {
            let item = getDefaultValue(type).call(conf)
            inEditor && Object.assign(def, {
                [`__${conf.name}`]: JSON.parse(JSON.stringify(conf.default === undefined ? getDefaultValue(type[0]).call(conf) : getPatch(conf.type).call(conf, conf.default)))
            }) //!!!有副作用
            return item
        }
    }
    /**
     * 
     * @param { Array<conf> } config 
     */
    function conf2Default(config) {
        let def = {};
        config.forEach(conf => {
            if (conf.default !== undefined) {
                def[conf.name] = getPatch(conf.type).call(conf, conf.default)
            } else {
                def[conf.name] = getDefault(conf);
            }
        })
        return def;
    }

}