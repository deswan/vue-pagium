function isPlainObject(e){
    return Object.prototype.toString.call(e).match(/\[object (.*)\]/)[1] === 'Object'
}
function isNameExist(list,value) {
    if (!list.length) return false;
    return !list.every(e => {
        return e.name !== value && !isNameExist(e.children)
    })
}
module.exports = {
    isPlainObject,
    isNameExist
}