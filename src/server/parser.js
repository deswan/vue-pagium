
/**
 * browser/node 共用模块
 * template.data/data.json -> $store.state.components/$store.state.dialogs
 * TODO:检查合法性
 */
const chalk = require('chalk');
const scheme2Default = require('../utils/scheme2Default');
const constant = require('../const');

let uuid = 1;

function getComponentByName(comName) {
    return true;
}

//TODO:collectAllNAme

function traverse(list, allComsConfig) {
    let result = []
    list.forEach(item => {
        let children = item.children ? traverse(item.children, allComsConfig) : [];
        if (!allComsConfig[item.type]) {
            throw new Error(`Component ${chalk.red(item.type)} do not exist`);
        }

        let config = allComsConfig[item.type];

        for (let key in item.props) {

            let slots = [];

            let value = item.props[key];
            item.props[key] = JSON.parse(JSON.stringify(value), function (k, v) {
                if (this.type === constant.SLOT_TYPE) {
                    //去重
                    this.value = this.value.filter((e, idx) => {
                        return this.value.indexOf(e) == idx;
                    })
                    //过滤非直接子组件、已经成为slot的子组件
                    this.value = this.value.filter(name => {
                        return children.some(subCom => {
                            return name === subCom.name && !subCom.__pg_slot__
                        }) && !~[].concat(...slots).indexOf(name)
                    })
                    slots.push(this.value);
                } else if (this.type === constant.REFER_TYPE) {
                    //过滤不存在的组件以及自身组件
                    if (!getComponentByName(this.value) || this.value === item.name) {
                        this.value = '';
                    }
                }
                return v;
            })

            //为子组件添加slot标识
            slots.forEach((slotsName, slotIdx) => {
                children.forEach(subCom => {
                    if (slotsName.includes(subCom.name)) {
                        subCom.__pg_slot__ = key + (slotIdx + 1);
                        subCom.props.__pg_slot__ = key + (slotIdx + 1);
                    }
                })
            })
        }

        result.push({
            pg: uuid++,
            name: item.name,
            type: item.type,
            isDialog: config.isDialog,
            props: { 
                ...scheme2Default(config.props),
                ...item.props,
                name: item.name
            },
            children,
            __pg_slot__: false
        })
    })
    return result;
}

module.exports = traverse