import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        components: [],
        activeComponent:null,
        dialogs:[]
    },
    mutations: {
        addComponent(state,comObj){
            (comObj.type == 'Dialog' ? state.dialogs : state.components).push(comObj);
            this.commit('activateComponent',comObj)
        },
        activateComponent(state,comObj){
            state.activeComponent = comObj;
            console.log('active:',comObj)
        },
        input(state,payLoad){
            if(payLoad.name === 'name'){
                state.activeComponent.name = payLoad.value;
            }
            Vue.set(state.activeComponent.props,payLoad.name,payLoad.value);
        },
        sort(state,{comObj,relateComObj,relateDirection}){
            let list = ~state.components.indexOf(comObj) ? state.components : state.dialogs;
            let listRelate = ~state.components.indexOf(relateComObj) ? state.components : state.dialogs;
            list.splice(list.indexOf(comObj),1);
            let idxRelate = listRelate.indexOf(relateComObj)
            listRelate.splice(relateDirection == 'before' ? idxRelate : idxRelate + 1,0,comObj)
        }
    }
})
export default store;