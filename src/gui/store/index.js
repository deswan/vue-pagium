import Vue from 'vue'
import Vuex from 'vuex'

import scheme2Default from "../../utils/scheme2Default.js";
import scheme2Input from "../Create/SettingBoard/scheme2Input.js";
import DefaultLive from "../default.vue";
import axios from "axios";
import {
    stat
} from 'fs';
const template2Store = require('../../lib/template2Store');
const checkTemplateValid = require('../../utils/checkTemplateValid');
const checkDataValid = require('../../utils/checkDataValid');
const utils = require('../../utils/utils');
const {
    SLOT_TYPE,
    REFER_TYPE
} = require('../../const');

Vue.use(Vuex)

const allComsConfig = {}

const allComs = {}

let r = require.context(`../../../runtime/${process.ComponentsRoot}`, true, /^\.\/(.*)\/(\1.vue|config.js)$/);
r.keys().forEach(key => {
    let match = key.match(/^\.\/(.*)\/(\1.vue|config.js)$/);
    if (match[2] === 'config.js') {
        allComsConfig[match[1]] = r(key)
    } else {
        allComs[match[1]] = r(key).default
    }
})

Object.keys(allComsConfig).forEach(key => {
    if (!allComs[key]) {
        allComs[key] = DefaultLive;
    }
})
console.log(allComs)
console.log(allComsConfig)

let uuid = 1;

function attachUUID(list) {
    utils.traverse(item => {
        item.pg = uuid++;
    }, list);
}

