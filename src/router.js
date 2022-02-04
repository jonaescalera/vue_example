import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store/store';

const deliveryData = () => import("./assets/data/deliveryData");
const LoginPage = () => import('./pages/login.vue');
const ForgotPasswordPage = () => import('./pages/forgot.vue');
const ResetPasswordPage = () => import('./pages/reset.vue');
const VerifyPage = () => import('./pages/verify.vue');
const AssetsPage = () => import('./pages/assets.vue');
const DeliveryPage = () => import('./pages/delivery.vue');
const IndoorAssetsPage = () => import('./pages/indoor-assets.vue');
const SettingsPage = () => import('./pages/configuration/settings.vue');
const SitesPage = () => import('./pages/configuration/sites.vue');
const ThemingPage = () => import('./pages/configuration/theming.vue');
const DevicesPage = () => import('./pages/configuration/devices.vue');
const UsersPage = () => import('./pages/configuration/users.vue');
const WorkflowPage = () => import('./pages/configuration/workflows.vue');
const ReportsPage = () => import('./pages/configuration/reports.vue');
const HealthPage = () => import('./pages/configuration/health.vue');
const SearchPage = () => import('./pages/configuration/search.vue');
const OrganizationSelect = () => import('./pages/organization-select.vue');
const AppsCards = () => import('./pages/apps-cards.vue');
const EulaPage = () => import('./pages/eula.vue');
const DashboardPage = () => import('./pages/dashboard.vue');
const KibanaPage = () => import('./pages/kibana.vue');
const TableauPage = () => import('./pages/tableau.vue');
const HelpPage = () => import('./pages/help.vue');
const InstallPage = () => import('./pages/install.vue');
const SLAPage = () => import('./pages/configuration/sla.vue');
const AddFloorplan = () => import('./pages/add-floorplan.vue');
const SubscriptionsPage = () => import('./pages/configuration/subscriptions.vue');

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: LoginPage,
  },
  {
    path: '/forgot',
    component: ForgotPasswordPage,
  },
  {
    path: '/resetpassword',
    component: ResetPasswordPage,
  },
  {
    path: '/verify',
    component: VerifyPage,
  },
  {
    path: '/eula',
    meta: { title: 'sidebar-eula' },
    component: EulaPage,
  },
  {
    path: '/org-select',
    meta: { layout: 'no-org-layout', title: 'sidebar-org-select', menuItems: 'noOrgSidebarMenu' },
    component: OrganizationSelect,
  },
  {
    path: '/apps',
    meta: { layout: 'no-org-layout', title: 'sidebar-apps-cards', menuItems: 'appsSidebarMenu' },
    component: AppsCards,
  },
  {
    path: '/search',
    meta: { layout: 'no-org-layout', title: 'sidebar-settings-search', menuItems: 'noOrgSidebarMenu' },
    component: SearchPage,
  },
  {
    path: '/assets',
    meta: {
      layout: 'full-layout',
      title: 'sidebar-assets',
      headerSites: true,
      headerAreas: true,
      headerToggle: true,
    },
    component: AssetsPage,
  },
  /*** Delivery routes ***/
  {
    path: '/delivery',
    meta: {
      layout: 'full-layout',
      title: 'sidebar-delivery',
      menuItems: 'deliverySidebarMenu',
      headerSites: true
    },
    component: DeliveryPage
  },
  {
    path: '/delivery-users',
    meta: {
      layout: 'full-layout',
      title: 'sidebar-settings-basic-users',
      menuItems: 'deliverySidebarMenu',
      headerSites: true
    },
    component: UsersPage
  },
  {
    path: '/delivery-theming',
    meta: {
      layout: 'full-layout',
      title: 'sidebar-settings-theming',
      menuItems: 'deliverySidebarMenu',
      headerSites: true
    },
    component: ThemingPage
  },
  /*** END Delivery routes ***/
  {
    path: '/indoor-assets',
    meta: {
      layout: 'full-layout',
      title: 'sidebar-assets-indoor',
      headerSites: true,
      headerAreas: true,
      headerToggle: true,
    },
    component: IndoorAssetsPage,
  },
  {
    path: '/configuration/subscriptions',
    meta: {
      layout: 'full-layout',
      title: 'subscriptions',
      headerSites: false,
      headerAreas: true,
      headerToggle: true,
    },
    component: SubscriptionsPage,
  },
  {
    path: '/configuration/sites',
    meta: { layout: 'full-layout', title: 'sidebar-settings-sites' },
    component: SitesPage,
  },
  {
    path: '/system/settings',
    meta: {
      layout: 'full-layout',
      title: 'sidebar-supertag-settings',
      headerSites: true,
    },
    component: SettingsPage,
  },
  {
    path: '/configuration/devices',
    meta: { layout: 'full-layout' },
    component: DevicesPage,
  },
  {
    path: '/configuration/theming',
    meta: { layout: 'full-layout', title: 'sidebar-settings-theming' },
    component: ThemingPage,
  },
  {
    path: '/configuration/users',
    meta: {
      layout: 'full-layout',
      title: 'sidebar-settings-basic-users',
      headerSites: true,
    },
    component: UsersPage,
  },
  {
    path: '/events/workflows',
    meta: {
      layout: 'full-layout',
      title: 'sidebar-settings-workflows',
      headerSites: true,
    },
    component: WorkflowPage,
  },
  {
    path: '/events/reports',
    meta: { layout: 'full-layout', title: 'sidebar-settings-reports', headerSites: true },
    component: ReportsPage,
  },
  {
    path: '/system/health',
    meta: { layout: 'full-layout', title: 'sidebar-settings-health', headerSites: true },
    component: HealthPage,
  },
  {
    path: '/system/search',
    meta: { layout: 'full-layout', title: 'sidebar-settings-search', headerSites: false },
    component: SearchPage,
  },
  {
    path: '/dashboard',
    meta: {
      layout: 'full-layout',
      title: 'sidebar-dashboard',
      headerSites: true,
    },
    component: DashboardPage,
  },
  {
    path: '/sla',
    meta: {
      layout: 'full-layout',
      title: 'sidebar-sla',
      headerSites: true,
    },
    component: SLAPage,
  },
  {
    path: '/kibana',
    meta: {
      layout: 'full-layout',
      headerSites: false,
    },
    component: KibanaPage,
  },
  {
    path: '/install',
    meta: { 
      layout: 'full-layout', 
      title: 'sidebar-install', 
      headerSites: true 
    },
    component: InstallPage,
  },
  {
    path: '/analytics/:view',
    name: 'tableau',
    meta: {
      layout: 'full-layout',
      noHeader: true,
      sidebarMini: 'MD_VIEWPORT'
    },
    component: TableauPage,
  },
  {
    path: '/help',
    meta: { layout: 'full-layout', title: 'sidebar-help', headerSites: false },
    component: HelpPage,
  },
  {
    path: '/add-floorplan',
    meta: {
      layout: 'full-layout',
      headerSites: false,
    },
    component: AddFloorplan,
  },
  {
    path: '/*',
    redirect: '/assets',
  },
];

const userHasAccess =  (path) => {
  // TODO here we need to check if the loggedUser has access to that path
  if(path === '/apps' || path === '/delivery' || path === '/delivery-users' || path === '/delivery-theming'){
    if(deliveryData.deliveryOrgsIds.includes(store.getters['organization/orgSelected'])){
      return true;
    }else{
      return false;
    }
  }else{
    return true;
  }
}

const router = new VueRouter({ mode: 'history', routes });
router.beforeEach((to, _, next) => {
  // todo: find a better way to do this
  // allow these 3 routes to be always accessible
  if (window && window.ga) {
    //Google Analytics
    ga('send', 'pageview', to.path);
  }
  if (
    to.path !== '/forgot' &&
    to.path !== '/resetpassword' &&
    to.path !== '/verify'
  ) {
    if (to.path !== '/') {
      //internal pages
      if (store.getters.getUserLogged && userHasAccess(to.path)) {
        next();
      } else {
        next('/');
      }
    } else {
      //login page
      if (store.getters.getUserLogged) {
        next('/assets');
      }
    }
  }
  next();
});

export default router;
