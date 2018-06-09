const constant = require('../const')

/**
 * 是否为纯对象
 * @param {Any} e 
 * @return {boolean}
 */
function isPlainObject(e) {
    return Object.prototype.toString.call(e).match(/\[object (.*)\]/)[1] === 'Object'
}

/**
 * 检测是否为合法js标识符
 * @param {string} value 
 * @return {boolean}
 */
function isValidIdentifier(value) {
    return /^[$a-zA-Z_][$\w]*$/.test(value);
}

/**
 * 根据config.js获取某个组件的所有参数
 * @param {Config.props} props 
 * @return {array}
 */
function getAllPropNameInConfig(props) {
    return props.map(conf => {
        return conf.name;
    })
}

/**
 * 在组件树中根据组件名称查找某个节点
 * @param {array} list 组件树
 * @param {string} comName 组件名称
 * @return {object|null} 组件节点
 */
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

/**
 * 在config中获取某个参数的描述对象
 * @param {string} propName 参数名
 * @param {object} config 
 * @return {object|undefined} 参数描述对象
 */
function getConfByPropName(propName, config) {
    return config.props.find(item => {
        return item.name === propName
    })
}

/**
 * 检查slot类型参数合法性、赋予 __pg_slot__ / _scope
 * 检查refer类型参数合法性
 * @param {string|number} key 
 * @param {Any} value 
 * @param {abject} node 
 * @param {Function(name){return comName}} getComName 
 * @param {Function(name){return exposeProperty }} getExposeProperty 
 * @param {boolean} throwError 
 * @return {Any} 新的value 
 */
function parseSlot(key, value, node, getComName, getExposeProperty, throwError) {
    /**
     * [
     *  0:['form1','form2'],
     *  1:['table1']
     * ]
     */
    let slots = [];
    let slotScope = [];

    const slotRegExp = /^\d+_(.*)$/;

    node.children || (node.children = [])

    //清除该变量名下子组件的所有slot标识
    node.children.forEach((com) => {
        if (com.__pg_slot__) {
            let match = com.__pg_slot__.match(slotRegExp);
            if (match && match[1] === key) {
                com.__pg_slot__ = false
                if (com.props._scope) delete com.props._scope;
            }
        }
    })

    let newValue = JSON.parse(JSON.stringify(value), function (k, v) {
        //查找type为[SLOT_TYPE]的对象
        if (k === 'type' && v === constant.SLOT_TYPE) {
            let len = this.value.length;
            //去重
            this.value = this.value.filter((e, idx) => {
                return this.value.indexOf(e) == idx;
            })

            //过滤非直接子组件、已经成为slot的子组件
            this.value = this.value.filter(name => {
                return node.children.some(subCom => {
                    return name === subCom.name && !subCom.__pg_slot__
                }) && !~[].concat(...slots).indexOf(name)
            })
            if (throwError && this.value.length !== len) {
                throw new Error(`${JSON.stringify(value,null,2)}\nslot引用的组件不合法（组件实例名必须存在/必须为直接子组件/不可重复引用同一个组件）`)
            }
            if (this.value.length) {
                slots.push(this.value);
                slotScope.push(this.scope)
            }
            //查找type为[REFER_TYPE]的对象
        } else if (k === 'type' && v === constant.REFER_TYPE) {
            if (this.value) {
                let hasError;
                if (!getComName(this.value)) {
                    hasError = true;
                    if (throwError) throw new Error(JSON.stringify(this, null, 2) + '\nrefer引用的组件必须存在')
                } else if (this.value === node.name) {
                    hasError = true;
                    if (throwError) throw new Error(JSON.stringify(this, null, 2) + '\nrefer不可引用自身')
                }

                if (this.property) {
                    let exposeProperty = getExposeProperty(this.value)
                    if (!exposeProperty || !exposeProperty.includes(this.property)) {
                        hasError = true;
                        if (throwError) throw new Error(JSON.stringify(this, null, 2) + '\n目标组件未在exposeProperty中暴露变量' + this.property)
                    }
                }
                hasError && (this.value = '')
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

/**
 * 简易遍历器
 * @param {Function(item,idx)} doSth 遍历函数
 * @param {array} list 遍历目标
 * @return {array} 遍历函数的返回值
 */
function traverse(doSth, list) {
    let ret = [];
    list.forEach((item, idx) => {
        ret.push(doSth(item, idx));
        traverse(doSth, item.children || []);
    })
    return ret;
}

/**
 * 为一个组件的所有参数打补丁（不影响原props对象）
 * @param {object} props 组件的props对象
 * @param {object} config 组件对应的config
 * @return {object} 打过补丁后的props对象
 */
function patchProps(props, config) {
    return Object.keys(props).reduce((target, key) => {
        let conf = getConfByPropName(key, config); //获取参数描述对象
        target[key] = require('../type_parser').getPatch(conf.type).call(conf, props[key]);
        return target;
    }, {})
}

/**
 * 获取组件树中的全部组件名称（重复则报错）
 * @param {array} data 组件树
 * @return {array} 所有组件名称
 */
function getAllComNameInData(data) {
    return (function (data) {
        let names = [];
        (function find(list) {
            return list.forEach(e => {
                if (names.includes(e.name)) {
                    throw new Error('名称' + e.name + ' 重复')
                }
                names.push(e.name)
                names.push(find(e.children || []));
            })
        })(data);
        return names
    })(data);
}

/**
 * 获取实时预览组件
 * @param {string} name 组件名称
 * @param {object} props 组件props
 * @return ()=>{ return Promise }
 */
function loadRealTimePreview(name, props) {
    return window.httpVueLoader(`realTimePreview.vue?com=${ encodeURIComponent(name) }&props=${ encodeURIComponent(JSON.stringify(props)) }`)
}

module.exports = {
    isPlainObject,
    isValidIdentifier,
    getAllPropNameInConfig,
    getAllComNameInData,
    getComponentByName,
    getConfByPropName,
    parseSlot,
    traverse,
    patchProps,
    loadRealTimePreview
}