const store = new Vuex.Store({
    state: {
        components: [],
        activeComponent: null,
        dialogs: [],
        curHover: null,
        curTemplate: null
    },
    getters: {
        components(state) {
            return state.components;
        },
        dialogs(state) {
            return state.dialogs;
        },
        data(state) {
            return state.components.concat(state.dialogs)
        },
        activeComponentSetting(state) {
            return state.activeComponent && scheme2Input(allComsConfig[state.activeComponent.type].props)
        },
        type2Com(state) {
            return allComs
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
        componentNameList(state) {
            return (property) => {
                let names = [];
                (function traverse(list) {
                    if (!list) return;
                    list.forEach(item => {
                        if (item !== state.activeComponent &&
                            item.exposeProperty &&
                            item.exposeProperty.includes(property)) {
                            names.push(item.name)
                        }
                        traverse(item.children)
                    })
                })(state.components.concat(state.dialogs))
                return names;
            }
        },
        slotComNameList(state) {
            let names = [];
            state.activeComponent && state.activeComponent.children.forEach(item => {
                if (!item.__pg_slot__) {
                    names.push(item.name)
                }
            })
            return names;
        },
        allComsConfig() {
            return allComsConfig;
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

            if (drag.p.children[drag.i].__pg_slot__) {
                let dragName = drag.p.children[drag.i].name;
                (function traverse(list) {
                    if (!list) return;
                    for (let i = 0, len = list.length; i < len; i++) {
                        let props = list[i].props;
                        list[i].props = JSON.parse(JSON.stringify(props), function (k, v) {
                            if (this.type === SLOT_TYPE && this.value.length) {
                                this.value = this.value.filter(e => {
                                    return e !== dragName
                                })
                            }
                            return v;
                        })
                        traverse(list[i].children)
                    }
                })(this.getters.data)
                drag.p.children[drag.i].__pg_slot__ = false;
            }

            let [comObj] = drag.p.children.splice(drag.i, 1);

            drop.p.children.splice(drop.i, 0, comObj)
            axios.post('/input', state)

        },

        /**
         * 删除组件
         * @param { comObj } list 父对象
         * @param { comObj } node 要删除的子对象
         */
        delComponent(state, {
            parent,
            node
        }) {
            function del(list, node) {
                if (!list) return;
                if (~list.indexOf(node)) {
                    list.splice(list.indexOf(node), 1);
                    return true;
                } else {
                    list.some(e => {
                        return del(e.children, node)
                    })
                }
            }
            del(parent.children, node);

            //删除组件名引用、slot引用
            (function traverse(list) {
                if (!list) return;
                for (let i = 0, len = list.length; i < len; i++) {
                    let props = list[i].props;
                    list[i].props = JSON.parse(JSON.stringify(props), function (k, v) {
                        if (this.type === SLOT_TYPE) {
                            this.value = this.value.filter(e => {
                                return e !== node.name
                            })
                        } else if (this.type === REFER_TYPE) {
                            if (this.value === node.name) {
                                this.value = ''
                            }
                        }
                        return v;
                    })
                    traverse(list[i].children)
                }
            })(this.getters.data)
            axios.post('/input', state)

        },

        /**
         * 添加组件
         * @param { comObj } parent 父对象
         * @param { vm } comVm 要添加的组件实例
         */
        addComponent(state, {
            parent,
            comType: type
        }) {
            const config = allComsConfig[type];

            let name = config.name;
            if (utils.isNameExist(this.getters.data, name)) {
                let nameCounter = 1;
                while (utils.isNameExist(this.getters.data, name)) {
                    name = config.name + nameCounter++
                }
            }

            let comObj = {
                pg: uuid++,
                name,
                type,
                isDialog: config.isDialog,
                exposeProperty: config.exposeProperty,
                props: scheme2Default(config.props),
                children: [],
                __pg_slot__: false //是否成为slot
            }

            parent.children.push(comObj);

            this.commit('activateComponent', {
                comObj
            })
            axios.post('/input', state)

        },

        /**
         * 激活组件
         * @param { comObj } comObj 要激活的对象
         */
        activateComponent(state, {
            comObj
        }) {
            state.activeComponent = comObj;
            axios.post('/input', state)
        },

        /**
         * 输入setting参数
         * @param { String } name 字段名称
         * @param { Any } value 字段值
         */
        input(state, {
            me,
            name,
            value
        }) {
            if (name === '_name') {

                let oldName = state.activeComponent.name;

                if (utils.isNameExist(this.getters.data, value)) {
                    me.$message.warning(`组件名 ${value} 已存在`);
                    value = oldName;
                } else if (!utils.isValidIdentifier(value)) {
                    me.$message.warning('该组件名不是合法js标识符');
                    value = oldName;
                } else {
                    //组件名称引用联动
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
                                } else if (this.type === REFER_TYPE) {
                                    if (this.value === oldName) {
                                        this.value = value
                                    }
                                }
                                return v;
                            })
                            traverse(list[i].children)
                        }
                    })(this.getters.data)

                    state.activeComponent.name = value;
                }
            } else {
                const slotRegExp = /^\d+_(.*)$/

                //清除该变量名下子组件的所有slot标识
                state.activeComponent.children.forEach((com) => {
                    if (com.__pg_slot__) {
                        let match = com.__pg_slot__.match(slotRegExp);
                        if(match && match[1] === name){
                            com.__pg_slot__ = false
                            if(com.props._scope) delete com.props._scope;
                        }
                    }
                })

                value = utils.parseSlot(name, value, state.activeComponent, (name) => {
                    return utils.getComponentByName(this.getters.data, name)
                }, (name) => {
                    return utils.getComponentByName(this.getters.data, name).exposeProperty
                }, false)

                Vue.set(state.activeComponent.props, name, value);
            }
            axios.post('/input', state)
        },
        employTemplate(state, {
            template,
            vm
        }) {
            let comList;
            try {
                checkTemplateValid(template, allComsConfig)
                comList = template2Store(template.data, allComsConfig);
            } catch (err) {
                throw err;
                vm.$message.error('模板出错：' + err.message);
                return;
            }

            let dearthedComName = [];
            let changedComName = [];

            utils.traverse((item) => {
                if (!allComsConfig[item.type]) {
                    !dearthedComName.includes(item.type) && dearthedComName.push(item.type);
                } else if (item.configSnapShoot !== JSON.stringify(allComsConfig[item.type])) {
                    console.log(item.configSnapShoot)
                    !changedComName.includes(item.type) && changedComName.push(item.type);
                }
            }, template.data)
            if (dearthedComName.length || changedComName.length) {
                vm.$confirm(
                    dearthedComName.length ?
                    `组件 ${dearthedComName.join(',')} 缺失，将删除该组件数据\n` : '' +
                    changedComName.length ?
                    `组件 ${changedComName.join(',')} 配置已更变，可能缺失部分数据` : '',
                    '是否继续？').then(_ => {
                    apply();
                }).catch(err => {})
            } else {
                apply();
            }


            function apply() {
                state.curTemplate = template;
                state.activeComponent = null;
                state.components = comList.filter(e => {
                    return !e.isDialog
                })
                state.dialogs = comList.filter(e => {
                    return e.isDialog
                });
                attachUUID(state.components);
                attachUUID(state.dialogs);

                axios.post('/input', state)
                vm.$router.push({
                    name: 'create'
                })
            }


        },
        clearData(state) {
            state.curTemplate = null;
            state.activeComponent = null;
            state.components.splice(0)
            state.dialogs.splice(0)
            axios.post('/input', state)

        },
        hoverMenuItem(state, {
            comObj
        }) {
            if (comObj && comObj.isDialog) return;
            state.curHover = comObj || null;
        },
        assign(state, data) {
            attachUUID(data.components);
            attachUUID(data.dialogs);
            Object.assign(state, data)
        }
    },
    actions: {
        getLastestInput(state) {
            axios.get('/input').then(({
                data
            }) => {
                if (Object.keys(data.data).length) {
                    this.commit('assign', data.data)
                }
            })
        }
    }
})
export default store;