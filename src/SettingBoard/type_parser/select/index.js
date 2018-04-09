import input from './select.vue';
const configStrategy = {
    options(options){
        return options.reduce((arr,item)=>{
            if(typeof item != 'object'){
                arr.push({
                    key:item,
                    value:item
                })
            }else{
                arr.push(item)
            }
            return arr;
        },[])
    }
}
const pass = ['options']
export default function (conf) {
    const props = {};
    pass.forEach((name)=>{
        let v;
        if((v = conf[name]) !== undefined){
            props[name] = configStrategy[name] ? configStrategy[name](v) : v;
        }
    })
    return {
        name:conf.name,
        label:conf.label,
        input,
        props,
        conf
    }
}
