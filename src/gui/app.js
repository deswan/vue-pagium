import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import store from './store'
import VueDragTree from 'vue-drag-tree'
import axios from "axios";
import './assets/el-font-awesome.css'
import router from "./router";

Vue.component('vue-drag-tree', VueDragTree)
Vue.use(ElementUI)
Vue.prototype.$http = axios;

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
