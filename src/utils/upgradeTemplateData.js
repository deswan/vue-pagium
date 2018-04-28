const {
    getUpgrade
} = require('../type_parser')
const utils = require('./utils')

function upgradeTemplateData(data, allComsConfig) {
    function traverse(list) {
        return list.filter(item => {
            let config = allComsConfig[item.type];
            if (config) {
                item.props && (item.props = Object.keys(item.props).reduce((target, propName) => {
                    let conf = utils.getConfByPropName(propName, config);
                    if (conf) {
                        let upgraded = getUpgrade(conf.value).call(conf, item.props[propName]);
                        upgraded !== undefined && (target[propName] = upgraded);
                    }
                    return target;
                }, {}))
                item.children = traverse(item.children || []);
                return true;
            }
            //无对应的组件则删除该项
        })
    }
    return traverse(data);
}
module.exports = upgradeTemplateData