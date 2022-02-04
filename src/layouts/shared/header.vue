<template>
  <!-- //LANGUAGE ITEM DROPDOWN
        <b-nav-item-dropdown right class="lang pr-0">
            <template slot="button-content">
                <b-img :src="selectedLang.icon" alt=""/>
            </template>
            <b-dropdown-item v-for="entry in languages" 
                :key="entry.title" @click="changeLocale(entry)" > 
                <b-img :src="entry.icon" alt="" /><span> {{entry.language}} </span></b-dropdown-item>  
        </b-nav-item-dropdown>
      -->
    <div>

  <v-app-bar app dark color="primary" height="72" id="header" class="header-container">
    <v-app-bar-nav-icon v-if="windowWidth <= sm" v-model="drawer" @click="drawer = !drawer"></v-app-bar-nav-icon>
    <!--v-app-bar-nav-icon></v-app-bar-nav-icon-->
    <v-toolbar-title class="ml-3" v-bind:class="{ 'toolbar-title': $route.meta.title !== 'sidebar-org-select' }">
      {{ $t($route.meta.title) }}
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-col
      v-show="$route.meta.headerSites"
      class="header-dropdown"
      id="site-select"
      cols="12"
      sm="3"
    >
      <v-autocomplete
        id="selectSite"
        :items="sites"
        item-text="value"
        item-value="id"
        v-on:change="onSiteChange"
        label="Site"
        v-model="selectedSide"
        :no-data-text="$t('sites-not-available')"
        outlined
        dense
      >
      </v-autocomplete>
    </v-col>
  </v-app-bar>
  <!-- mobile version sidebar -->
  <v-navigation-drawer v-if="windowWidth <= sm" v-model="drawer" app class="primary nav-drawer">
      <v-list>
        <v-list-item v-for="itemLink in sidebarLinks" :key="itemLink.title" @click="onNavigate(itemLink)"
        v-show="(itemLink.title !== 'sidebar-org-select' || (itemLink.title === 'sidebar-org-select' && organizations.length > 1)) && itemLink.visible && ((!currentSite.isAf3) || (currentSite.isAf3 && !itemLink.hideForAf3))
              && (itemLink.condition ? evalCondition(itemLink) : true)">
          <v-list-item-action>
            <v-icon class="white--text link-icon" v-text="itemLink.icon" medium></v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title class="white--text">{{ $t(itemLink.title) }}</v-list-item-title>
            <div v-if="itemLink.subMenuItems">
              <div v-for="submenuItem in itemLink.subMenuItems" :key="submenuItem.title">
                <div v-if="(submenuItem.condition ? evalCondition(submenuItem) : true) && ((!currentSite.isAf3) || (currentSite.isAf3 && !submenuItem.hideForAf3))" @click="onNavigate(submenuItem)" class="white--text mobile-submenu">{{ submenuItem.string_name ? submenuItem.string_name : $t(submenuItem.name) }}</div>
              </div>
            </div>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="confirmationModal = true">
          <v-list-item-action>
            <v-icon class="white--text" v-text="'mdi-logout'" medium></v-icon>
          </v-list-item-action>
           <v-list-item-content>
            <v-list-item-title class="white--text">{{$t('sidebar-logout')}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
      <confirm-modal
        @confirm="logout"
        @cancel="confirmationModal = false"
        :dialogModel="confirmationModal"
        :dialogTitle="$t('sidebar-logout')"
        :dialogBody="$t('logout-are-you-sure')"
      />
      <confirm-modal 
      @confirm="noItemsModal = false"
      dialogConfirmOnly="true"
      :dialogModel="noItemsModal"
      :dialogBody="modalMsg"
      :dialogConfirmBtn="$t('ok')"
    />
    </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import i18n from '../../i18n.js';
import confirmModal from '../../components/shared/modals/confirmModal'
import sidebarJson from "../../assets/data/sidebar";
import resolutionConstants from '../../constants/resolutions-constants'

export default {
  data() {
    return {
      languages: [
        {
          title: 'English',
          language: 'en',
          icon: '../../../src/assets/img/flags/us-flag.png',
        },
        {
          title: 'Español',
          language: 'es',
          icon: '../../../src/assets/img/flags/spain-flag.png',
        },
      ],
      selectedLang: [
        {
          title: 'English',
          language: 'en',
          icon: '../../../src/assets/img/flags/us-flag.png',
        },
      ],
      sidebarLinks: sidebarJson.sidebarMenu,
      selectedSide: null,
      drawer: false,
      confirmationModal: false,
      sm: resolutionConstants.IPAD_PORTRAIT,
      noItemsModal: false,
      modalMsg: null
    };
  },
  props: ['windowWidth'],
  components: {
    confirmModal
  },
  computed: {
    ...mapGetters('site', ['sites', 'currentSite', 'currentSiteId']),
    ...mapGetters('organization', ['organizations', 'currentOrganization', 'orgRoles']),
    ...mapGetters('header', ['getMapVisible']),
    ...mapGetters('layout', ['getWindowWidth', 'getIsMobileIpadPortrait']),
  },
  methods: {
    ...mapActions('site', ['setCurrentSiteId', 'getSiteUserRole']),
    ...mapMutations('tableau', ['clearWorkbooks']),
    evalCondition(item){
      let result = true;
      if(Array.isArray(item.condition)){
        item.condition.forEach(condition => {
            result = result && (this[condition.getter]!== undefined ? (this[condition.getter][condition.property] === condition.value) : false);
        });
        if(result && item.loadSubMenu && (item.subMenuItems[0] && (Object.keys(item.subMenuItems[0]).length === 0))){
          this.loadSubmenu(item);
        }
      }else{
        if(item.subMenuItems){
          result = false;
          item.subMenuItems.forEach(subItem => {
            result = result || this.evalCondition(subItem);
          });
        }
      }
      return result; 
    },
    async loadSubmenu(item){
      let submenu = await this.$store.dispatch(item.loadSubMenu);
      item.subMenuItems =  submenu;
    },
    changeLocale(locale) {
      i18n.locale = locale.language;
      this.selectedLang.title = locale.title;
      this.selectedLang.language = locale.language;
      this.selectedLang.icon = locale.icon;
    },
    onNavigate(link) {
      if(link.param){
        (this.$router.currentRoute.name !== link.toLink || JSON.stringify(this.$router.currentRoute.params) !== JSON.stringify(link.param) ) ? this.$router.push({name: link.toLink, params: link.param}) : null;
      }
      else{
        if(link.toLink){
          this.$router.currentRoute.path !== link.toLink ? this.$router.push(link.toLink) : null;
        }
      }
      if(link.loadSubMenu && link.subMenuItems.length === 0){
          this.noItemsModal = true;
          this.modalMsg = this.$t(link.emptySubmenuInfo);
      }
    },
    async onSiteChange(siteId) {
      // Only process when Site has been changed
      if (siteId !== this.currentSiteId) {
        this.setCurrentSiteId({ siteId }); //it will fire the watch currentSite on assets which will ask for the site tags with pagination
        //remove the loaded submenu from the previous site, in order to load it with the data from the new site
        this.sidebarLinks.map(link => {
          if (link.loadSubMenu) {
            this.$set(link, 'collapsed', true);
            link.subMenuItems = [{}];
            this.clearWorkbooks();
          }
        });
      }
    },
    setLinks() {
      this.sidebarLinks.map((link) => {
        if (this.getIsMobileIpadPortrait) {
          switch (link.toLink) {
            case '/assets':
              this.$set(link, 'visible', true)
              break;  
            case '/analytics':
              this.$set(link, 'visible', true)
              break;
            case '/org-select':
              this.$set(link, 'visible', true)
              break;
            case '/help':
              this.$set(link, 'visible', true)
              break;
            case '/install':
              this.$set(link, 'visible', true)
              break;
          
            default:
              this.$set(link, 'visible', false)
              break;
          }
        } else {
          this.$set(link, 'visible', true)
        } 
      })
    },
    logout() {
      this.$store.dispatch('logout', {vuetify: this.$vuetify});
    }
  },
  created() {
    this.selectedSide = this.currentSite;
    this.selectedLang.icon = '../../../src/assets/img/flags/us-flag.png';
    if (this.$route.meta.menuItems) {
      this.sidebarLinks = sidebarJson[this.$route.meta.menuItems];
    }
    this.setLinks();
  },
  watch: {
    getIsMobileIpadPortrait: function () {
      this.setLinks();
    },
    currentSite: async function (site, oldSite) {
      if(site.id){//will be undefined in case that currentSite was cleared, with this we are avoing to do a call with an undefined site.id
        this.selectedSide = site;
        if (!localStorage.getItem('orgId')) {
          await this.getSiteUserRole(site.id);
        }
      }
    },
    $route(to, from) {
      if(to.meta.menuItems !== from.meta.menuItems){
        this.$set(this, 'sidebarLinks', sidebarJson[to.meta.menuItems]);
        this.setLinks();
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.link-icon {
  position: absolute !important;
  top: 12px;
}
.nav-drawer {
  .v-navigation-drawer__content{
    max-height: 85%;
  }
}
.v-btn-toggle > .v-btn.v-btn {
  opacity: 1 !important;
}
.header-dropdown {
  margin-top: 30px;
  min-width: 250px;
}
@media (max-width: 768px) {
  .header-dropdown {
    max-width: 70vw;
    padding: 5px;
    margin-right: 2px;
  }
}
.mobile-submenu {
  padding: 10px 5px 10px 10px;
  text-transform: capitalize;
}
</style>
