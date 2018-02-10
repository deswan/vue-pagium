import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        components: [],
        activedComponent:null,
        dialogs:[]
    },
    mutations: {
        addComponent(state,comObj){
            (comObj.type == 'Dialog' ? state.dialogs : state.components).push(comObj);
            this.commit('activateComponent',comObj)
        },
        activateComponent(state,comObj){
            state.activedComponent = comObj;
            console.log('active:',comObj)
        },
        inputArg(state,arg){
            Vue.set(state.activedComponent.props,arg.name,arg.value);
        }
    }
})
export default store;