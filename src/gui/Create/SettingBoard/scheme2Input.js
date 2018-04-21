import getInput from '../../../type_parser/input'
export default function (config) {
    let inputs = [];
    config.forEach((conf) => {
        inputs = inputs.concat({
            name:conf.name,
            label:conf.label,
            input:getInput(conf.value).input,
            props:getInput(conf.value).propsLoader(conf),
            conf
        })
    })
    return inputs
}