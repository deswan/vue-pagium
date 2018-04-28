const utils = require('../utils/utils')
const checkDataValid = require('../utils/checkDataValid')
const scheme2Default = require('../utils/scheme2Default');

module.exports = function (data, allComsConfig) {

    checkDataValid(data, allComsConfig)

    let allComsName = utils.getAllNameInData(data);

    function traverse(list) {
        let result = []
        list.forEach(item => {
            let children = item.children ? traverse(item.children) : [];
            let config = allComsConfig[item.type];

            item.props = utils.patchProps(item.props, config);

            console.log('after patchProps', JSON.stringify(item.props, null, 2))

            //parseSlot
            for (let key in item.props) {
                item.props[key] = utils.parseSlot(key, item.props[key], item, (name) => {
                    return allComsName.find(e => {
                        return e === name
                    })
                }, (name) => {
                    let ret;
                    utils.traverse((item) => {
                        if (item.name === name) {
                            ret = allComsConfig[item.type].exposeProperty
                        }
                    })
                    return ret;
                }, true)
            }

            result.push({
                name: item.name,
                type: item.type,
                props: {
                    ...scheme2Default(config.props),
                    ...item.props
                },
                children,
                __pg_slot__: false
            })
        })
        return result;
    }
    return traverse(data)
}