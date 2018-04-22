function isPlainObject(e) {
    return Object.prototype.toString.call(e).match(/\[object (.*)\]/)[1] === 'Object'
}

/**
 * 树中是否存在该name的对象
 * @param {Array{children}} list 
 * @param {String} value name
 */
function isNameExist(list, value) {
    return list.some(e => {
        return e.name === value || isNameExist(e.children,value)
    })
}

/**
 * 是否合法标识符
 * @param {String} value 
 */
function isValidIdentifier(value) {
    return /^\D[$\w]*$/.test(value);
}

/**
 * 获取config props下的所有name (不包括子对象)
 * @param {Config.props} props 
 */
function getAllPropNameInConfig(props){
    let arr = [];
    props.forEach(conf=>{
        arr.push(conf.name);
    })
    return arr;
}

function getComponentByName(list,comName) {
    let ret = null;
    function find(list) {
        if (!list) return null;
        for (let i = 0, len = list.length; i < len; i++) {
            if (list[i].name === comName) {
                return ret = list[i];
            } else {
                find(list[i].children)
            }
        }
    }
    find(list)
    return ret;
}

module.exports = {
    isPlainObject,
    isNameExist,
    isValidIdentifier,
    getAllPropNameInConfig,
    getComponentByName
}