const sidebarMenu = [
  // Hiding Dashboard link https://link-labs.atlassian.net/browse/NEX-1858
  // {
  //   title: 'sidebar-dashboard',
  //   toLink: '/dashboard',
  //   icon: 'mdi-home-outline',
  // },
  {
    title: 'sidebar-assets',
    active: false,
    toLink: '/assets',
    visible: false,
    hideForAf3: false,
    icon: 'mdi-cube-outline',
  },
  {
    title: 'sidebar-analytics',
    active: false,
    visible: false,
    icon: 'mdi-poll',
    loadSubMenu: 'tableau/getWorkbooks',
    emptySubmenuInfo: 'sidebar-analytics-empty',
    condition:[
      {
        getter: 'currentOrganization',
        property: 'isOrgCustomReportsEnable',
        value: true
      },
      {
        getter: 'currentSite',
        property: 'isCustomReportsEnable',
        value: true
      }
    ],
    subMenuItems: [{}]
  },
  {
    title: 'events',
    active: false,
    icon: 'mdi-file-document-outline',
    visible: false,
    condition: true,
    subMenuItems: [
      {
        name: 'sidebar-settings-workflows',
        toLink: '/events/workflows',
        visible: false,
        condition:[
          {
            getter: 'currentOrganization',
            property: 'isOrgCustomReportsEnable',
            value: true
          },
          {
            getter: 'currentSite',
            property: 'isWorkflowEnable',
            value: true
          }
        ]
      },
      {
        name: 'sidebar-settings-reports',
        toLink: '/events/reports',
        visible: false,
        condition:[
          {
            getter: 'currentOrganization',
            property: 'isOrgCustomReportsEnable',
            value: true
          },
          {
            getter: 'currentSite',
            property: 'isReportsEnable',
            value: true
          }
        ]
      }
    ]
  },
  {
    title: 'system',
    active: false,
    icon: 'mdi-application-cog',
    hideForAf3: false,
    visible: false,
    subMenuItems: [
      {
        name: 'sidebar-settings-health',
        toLink: '/system/health',
        hideForAf3: false,
        id: 8,
      },
      {
        name: 'sidebar-supertag-settings',
        toLink: '/system/settings',
        hideForAf3: true,
        id: 3
      },
      {
        name: 'sidebar-settings-search',
        toLink: '/system/search',
        hideForAf3: false,
        id: 9
      },
    ]
  },
  {
    title: 'sidebar-opt7',
    active: false,
    icon: 'mdi-settings-outline',
    visible: false,
    hideForAf3: false,
    subMenuItems: [
      {
        name: 'sidebar-settings-sites',
        hideForAf3: false,
        id: 1,
        toLink:'/configuration/sites'
      },
      {
        name: 'sidebar-settings-basic-users',
        hideForAf3: false,
        id: 2,
        toLink: '/configuration/users',
      },
      
      {
        name: 'sidebar-settings-theming',
        hideForAf3: false,
        toLink: '/configuration/theming',
        id: 5,
      },
      {
        name: 'subscriptions',
        hideForAf3: false,
        toLink: '/configuration/subscriptions',
        condition:[
          {
            getter: 'orgRoles',
            property: 'superAdmin',
            value: true
          }
        ],
        id: 6,
      },
      
    ],
  },
  {
    title:'sidebar-org-select', 
    hideForAf3: false,
    toLink:'/org-select',
    active: false,
    visible: false,
    icon:'mdi-office-building'
  },
  // {
  //   title:'sidebar-sla', 
  //   toLink:'/sla',
  //   active: false,
  //   visible: false,
  //   icon:'mdi-office-building'
  // },
  {
    title:'sidebar-install',
    hideForAf3: false,
    toLink:'/install',
    active: false,
    visible: false,
    icon:'mdi-wrench-outline'
  },
  // {
  //   title:'sidebar-monitoring',
  //   active: false,
  //   subMenuItems: [
  //     {
  //       name: 'sidebar-monitoring-high',
  //       id: 1,
  //       amount: 18,
  //       classWarn: 'high',
  //       toLink:'/monitoring'
  //     },
  //     {
  //       name: 'sidebar-monitoring-low',
  //       id: 2,
  //       amount: 5,
  //       classWarn: 'mid',
  //       toLink: '/monitoring',
  //     },     
  //   ],
  //   visible: false,
  //   icon:'mdi-magnify-remove-outline'
  // },
  {
    title:'sidebar-help',
    hideForAf3: false,
    toLink:'/help',
    active: false,
    visible: false,
    icon:'mdi-help-circle'
  },
];

const noOrgSidebarMenu = [
  {
    title: 'sidebar-org-select',
    toLink: '/org-select',
    hideForAf3: false,
    active: false,
    visible: false,
    icon: 'mdi-office-building'
  },
  {
    title: 'sidebar-settings-search',
    toLink: '/search',
    hideForAf3: false,
    active: false,
    visible: false,
    icon: 'mdi-card-search'
  }
];

const deliverySidebarMenu = [
  {
    title: 'sidebar-apps',
    active: false,
    toLink: '/apps',
    visible: false,
    hideForAf3: false,
    icon: 'mdi-view-grid',
  },
  {
    title: 'sidebar-delivery',
    active: false,
    toLink: '/delivery',
    visible: false,
    hideForAf3: false,
    icon: 'mdi-truck-delivery',
  },
  {
    title: 'sidebar-settings-basic-users',
    active: false,
    toLink: '/delivery-users',
    visible: false,
    hideForAf3: false,
    icon: 'mdi-account-multiple'
  },
  {
    title: 'sidebar-settings-theming',
    active: false,
    toLink: '/delivery-theming',
    visible: false,
    hideForAf3: false,
    icon: 'mdi-palette'
  }
];

const appsSidebarMenu = [
  {
    title: 'sidebar-org-select',
    toLink: '/org-select',
    hideForAf3: false,
    active: false,
    visible: false,
    icon: 'mdi-office-building'
  }
];
export default {
  sidebarMenu,
  deliverySidebarMenu,
  noOrgSidebarMenu,
  appsSidebarMenu
};
