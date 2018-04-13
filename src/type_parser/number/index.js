import component from './number.vue';
let hasError = (conf) => {

}

let input = {
    component,
    propsLoader(conf){
        return {}
    }
}

export {
    input,
    hasError
}