<template>
    <v-navigation-drawer id="sidebar"
      app
      :mini-variant="mini"
      width="200"
      v-if="windowWidth > sm"
      permanent
    >
      <v-list class="pb-0 noTransitions">
        <!-- logos, large and small -->
        <v-list-item class="logo-item mb-2">
          <v-list-item-content class="d-flex justify-center">
            <v-img v-if="!mini" :src="getLogo(false) || this.logo" max-width="133" aspect-ratio="3"></v-img>
            <v-img v-if="mini" :src="getLogo(true) || this.logoCollapsed" ></v-img>
          </v-list-item-content>
        </v-list-item>
        <!-- User avatar -->
        <v-divider></v-divider>
        <v-list-item-group class="py-1">
          <v-list-item class="item-avatar">
            <!--v-list-item-avatar v-bind:class="{ 'mr-2': !mini }">
              <v-img v-bind:class="{'mini-avatar': mini}" src="../../../src/assets/img/user-circle.png" height="37" width="37"></v-img>
              <v-icon @click="mini = !mini" v-if="mini" class="mini-header-icon-arrow" v-text="'mdi-chevron-right'"></v-icon>
            </v-list-item-avatar-->
            <v-list-item-content v-if="!mini">
              <v-tooltip top content-class="tooltip" nudge-left :open-on-click="true" :open-on-hover="false">
                <template v-slot:activator="{ on }">
                  <v-list-item-title v-on="on" class="avatar-title">{{ $store.getters.getUsername }}</v-list-item-title>
                </template>
                <v-list-item-title class="avatar-title">{{ $store.getters.getUsername }}</v-list-item-title>
              </v-tooltip>
              <v-list-item-subtitle v-if="orgSelectedName" class="avatar-subtitle mt-1" @click="orgSelected && openAddEditModal(orgSelected)">{{ orgSelectedName }}</v-list-item-subtitle>
              <v-list-item-subtitle class="avatar-subtitle mt-1" @click="orgSelected && openAddEditModal(orgSelected)">{{ getUserRole }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-icon class="header-icon-arrow">
              <v-icon id="chevron-right" @click="mini = !mini" v-if="mini" v-text="'mdi-chevron-right'"></v-icon>
              <v-icon id="chevron-left" @click="mini = !mini" v-if="!mini" v-text="'mdi-chevron-left'"></v-icon>
            </v-list-item-icon>
          </v-list-item>
        </v-list-item-group>              
      </v-list>

      <v-divider></v-divider>

      <!-- Navigation Links -->
      <v-list nav>
          <sidebar-link  
          v-for="itemLink in items" 
          :key="itemLink.title" 
          :mini="mini" 
          :items="items" 
          :item="itemLink"
          v-show="(itemLink.title !== 'sidebar-org-select' || checkShowOrg()) 
          && itemLink.visible && currentSite && (Object.keys(currentSite).length > 0 || $route.meta.menuItems || sites.length === 0)
          && ((!currentSite.isAf3) || (currentSite.isAf3 && !itemLink.hideForAf3))"
          />
      </v-list>

      <!-- logout sidebar footer -->
      <template v-slot:append>
        <div class="pa-2">
          <v-btn block @click="confirmationDialog = true" class="logout-item" color="primary" >
            <span v-if="!mini">{{$t('sidebar-logout')}}</span>
            <v-icon right v-bind:class="{'logout-mini-icon': mini}">mdi-logout</v-icon>
          </v-btn>
        </div>
      </template>       
      <v-dialog v-model="confirmationDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">{{$t('sidebar-logout')}}</v-card-title>
        <v-card-text class="mt-3">{{$t('logout-are-you-sure')}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="secondary" @click="confirmationDialog = false" class="primary--text font-weight-bold">{{$t('cancel')}}</v-btn>
          <v-btn depressed height="32" color="secondary" @click="onLogOut" class="px-8 float-right">{{$t('yes')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </v-navigation-drawer>
</template>
<script type="text/javascript">
    import { mapGetters, mapMutations, mapState, mapActions } from 'vuex';
    import constants from '../../constants/resolutions-constants';
    import { ROLES } from '../../constants/roles';
    import sidebarJson from "../../assets/data/sidebar";
    import SidebarLink from './sidebar-navlink';
    import {AF3_HIDDEN_PATHS} from '../../constants/af3-hidden-paths';
    export default {
      props: ['themeLoaded', 'windowWidth'],
      components: {
        'sidebar-link': SidebarLink
      },
      data() {
        return {  
          mini: false,
          sm: constants.IPAD_PORTRAIT,
          items: sidebarJson.sidebarMenu,
          confirmationDialog: false,
          role: null,
          logo: require('../../../src/assets/img/logo.png'),
          logoCollapsed: require('../../../src/assets/img/logocollapsed.png')
        }
      },
      created: function() {
        if (this.$route.meta.menuItems) {
          this.items = sidebarJson[this.$route.meta.menuItems];
        }
        this.items.map((link)=>{
          if (this.getIsMobileIpadPortrait) {
            link.toLink === '/install' ? this.$set(link, 'visible', true) : link.toLink === '/assets' ? this.$set(link, 'visible', true) : link.toLink === '/help' ? this.$set(link, 'visible', true) : this.$set(link, 'visible', false);
          } else {
            this.$set(link, 'visible', true)
          } 
        })
        this.mini = false;
        if(this.windowWidth <= constants.IPAD_LANDSCAPE || (this.$route.meta.sidebarMini && this.windowWidth <= constants[this.$route.meta.sidebarMini])) {
          this.mini = true;
        }
        this.items.map(link => {
          if (link.subMenuItems) {
            this.$set(link, 'collapsed', true);
            link.subMenuItems.map(submenuItem => this.$set(submenuItem, 'active', false))
          }
        });
        //in order to highlight the sidebar option
        this.onLinkNavigated(this.$route.path);

        /* If the user has organization/s show user's role for the selected Organization */
        if(localStorage.getItem('orgId')){
          this.role = this.userRole;
        }
      },
      watch:{
        currentSite(newSite, oldSite) {
          if (newSite.isAf3 && !oldSite.isAf3 && (AF3_HIDDEN_PATHS.find(path => path === this.$route.path))) {
            this.$router.push('assets');
          }
          //remove the loaded submenu from the previous site, in order to load it with the data from the new site
          this.items.map(link => {
            if (link.loadSubMenu) {
              this.$set(link, 'collapsed', true);
              link.subMenuItems = [{}];
              this.clearWorkbooks();
            }
          });
        },
        $route(to, from) {
          if(to.meta.menuItems !== from.meta.menuItems){
            this.$set(this, 'items', sidebarJson[to.meta.menuItems]);
          }else{
            this.onLinkNavigated(to.path);
          }
          if(this.$route.meta.sidebarMini && this.windowWidth <= constants[this.$route.meta.sidebarMini]){
            this.mini = true; 
          }
        },
        windowWidth: function(width) {
          if(width <= constants.IPAD_LANDSCAPE || (this.$route.meta.sidebarMini && this.windowWidth <= constants[this.$route.meta.sidebarMini])) {
            this.mini = true; 
          }
        },
        siteUserRole(newSiteUserRole){
          /* If the user has no organization show user's role for the selected Site */
          if(!localStorage.getItem('orgId')){
            this.role = newSiteUserRole;
          }
        },
        mini(newValue){
          this.setSidebarMini(newValue);
        }
      },
      computed: {
        ...mapState('site', {'siteUserRole':'userRole'}),
        ...mapGetters('organization', ['userRole', 'organizations', 'orgSelectedName', 'orgSelected']),
        ...mapGetters('site', ['currentSite', 'sites']),
        ...mapGetters('layout', ['getLogo', 'getOptionSelected', 'getIsMobileIpadPortrait']),
        getUserRole(){
          if(this.role && this.role.assetInfo.metadata.props.role){
            return this.role.assetInfo.metadata.props.role;
          } else{
            if(this.role && this.role.assetInfo.metadata.props.Admin === 'true'){
              return this.$t('sidebar-admin-role');
            } else {
               return this.$t('sidebar-user-role');
            }
          }
        }
      },
      methods: {
        ...mapMutations('layout', ['setSidebarMini']),
        ...mapMutations('tableau', ['clearWorkbooks']),
        ...mapActions('organization', ['openAddEditModal']),
        onLogOut(){
          this.$store.dispatch('logout', {vuetify: this.$vuetify});
        },
        onMainLinkSelected(item){
          if (item.subMenuItems) {
            //there are submenu items, open a panel            
            this.$set(item, 'collapsed', !item.collapsed)
          }          
        },
        onLinkNavigated(link) {
          this.items.map((itemLink) => { itemLink.active = false });
          this.items.map((itemLink) => {
            if (itemLink.subMenuItems) {
              itemLink.subMenuItems.map((sub)=>{
                if (sub.toLink === link) {
                  itemLink.active = true;
                  itemLink.collapsed = false;
                  sub.active = true;
                }
              })
            }
          })
        },
        activeSubLink(item, subItem) {          
          if (item && subItem && subItem.toLink) {
            item.subMenuItems.map(submenuItem => this.$set(submenuItem, 'active', false))
            this.$set(subItem, 'active', true);
          }
        },
        deactiveSubLinks(item) {
          if (!item.subMenuItems) {
              this.items.map(item => {
                if (item.subMenuItems) {
                  item.subMenuItems.map(subMenuItem => this.$set(subMenuItem, 'active', false))
              }
            })
          }          
        },
        hasSubmenuActive(subMenuItems) {          
          if (subMenuItems) {
            for (let index = 0; index < subMenuItems.length; index++) {
             if (subMenuItems[index].active) {
                return true;
              }
            }
          }
        },
        onNavigate(link) {         
          this.$router.currentRoute.path !== link ? this.$router.push(link): null;
        },
        checkShowOrg(){
          if(this.organizations.length === 1 && (this.userRole.assetInfo.metadata.props.role === ROLES.ADMIN || this.userRole.assetInfo.metadata.props.role === ROLES.SUPER_ADMIN)){
            return true;
          }else{
            if(this.organizations.length > 1){
              return true;
            }
          }
          return false;
        }
      }
  }
</script>

<style lang='scss' scoped>
  .logo-item{
    height: 55px;
  }
  #sidebar {
    z-index: 0;
  }
  #sidebar .v-list-item__title.avatar-title{
    font-weight: 600;
    font-size: 14px;
    color:var(--v-primary-base);
  }
  #sidebar .v-list-item__subtitle.avatar-subtitle{
    color:var(--v-primary-base);
		text-transform: uppercase;
    font-size: 10px;
  }
  .logout-item .v-icon{
    opacity: 1;
  }
  .logout-item{
    font-size: 12px;
    text-transform: none;
  }
  .logout-item .v-icon.logout-mini-icon{
    margin-left: 0px;
    margin-right: -8px;
  }
  .header-icon-arrow {
    position: absolute;
    right: 0px;
  }
  .mini-header-icon-arrow {
    right: -2px;
    color: rgba(0, 0, 0, 0.54) !important;
  }
  .v-navigation-drawer--mini-variant .item-avatar{
    padding: 0px;
  }
  .v-avatar.v-list-item__avatar {
    height: inherit !important;
    width: inherit !important;
  }
  .mini-avatar {
    left: 7px;
  }
  .tooltip{
    height: 29px;
    border-radius: 3px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
    background-color: var(--v-primary-base);
  }
  #chevron-right{
    margin-right: 18px;
  }

  .headline {
    height: 48px;
    font-size: 18px !important;
    font-weight: 600;
    color: #3b5762;
  }
</style>
