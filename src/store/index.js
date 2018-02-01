import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        components: [],
        activeCOM:null,
        dialogs:[]
    },
    mutations: {
        addCOM(state,com){
            (com.name == 'Dialog' ? state.dialogs : state.components).push(com);
            this.commit('activateCOM',com)
        },
        activateCOM(state,com){
            state.activeCOM = com;
        },
        inputArg(state,arg){
            Vue.set(state.activeCOM.props,arg.name,arg.value);
        }
    }
})
export default store;