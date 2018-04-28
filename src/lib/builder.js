/**
 * $store.state.components/$store.state.dialogs -> template.data
 */
let uuid = 1;

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