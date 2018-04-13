import component from './boolean.vue';
import scheme2Input from '../../gui/Create/SettingBoard/scheme2Input';

let hasError = (conf) => {

}

let input = {
    component,
    propsLoader(conf) {
        return {
            subInput: conf.on && scheme2Input(conf.on)
        }
    }
}

export {
    input,
    hasError
}