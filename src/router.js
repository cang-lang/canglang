import Vue from 'vue'
import Router from 'vue-router'
import Login from './views/login'
import Home from './views/home'
import Welcome from './views/home/welcome'
import Users from './views/home/users'
import Right from './views/home/power/rights'
import Roles from './views/home/power/roles'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home',

      component: Home,
      redirect: '/welcome',
      children: [{
        path: '/welcome', component: Welcome
      }, {
        path: '/users', component: Users
      }, { path: '/rights', component: Right }, { path: '/roles', component: Roles }] }
  ]
})
// 路由前置守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
