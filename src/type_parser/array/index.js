import component from './array.vue';
import scheme2Input from '../../gui/Create/SettingBoard/scheme2Input';
let hasError = (conf) => {

}

let input = {
    component,
    propsLoader(conf) {
        let props = {}
        let _itemCOM = scheme2Input([{ ...conf,
            value: conf.value[0],
            label: null
        }])[0]
        if (conf.value[0] === 'object' && _itemCOM.props.format) {
            props._itemCOM = _itemCOM.props.format
        } else {
            props._itemCOM = [_itemCOM]
        }
        return props;
    }
}

export {
    input,
    hasError
}