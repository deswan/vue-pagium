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
                })
            }

            result.push({
                name: item.name,
                type: item.type,
                isDialog: config.isDialog,
                exposeProperty: config.exposeProperty,
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


module.exports = template2Store