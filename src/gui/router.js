import Vue from 'vue'
import Router from 'vue-router'
import Template from './Templates/Templates.vue'
import Create from './Create/Create.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'templates',
      component: Template
    },{
      path: '/create/:template?',
      name: 'create',
      component: Create
    }
  ]
})
