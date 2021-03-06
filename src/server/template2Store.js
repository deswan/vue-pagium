/**
 * browser模块
 * template.data -> $store.state.components/$store.state.dialogs
 * TODO:检查合法性
 */
const scheme2Default = require('../utils/scheme2Default');
const upgradeTemplateData = require('../utils/upgradeTemplateData');
const checkDataValid = require('../utils/checkDataValid');
const utils = require('../utils/utils');

function template2Store(data, allComsConfig, allPages) {
    //upgrade
    let components = upgradeTemplateData(data.components || [], allComsConfig);
    let page = allPages[data.page] ? data.page : '';
    checkDataValid({
        page,
        components
    }, allComsConfig, allPages)

    let allComsName = utils.getAllComNameInData(components);

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

            node.props = item.props ? utils.patchProps(item.props, config) : {};

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
                    }, components)
                    return ret;
                })
            }

            node.props = {
                ...scheme2Default(config.props,true),
                ...node.props,
                _name:node.name
            }

            node.realTimePreview = utils.loadRealTimePreview(node.type,node.props)

            result.push(node)
        })
        return result;
    }
    return {
        page,
        components: traverse(components || [])
    }
}


module.exports = template2Store