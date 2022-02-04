import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import userStore from './modules/userStore';
import userTrackingStore from './modules/userTrackingStore';
import layoutStore from './modules/layoutStore';
import headerStore from './modules/headerStore';
import organizationStore from './modules/organizationStore';
import siteStore from './modules/siteStore';
import areaStore from './modules/areaStore';
import tagStore from './modules/tagStore';
import supertagStore from './modules/supertagStore';
import assetStore from './modules/assetStore';
import configurationUsersStore from './modules/configurationUsersStore';
import dashboardStore from './modules/dashboardStore';
import locationStore from './modules/locationStore';
import gatewayStore from './modules/gatewayStore';
import accessPointStore from './modules/accessPointStore';
import zoneStore from './modules/zoneStore';
import categoryStore from './modules/categoryStore';
import groupStore from './modules/groupStore';
import workflowStore from './modules/workflowStore';
import reportStore from './modules/reportStore';
import slaStore from './modules/slaStore';
import statusStore from './modules/statusStore';
import tableauStore from './modules/tableauStore';
import subscriptionsStore from './modules/subscriptionStore';

Vue.use(Vuex);
const vuexLocal = new VuexPersistence({
  key: 'my-app',
  storage: window.localStorage,
  //what parts of the state we want to keep on reload
  reducer: (state) => ({
    user: state.user,
    isIdle: state.isIdle,
    ga: state.ga,
    configurationUser: state.configurationUser,
    organization: state.organization,
    layout: state.layout
  }),
});
export default new Vuex.Store({
  modules: {
    area: areaStore,
    asset: assetStore,
    location: locationStore,
    gateway: gatewayStore,
    accessPoint: accessPointStore,
    zone: zoneStore,
    category: categoryStore,
    configurationUser: configurationUsersStore,
    dashboard: dashboardStore,
    group: groupStore,
    header: headerStore,
    layout: layoutStore,
    organization: organizationStore,
    workflow: workflowStore,
    site: siteStore,
    tag: tagStore,
    user: userStore,
    ga: userTrackingStore,
    supertag: supertagStore,
    subscriptions: subscriptionsStore,
    report: reportStore,
    sla: slaStore,
    status: statusStore,
    tableau: tableauStore
  },
  plugins: [vuexLocal.plugin],
});
