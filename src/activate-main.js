import 'regenerator-runtime/runtime'

import Vue from 'vue'
import App from './activate-App.vue'
import i18n from './i18n'
import vuetify from './plugins/vuetify'
import Vuelidate from 'vuelidate'

import router from './activate-router'

Vue.use(Vuelidate)

Vue.config.productionTip = false

new Vue({
  vuetify,
  i18n,
  router,
  render: h => h(App)
}).$mount('#app')