import component from './object.vue';
import scheme2Input from '../../gui/Create/SettingBoard/scheme2Input';
let hasError = (conf) => {

}

let input = {
    component,
    propsLoader(conf){
        return {
            format: conf.format && scheme2Input(conf.format)
        }
    }
}

export {
    input,
    hasError
}
