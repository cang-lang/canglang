import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入element
import './plugins/element.js'
// 导入全局样式
import './assets/css/base.less'
// 导入icon图标
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 设置基本url
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置请求拦截器。
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 挂在到vue原型上，使全局实例通过this可以使用axios

Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
