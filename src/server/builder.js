const chalk = require('chalk');
const scheme2Default = require('../utils/scheme2Default');
const constant = require('../const');

let uuid = 1;

function getComponent(comName) {
    return true;
}

function traverse(list) {
    let result = []
    list.forEach(item => {
        let children = item.subCom ? traverse(item.subCom) : [];

        for (let key in item.props) {

            let slots = [];

            let value = item.props[key];
            item.props[key] = JSON.parse(JSON.stringify(value), function (k, v) {
                if (this.type === constant.SLOT_TYPE) {
                    //去重
                    this.value = this.value.filter((e, idx) => {
                        return this.value.indexOf(e) == idx;
                    })
                    //过滤非直接子组件以及已经成为slot的子组件
                    this.value = this.value.filter(e => {
                        return children.some(subCom => {
                            return e === subCom.name && !subCom.__pg_slot__
                        }) && slots.every(slot => {
                            return slot.every(slot => {
                                return e !== slot;
                            })
                        })
                    })

                    slots.push(this.value);
                } else if (this.type === constant.REFER_TYPE) {
                    //过滤不存在的组件以及自身组件
                    if (!getComponent(this.value) || this.value === item.name) {
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

        let propBlacklist = ['name', '__pg_slot__']
        let props = Object.keys(item.props).reduce((target, name) => {
            if (!~propBlacklist.indexOf(name)) {
                target[name] = item.props[name]
            }
            return target;
        }, {})

        result.push({
            type: item.type,
            name: item.name,
            props: props,
            chilren: children,
        })
    })
    return result;
}

module.exports = ({
    data,
    name,
    remark
}) => {
    let d = new Date();
    let date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " +
        d.getHours() + ":" + d.getMinutes() + ':' + d.getSeconds();
    return {
        name,
        date,
        remark,
        data:traverse(data),
    }
}