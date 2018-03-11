import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const getName = (()=>{
    const counter = {}
    return (name)=>{
        if(counter[name]){
            return name + counter[name]++
        }else{
            counter[name] = 1
            return name
        }
    }
})()


const store = new Vuex.Store({
    state: {
        components: [],
        activeComponent: null,
        dialogs: [],
        uuid:1
    },
    getters:{
        components(state){
            return state.components;
        },
        dialogs(state){
            return state.dialogs;
        }
    },
    mutations: {
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
         * 
         * @param {父对象} list 
         * @param {要删除的子对象} node 
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
         * 
         * @param {父对象} node 
         * @param {要添加的子对象} comObj 
         */
        addComponent(state, {
            node,
            comObj
        }) {
            const name = getName(comObj.type);
            Vue.set(comObj,'name',name);
            comObj.pg = 'pg' + state.uuid++;
            // Vue.set(comObj.props,'name',name);
            node.subCom.push(comObj);

            this.commit('activateComponent', {comObj})
        },
        activateComponent(state, {
            comObj
        }) {
            Vue.set(state,'activeComponent',Object.assign({},comObj))
            // state.activeComponent = comObj;   //直接赋comObj会从原位置中删除？？？？？
        },
        input(state, payLoad) {
            //组件名称
            if (payLoad.name === 'name') {
                state.activeComponent.name = payLoad.value;
            }
            Vue.set(state.activeComponent.props, payLoad.name, payLoad.value);
        }
    }
})
export default store;