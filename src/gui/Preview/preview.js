import "@babel/polyfill"
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './preview.scss'
import App from './App.vue'
import axios from 'axios';
import httpVueLoader from '../assets/httpVueLoader'
window.Vue = Vue;
window.httpVueLoader = httpVueLoader;

Vue.use(ElementUI)
Vue.prototype.$http = axios;

new Vue({
  el: '#app',
  render: h => h(App)
})
