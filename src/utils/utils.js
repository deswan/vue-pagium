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

module.exports = {
    isPlainObject,
    isNameExist,
    isValidIdentifier
}