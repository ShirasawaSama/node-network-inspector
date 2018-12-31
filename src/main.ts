import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'firacode/distr/fira_code.css'
import 'highlightjs-material-dark-theme/css/materialdark.css'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'

const plugins = require.context('./plugins', false, /\.ts$/)
plugins.keys().forEach(plugins)

window.APP_VERSION = require('../package.json').version
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
