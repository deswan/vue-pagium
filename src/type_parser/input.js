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
    'slot': slot_component,
    'refer': refer_component
}

const propsLoaders = {
    string() {
        return {}
    },
    boolean(conf) {
        return {
            subInput:conf.on && scheme2Input(conf.on)
        }
    },
    object(conf) {
        return {
            format:conf.format && scheme2Input(conf.format)
        }
    },
    array(conf) {
        let props = {}
        let _itemCOM = scheme2Input([{ 
            ...conf,
            type: conf.type[0]
        }])[0]
        if (conf.type[0] === 'object' && _itemCOM.props.format) {
            props._itemCOM = _itemCOM.props.format
        } else {
            props._itemCOM = [_itemCOM]
        }
        return props;
    },
    select(conf) {
        /**
         * options有两种写法，[{key,value}]为标准写法，[String]为简写法
         * 实现简写->标准写法的转换
         * etc.['name1','name2'] => [{key,value}]
         */

        let options = conf.options.reduce((arr, item) => {
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
            options
        };
    },
    number() {
        return {}
    },
    'slot' () {
        return {}
    },
    'refer' () {
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