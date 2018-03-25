import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './preview.scss'
import App from './dist/Table.vue'
import axios from 'axios';

Vue.use(ElementUI)
Vue.prototype.$http = axios;

new Vue({
  el: '#app',
  render: h => h(App)
})
