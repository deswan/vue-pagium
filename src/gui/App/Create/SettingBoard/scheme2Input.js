import getInput from '@/type_parser/input'
export default function (config) {
    let inputs = [];
    config.forEach((conf) => {
        inputs = inputs.concat({
            name:conf.name,
            label:conf.label || conf.name,
            input:getInput(conf.type).input,
            props:getInput(conf.type).propsLoader(conf),
            conf
        })
    })
    return inputs
}