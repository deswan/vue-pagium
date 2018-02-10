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
            Vue.set(state.activeComponent.props,payLoad.name,payLoad.value);
        }
    }
})
export default store;