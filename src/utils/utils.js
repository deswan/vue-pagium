export function isPlainObject(e){
    return Object.prototype.toString.call(e).match(/\[object (.*)\]/)[1] === 'Object'
}