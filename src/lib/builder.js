/**
 * $store.state.components/$store.state.dialogs -> template.data
 */
const constant = require('../const')

function traverse(list) {
    let result = []
    list.forEach(item => {
        let children = item.children ? traverse(item.children) : [];

        let props = Object.keys(item.props).reduce((target, name) => {
            if (!name.startsWith('_')) {
                target[name] = item.props[name]
            }
            return target;
        }, {})

        props = JSON.parse(JSON.stringify(props), function (k, v) {
            if (v.type === constant.SLOT_TYPE) {
                v = v.value;
            } else if (v.type === constant.REFER_TYPE) {
                v = v.value
            }
            return v;
        })

        result.push({
            type: item.type,
            name: item.name,
            props: props,
            children,
        })
    })
    return result;
}

module.exports = traverse;