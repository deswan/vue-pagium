import Vue from 'vue'
import Vuex from 'vuex'
import TableConfig from "../Components/Table/config";
import DialogConfig from "../Components/Dialog/config";
import FormConfig from "../Components/Form/config";
import ButtonConfig from "../Components/Button/config";
import InputConfig from "../Components/Input/config";
import TagConfig from "../Components/Tag/config";

import Table from "../Components/Table/Table.vue";
import Dialog from "../Components/Dialog/Dialog.vue";
import Form from "../Components/Form/Form.vue";
import Button from "../Components/Button/Button.vue";
import Input from "../Components/Input/Input.vue";
import Tag from "../Components/Tag/Tag.vue";

import scheme2Default from "../utils/scheme2Default.js";
import scheme2Input from "../SettingBoard/scheme2Input.js";

const SLOT_TYPE = '__pg_type_slot_component__'
const REFER_TYPE = '__pg_type_refer_component__'

Vue.use(Vuex)

const getName = (() => {
    const counter = {}
    return (name) => {
        if (counter[name]) {
            return name + counter[name]++
        } else {
            counter[name] = 1
            return name
        }
    }
})()

const allComsConfig = {
    Table: TableConfig,
    Dialog: DialogConfig,
    Form: FormConfig,
    Button: ButtonConfig,
    Input: InputConfig,
    Tag: TagConfig
};

const allComs = {
    Table,
    Dialog,
    Form,
    Button,
    Input,
    Tag
};

let uuid = 1;

