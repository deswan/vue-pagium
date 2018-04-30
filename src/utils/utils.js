const constant = require('../const')

function isPlainObject(e) {
    return Object.prototype.toString.call(e).match(/\[object (.*)\]/)[1] === 'Object'
}

/**
 * 树中是否存在该name的对象
 * @param {Array{children}} list 
 * @param {String} value name
 */
function isNameExist(list, value) {
    return list.some(e => {
        return e.name === value || isNameExist(e.children, value)
    })
}

/**
 * 是否合法标识符
 * @param {String} value 
 */
function isValidIdentifier(value) {
    return /^[$a-zA-Z_][$\w]*$/.test(value);
}

/**
 * 获取config props下的所有name (不包括子对象)
 * @param {Config.props} props 
 */
function getAllPropNameInConfig(props) {
    let arr = [];
    props.forEach(conf => {
        arr.push(conf.name);
    })
    return arr;
}

function getComponentByName(list, comName) {
    let ret = null;

    function find(list) {
        if (!list) return null;
        for (let i = 0, len = list.length; i < len; i++) {
            if (list[i].name === comName) {
                return ret = list[i];
            } else {
                find(list[i].children)
            }
        }
    }
    find(list)
    return ret;
}

function getConfByPropName(propName, config) {
    return config.props.find(item => {
        return item.name === propName
    })
}

//过滤slot类型，赋予slotId;过滤refer类型
function parseSlot(key, value, node, getComName, getExposeProperty, throwError) {
    /**
     * @return [
     *  0:['form1','form2'],
     *  1:['table1']
     * ]
     */
    let slots = [];
    let slotScope = [];
    let newValue = JSON.parse(JSON.stringify(value), function (k, v) {
        if (k === 'type' && v === constant.SLOT_TYPE) {
            //去重
            let len = this.value.length;
            this.value = this.value.filter((e, idx) => {
                return this.value.indexOf(e) == idx;
            })

            //过滤非直接子组件、已经成为slot的子组件
            this.value = this.value.filter(name => {
                console.log(!~[].concat(...slots).indexOf(name))
                return node.children.some(subCom => {
                    return name === subCom.name && !subCom.__pg_slot__
                }) && !~[].concat(...slots).indexOf(name)
            })
            if (throwError && this.value.length !== len) {
                throw new Error(`${JSON.stringify(value,null,2)}\nslot引用的组件不合法（组件必须为直接子组件/不可重复引用同一个组件）`)
            }
            if( this.value.length){
                slots.push(this.value);
                slotScope.push(this.scope)
            }
        } else if (k === 'type' && v === constant.REFER_TYPE) {
            if (this.value) {
                let exposeProperty = getExposeProperty(this.value)

                //过滤不存在的组件以及自身组件
                if (!getComName(this.value) || this.value === node.name || !exposeProperty || !exposeProperty.includes(this.property)) {
                    if (throwError) {
                        throw new Error(`${value}\nrefer引用的组件不合法（组件必须存在/不可引用自身/目标组件必须声明exposeProperty "${this.property}"）`)
                    }
                    this.value = '';
                }
            }
        }
        return v;
    })

    //为子组件添加slot标识
    slots.forEach((slotsName, slotIdx) => {
        node.children.forEach(subCom => {
            if (slotsName.includes(subCom.name)) {
                subCom.__pg_slot__ = `${slotIdx + 1}_${key}`;
                subCom.props._scope = slotScope[slotIdx];
            }
        })
    })

    return newValue;
}

function traverse(doSth, list) {
    let ret = [];
    list.forEach((item, idx) => {
        ret.push(doSth(item, idx));
        traverse(doSth, item.children || []);
    })
    return ret;
}

function patchProps(props, config) {
    return Object.keys(props).reduce((target, key) => {
        let conf = getConfByPropName(key, config);
        target[key] = require('../type_parser').getPatch(conf.value).call(conf, props[key]);
        return target;
    }, {})
}

function getAllNameInData(data){
    let allComsName = getAllName(data);
    //重名检测
    function getAllName(data) {
        let names = []

        function find(list) {
            return list.forEach(e => {
                if (names.includes(e.name)) {
                    throw new Error('名称' + e.name + ' 重复')
                }
                names.push(e.name)
                names.push(find(e.children || []));
            })
        }
        find(data);
        return names
    }
    return allComsName
}

module.exports = {
    isPlainObject,
    isNameExist,
    isValidIdentifier,
    getAllPropNameInConfig,
    getAllNameInData,
    getComponentByName,
    getConfByPropName,
    parseSlot,
    traverse,
    patchProps
}