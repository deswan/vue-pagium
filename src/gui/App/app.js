import "@babel/polyfill"
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import store from './store'
import axios from "axios";
import router from "./router";
import httpVueLoader from '../assets/httpVueLoader'
window.Vue = Vue;
window.httpVueLoader = httpVueLoader;

Vue.use(ElementUI)
Vue.prototype.$http = axios;

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
