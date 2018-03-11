import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import store from './store'
import VueDragTree from 'vue-drag-tree'
import './assets/el-font-awesome.css'

Vue.component('vue-drag-tree', VueDragTree)
Vue.use(ElementUI)

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
