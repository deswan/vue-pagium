import {input as string} from '../../../type_parser/string'
import {input as boolean} from '../../../type_parser/boolean'
import {input as object} from '../../../type_parser/object'
import {input as array} from '../../../type_parser/array'
import {input as select} from '../../../type_parser/select'
import {input as number} from '../../../type_parser/number'
import {input as slot_component} from '../../../type_parser/slot-component'
import {input as refer_component} from '../../../type_parser/refer-component'
const TYPES = {
    string,
    boolean,
    object,
    array,
    select,
    number,
    slot_component,
    refer_component
}
export default function (config) {
    let inputs = [];
    config.forEach((conf) => {
        let input = getInput(conf.value)
        inputs = inputs.concat({
            name:conf.name,
            label:conf.label,
            input:input.component,
            props:input.propsLoader(conf),
            conf
        })
    })
    return inputs
}
/**
 * @param {*} type 输入类型
 * @return Loader
 */
function getInput(type) {
    if (typeof type == 'string' && TYPES[type]) {
        return TYPES[type];
    } else if (type == 'slot-component') {
        return TYPES.slot_component;
    } else if (type == 'refer-component') {
        return TYPES.refer_component;
    } else if (Array.isArray(type) && type.length == 1) {
        return TYPES.array;
    }
}