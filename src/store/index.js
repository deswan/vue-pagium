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
        },

        /**
         * 添加组件
         * @param { comObj } node 父对象
         * @param { vm } comVm 要添加的组件实例
         */
        addComponent(state, {
            node,
            comType:type
        }) {
            const config = allComsConfig[type];
            const comVm = allComs[type];
            let name = getName(config.name);

            //init slot属性
            let slotsKey = [];
            JSON.parse(JSON.stringify(config.props), function (k, v) {
                if (k === 'value' && v === 'new-component') {
                    slotsKey.push(this.name);
                }
                return v;
            })

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
                slotsKey,
                __pg_slot__: false
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
            if (name === 'name') {
                state.activeComponent.name = value;
            }

            /**
             * @return [
             *  0:['form1','form2'],
             *  1:['table1']
             * ]
             */
            function getSlots() {
                let slot = [];
                let slotsKey = state.activeComponent.slotsKey;
                if (slotsKey.includes(name)) {
                    slot.push(value.split(','));
                } else {
                    JSON.parse(JSON.stringify(value), function (k, v) {
                        if (slotsKey.includes(k)) {
                            slot.push(v.split(','));
                        }
                        return v;
                    })
                }
                return slot;
            }

            let slots = getSlots()
            state.activeComponent.subCom.forEach((com) => {
                if (com.__pg_slot__ && com.__pg_slot__.startsWith(name)) {
                    com.__pg_slot__ = false;
                }
            })
            slots.forEach((slotsName, slotIdx) => {
                state.activeComponent.subCom.forEach(subCom => {
                    if (slotsName.includes(subCom.name)) {
                        subCom.__pg_slot__ = name + (slotIdx + 1);
                        subCom.props.__pg_slot__ = name + (slotIdx + 1);
                    }
                })
            })

            Vue.set(state.activeComponent.props, name, value);
        }
    }
})
export default store;