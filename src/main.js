import 'regenerator-runtime/runtime'

// TO DO move
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
import 'mapbox-gl/src/css/mapbox-gl.css';

import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'
import vuetify from './plugins/vuetify'
import Vuelidate from 'vuelidate'
import IdleVue from 'idle-vue'
import FullLayout from './layouts/full-layout'
import NoOrgLayout from './layouts/no-org-layout'
import VueDraggableResizable from 'vue-draggable-resizable'
import VueObserveVisibility from 'vue-observe-visibility'

import moment from 'vue-moment'
import store from './store/store'
import router from './router'
import Toasted from 'vue-toasted';

store.dispatch('readLogin');
Vue.use(Vuelidate)
Vue.use(moment)
Vue.use(Toasted)
Vue.use(VueObserveVisibility)

Vue.component('full-layout', FullLayout)
Vue.component('no-org-layout', NoOrgLayout)
Vue.component('vue-draggable-resizable', VueDraggableResizable)

const eventsHub = new Vue();

Vue.use(IdleVue, {
  eventEmitter: eventsHub,
  store,
  idleTime: 24*60*60*1000, // 24 Hours
  startAtIdle: false
});

Vue.config.productionTip = false

new Vue({
  vuetify,
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
