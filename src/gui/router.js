import Router from 'vue-router'
import Template from './Templates/Templates.vue'
import Create from './Create/Create.vue'
import Doc from './Doc/Doc.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'templates',
      component: Template
    },{
      path: '/create/:templateId?',
      name: 'create',
      component: Create
    },{
      path: '/doc',
      name: 'doc',
      component: Doc
    }
  ]
})
