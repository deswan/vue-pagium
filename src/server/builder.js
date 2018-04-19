/**
 * $store.state.components/$store.state.dialogs -> template.data
 */
let uuid = 1;

function traverse(list) {
    let result = []
    list.forEach(item => {
        let children = item.children ? traverse(item.children) : [];

        let propBlacklist = ['name', '__pg_slot__']
        let props = Object.keys(item.props).reduce((target, name) => {
            if (!~propBlacklist.indexOf(name)) {
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

// module.exports = ({
//     data,
//     name,
//     remark
// }) => {
//     let d = new Date();
//     let date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " +
//         d.getHours() + ":" + d.getMinutes() + ':' + d.getSeconds();
//     return {
//         name,
//         date,
//         remark,
//         data:traverse(data),
//     }
// }

module.exports = traverse;