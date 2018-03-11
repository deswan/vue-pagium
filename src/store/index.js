import Vue from 'vue'
import Vuex from 'vuex'
import TableConfig from "../Components/Table/config";
import DialogConfig from "../Components/Dialog/config";

import scheme2Default from "../utils/scheme2Default.js";

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
    Dialog: DialogConfig
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
            comVm
        }) {
            const type = comVm.name; //vm.options.name
            const config = allComsConfig[type];
            const name = getName(type);
            let comObj = {
                pg: uuid++,
                name,
                type,
                nestable: config.nestable,
                isDialog: config.isDialog,
                props: { ...scheme2Default(config.props),
                    name
                },
                com: comVm,
                subCom: []
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
            Vue.set(state.activeComponent.props, name, value);
        }
    }
})
export default store;