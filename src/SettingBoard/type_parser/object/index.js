<<<<<<< HEAD:src/SettingBoard/type_parser/object/index.js
import input from './object.vue';
import scheme2Input from '../../scheme2Input.js';
const pass = ['default','format'];
=======
import component from './object.vue';
import config2Components from '../../config2Components.js';
const pass = ['label','format'];
>>>>>>> d04c78f2fff0f593a01ad31590aa24a8ad894278:src/Dash/type_parser/object/index.js
const configStrategy = {
    format(config){
        return scheme2Input(config)
    }
}
export default function (config) {
    const props = {};
    pass.forEach((name)=>{
        let v;
        if((v = config[name]) !== undefined){
            props[name] = configStrategy[name] ? configStrategy[name](v) : v;
        }
    })
<<<<<<< HEAD:src/SettingBoard/type_parser/object/index.js
=======

>>>>>>> d04c78f2fff0f593a01ad31590aa24a8ad894278:src/Dash/type_parser/object/index.js
    return {
        name:config.name,
        label:config.label,
        input,
        props,
        config
    }
}
