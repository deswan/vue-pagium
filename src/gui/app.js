import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import store from './store'
import axios from "axios";
import router from "./router";
Vue.use(ElementUI)
Vue.prototype.$http = axios;
Vue.config.devtools = true;

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
