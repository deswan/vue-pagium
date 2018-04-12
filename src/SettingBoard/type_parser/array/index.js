import input from './array.vue';
import scheme2Input from '../../scheme2Input';
const pass = [];
const configStrategy = {}
export default function (conf) {
    const props = {};
    pass.forEach((name) => {
        let v;
        if ((v = conf[name]) !== undefined) {
            props[name] = configStrategy[name] ? configStrategy[name](v) : v;
        }
    })
    let _itemCOM = scheme2Input([{ ...conf,
        value: conf.value[0],
        label: null
    }])[0]
    if (conf.value[0] === 'object' && _itemCOM.props.format) {
        props._itemCOM = _itemCOM.props.format
    } else {
        props._itemCOM = [_itemCOM]
    }
    return {
        name: conf.name,
        label: conf.label,
        input,
        props,
        conf
    }
}