const store = new Vuex.Store({
    state: {
        components: [],
        activeComponent: null,
        dialogs: [],
    },
    getters: {
        components(state) {
            return state.components;
        },
        dialogs(state) {
            return state.dialogs;
        },
        data(state) {
            return {
                components: state.components,
                dialogs: state.dialogs
            }
        },
        activeComponentSetting(state) {
            return state.activeComponent && scheme2Input(allComsConfig[state.activeComponent.type].props)
        },
        /**
         * 获取所有component（非对话框）的
         */
        allComsType() {
            let target = [];
            for (let key in allComsConfig) {
                if (!allComsConfig[key].isDialog) {
                    target.push(key);
                }
            }
            return target;
        },
        allDialogsType() {
            let target = [];
            for (let key in allComsConfig) {
                if (allComsConfig[key].isDialog) {
                    target.push(key);
                }
            }
            return target;
        },
        /**
         * 获取所有组件可引用属性的map
         * @return {
         *     comName1:['varName1','varName2'],
         *      .
         *      .
         *      .
         * }
         */
        allExposeMap(state) {
            let list = state.components.concat(state.dialogs);
            let map = {}

            function traverse(list) {
                list.forEach(item => {
                    let config = allComsConfig[item.type];
                    if (config.expose && config.expose.length) {
                        map[item.name] = config.expose;
                    }
                    traverse(item.children)
                })
            }
            return map;
        },
        /**
         * @return {Array}  所有已创建组件（包括子组件）
         */
        componentNameList(state) {
            let names = [];
            (function traverse(list) {
                if(!list) return;
                list.forEach(item => {
                    if(item !== state.activeComponent){
                        names.push(item.name)
                    }
                    traverse(item.children)
                })
            })(state.components.concat(state.dialogs))
            return names;
        }
    },
    mutations: {
        /**
         * 
         * @param { {p,i} } drag 被拖拽对象
         * @param { {p,i} } drop 目标对象
         */
        nodeChange(state, {
            drag,
            drop
        }) {
            let holder = {}
            let [comObj] = drag.p.subCom.splice(drag.i, 1, holder);

            drop.p.subCom.splice(drop.i, 0, comObj)
            drag.p.subCom.splice(drag.p.subCom.indexOf(holder), 1);
        },

        /**
         * 删除组件
         * @param { comObj } list 父对象
         * @param { comObj } node 要删除的子对象
         */
        delComponent(state, {
            list,
            node
        }) {
            function del(list, node) {
                if (!list) return;
                if (~list.indexOf(node)) {
                    list.splice(list.indexOf(node), 1);
                    return true;
                } else {
                    list.some(e => {
                        return del(e.subCom, node)
                    })
                }
            }
            del(list.subCom, node)

            //删除组件名引用
            (function traverse(list) {
                if (!list) return;
                for (let i = 0, len = list.length; i < len; i++) {
                    let props = list[i].props;
                    list[i].props = JSON.parse(JSON.stringify(props), function (k, v) {
                        if (this.type === SLOT_TYPE) {
                            this.value = this.value.map(e => {
                                return e !== node.name
                            })
                        }else if(this.type === REFER_TYPE){
                            if(this.value === node.name){
                                this.value = ''
                            }
                        }
                        return v;
                    })
                    traverse(list[i].subCom)
                }
            })(state.components.concat(state.dialogs))

            
        },

        /**
         * 添加组件
         * @param { comObj } node 父对象
         * @param { vm } comVm 要添加的组件实例
         */
        addComponent(state, {
            node,
            comType: type
        }) {
            const config = allComsConfig[type];
            const comVm = allComs[type];
            let name = getName(config.name);

            let comObj = {
                pg: uuid++,
                name,
                type,
                isDialog: config.isDialog,
                props: { ...scheme2Default(config.props),
                    name
                },
                com: comVm,
                subCom: [],
                __pg_slot__: false //是否成为slot
            }

            node.subCom.push(comObj);

            this.commit('activateComponent', {
                comObj
            })
        },

        /**
         * 激活组件
         * @param { comObj } comObj 要激活的对象
         */
        activateComponent(state, {
            comObj
        }) {
            state.activeComponent = comObj;
        },

        /**
         * 输入setting参数
         * @param { String } name 字段名称
         * @param { Any } value 字段值
         */
        input(state, {
            name,
            value
        }) {

            function getComponent(comName, list = state.components.concat(state.dialogs)) {
                let ret = null;

                function find(list) {
                    if (!list) return;
                    for (let i = 0, len = list.length; i < len; i++) {
                        if (list[i].name === comName) {
                            return ret = list[i];
                        } else {
                            find(list[i].subCom)
                        }
                    }
                }
                find(list)
                return ret;
            }
            /**
             * @return [
             *  0:['form1','form2'],
             *  1:['table1']
             * ]
             */
            let slots = [];     //TODO:JSON.parse遍历参数循环两次的问题

            value = JSON.parse(JSON.stringify(value), function (k, v) {
                if (this.type === SLOT_TYPE) {
                    //去重
                    this.value = this.value.filter((e, idx) => {
                        return this.value.indexOf(e) == idx;
                    })
                    //过滤非直接子组件以及已经成为slot的子组件
                    this.value = this.value.filter(e => {
                        return state.activeComponent.subCom.some(subCom => {
                            return e === subCom.name
                        }) && slots.every(slot => {
                            return slot.every(slot => {
                                return e !== slot;
                            })
                        })
                    })

                    slots.push(this.value);
                } else if (this.type === REFER_TYPE) {
                    //过滤不存在的组件以及自身组件
                    if(!getComponent(this.value) || this.value === state.activeComponent.name){
                        this.value = '';
                    }
                }
                return v;
            })

            console.log(slots)

            //清除该变量名下子组件的所有slot标识
            state.activeComponent.subCom.forEach((com) => {
                if (com.__pg_slot__ && com.__pg_slot__.startsWith(name)) {
                    com.__pg_slot__ = false;
                }
            })


            //为子组件添加slot标识
            slots.forEach((slotsName, slotIdx) => {
                state.activeComponent.subCom.forEach(subCom => {
                    if (slotsName.includes(subCom.name)) {
                        subCom.__pg_slot__ = name + (slotIdx + 1);
                        subCom.props.__pg_slot__ = name + (slotIdx + 1);
                    }
                })
            })

            if (name === 'name') {

                //组件名称引用联动
                let oldName = state.activeComponent.name;
                (function traverse(list) {
                    if (!list) return;
                    for (let i = 0, len = list.length; i < len; i++) {
                        let props = list[i].props;
                        list[i].props = JSON.parse(JSON.stringify(props), function (k, v) {
                            if (this.type === SLOT_TYPE) {
                                this.value = this.value.map(e => {
                                    if (e === oldName) {
                                        return value
                                    } else {
                                        return e;
                                    }
                                })
                            }else if(this.type === REFER_TYPE){
                                if(this.value === oldName){
                                    this.value  = value
                                }
                            }
                            return v;
                        })
                        traverse(list[i].subCom)
                    }
                })(state.components.concat(state.dialogs))

                state.activeComponent.name = value;

            }

            Vue.set(state.activeComponent.props, name, value);
        }
    }
})
export default store;