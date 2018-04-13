import component from './refer-component.vue';
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