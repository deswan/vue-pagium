import string from './string/string.vue'
import select from './select/select.vue'
import array from './array/array.vue'
import boolean from './boolean/boolean.vue'
import number from './number/number.vue'
import object from './object/object.vue'
import refer_component from './refer-component/refer-component.vue'
import slot_component from './slot-component/slot-component.vue'

import scheme2Input from '../gui/Create/SettingBoard/scheme2Input';

const INPUTS = {
    string,
    boolean,
    object,
    array,
    select,
    number,
    'slot-component': slot_component,
    'refer-component': refer_component
}

const propsLoaders = {
    string() {
        return {}
    },
    boolean() {
        return {}
    },
    object(conf) {
        return {
            format:conf.format && scheme2Input(conf.format)
        }
    },
    array(conf) {
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
    },
    select(conf) {
        let options = conf.options;
        /**
         * options有两种写法，[Object<key,value>]为标准写法，[String]为简写法
         * 实现简写->标准写法的转换
         * etc.['name1','name2'] => [{key,value}]
         */

        let ret = options.reduce((arr, item) => {
            if (typeof item != 'object') {
                arr.push({
                    key: item,
                    value: item
                })
            } else {
                arr.push(item)
            }
            return arr;
        }, [])

        return {
            options:ret
        };
    },
    number() {
        return {}
    },
    'slot-component' () {
        return {}
    },
    'refer-component' () {
        return {}
    }
}

export default function (type) {
    if (typeof type == 'string' && INPUTS[type]) {
        return {
            input:INPUTS[type],
            propsLoader:propsLoaders[type]
        }
    } else if (Array.isArray(type) && type.length == 1) {
        return {
            input:INPUTS.array,
            propsLoader:propsLoaders.array
        }
    }
}