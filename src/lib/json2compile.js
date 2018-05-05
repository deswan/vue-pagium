const utils = require('../utils/utils')
const checkDataValid = require('../utils/checkDataValid')
const scheme2Default = require('../utils/scheme2Default');

module.exports = function (data, allComsConfig) {

    checkDataValid(data, allComsConfig)

    let allComsName = utils.getAllNameInData(data);

    function traverse(list) {
        let result = []
        list.forEach(item => {
            let config = allComsConfig[item.type];

            let node = {
                name: item.name,
                type: item.type,
                __pg_slot__: false
            }

            let children = item.children ? traverse(item.children) : [];

            node.children = children;

            node.props = item.props ? utils.patchProps(item.props, config) : {};

            console.log('after patchProps',node.name, JSON.stringify(node.props, null, 2))

            //parseSlot
            for (let key in node.props) {
                node.props[key] = utils.parseSlot(key, node.props[key], node, (name) => {
                    return allComsName.find(e => {
                        return e === name
                    })
                }, (name) => {
                    let ret;
                    utils.traverse((item) => {
                        if (item.name === name) {
                            ret = allComsConfig[item.type].exposeProperty
                        }
                    }, data)
                    return ret;
                },true)
            }

            node.props = {
                ...scheme2Default(config.props),
                ...node.props
            }

            console.log('props',node.props)


            result.push(node)
        })
        return result;
    }
    return traverse(data)
}