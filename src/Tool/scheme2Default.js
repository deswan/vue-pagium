export default function (config) {
    let df = {}
    Object.assign(df,conf2Default(config))
    return df;
    function getDefault(conf) {
        let type = conf.value
        const defaultMap = {
            String() {
                return '';
            },
            Boolean() {
                if(conf.on){
                    Object.assign(df,conf2Default(conf.on))
                }
                return false;
            },
            Object() {
                if(conf.format){
                    return conf.format.reduce((obj,subConf) => {
                        obj[subConf.name] = getDefault(subConf)
                        return obj;
                    },{})
                }else{
                    return {
                        name: '',
                        value: ''
                    }
                }
            }
        }
        if (typeof type === 'function') {
            return defaultMap[type.name]()
        } else if (Array.isArray(type) && type.length == 1) {
            let item = defaultMap[type[0].name]();
            return new Array(2).fill('').map(()=>{
                return JSON.parse(JSON.stringify(item));
            })
        }
    }

    function conf2Default(config){
        let df = {};
        config.forEach(conf => {
            df[conf.name] = conf.default !== undefined ? conf.default : getDefault(conf);
        })
        return df;
    }

}