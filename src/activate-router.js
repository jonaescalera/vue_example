import Vue from 'vue';
import VueRouter from 'vue-router';

import ActivateHome from './pages/activate-home.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: ActivateHome,
  },
];

const router = new VueRouter({ mode: 'history', routes });
router.beforeEach((to, _, next) => {
  if (window && window.ga) {
    //Google Analytics
    ga('send', 'pageview', to.path);
  }
  next();
});

export default router;
