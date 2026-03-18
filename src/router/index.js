import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/'
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: import.meta.env.BASE_URL || '/',
  routes
})

router.beforeEach((to, from, next) => {
  next()    
})

export default router
