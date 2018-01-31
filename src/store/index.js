import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        components: []
    },
    mutations: {
        addCOM(state,com){
            state.components.push(com)
        }
    }
})
export default store;