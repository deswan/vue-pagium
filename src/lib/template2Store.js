/**
 * browser/node 共用模块
 * template.data -> $store.state.components/$store.state.dialogs
 * TODO:检查合法性
 */
const scheme2Default = require('../utils/scheme2Default');
const upgradeTemplateData = require('../utils/upgradeTemplateData');
const checkDataValid = require('../utils/checkDataValid');
const utils = require('../utils/utils');

//checked data valid;
function template2Store(data, allComsConfig) {

    //upgrade
    data = upgradeTemplateData(data, allComsConfig);

    console.log('after upgradeTemplateData', JSON.stringify(data, null, 2))

    checkDataValid(data, allComsConfig)

    let allComsName = utils.getAllNameInData(data);

    function traverse(list) {
        let result = []
        list.forEach(item => {
            let config = allComsConfig[item.type];

            let node = {
                name: item.name,
                type: item.type,
                isDialog: config.isDialog,
                description: config.description || '',
                exposeProperty: config.exposeProperty,
                __pg_slot__: false
            }

            let children = item.children ? traverse(item.children) : [];

            node.children = children;

            node.props = utils.patchProps(item.props, config);

            console.log('after patchProps', JSON.stringify(item.props, null, 2))

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
                })
            }

            node.props = {
                ...scheme2Default(config.props),
                ...node.props
            }


            result.push(node)
        })
        return result;
    }
    return traverse(data)
}


module.exports = template2Store