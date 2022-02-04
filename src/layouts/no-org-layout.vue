<template>
  <v-app
    id="portal"
    v-bind:class="{ collapsed: $store.getters.getSidebarOpen }"
  >
    <app-sidebar
      :windowWidth="windowWidth"
      :themeLoaded="themeLoaded"
    ></app-sidebar>
    <app-header :windowWidth="windowWidth"></app-header>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col>
            <slot />
          </v-col>
        </v-row>
      </v-container>
			<org-add-edit-modal />
    </v-main>
  </v-app>
</template>
<script type="text/javascript">
import { mapGetters, mapMutations } from 'vuex';
import constants from '../constants/resolutions-constants';
import Header from './shared/header.vue';
import Sidebar from './shared/sidebar.vue';
import OrgAddEditModal from "../components/organizations/organization-new-edit.vue";
import { mobileCheck } from '../utils/mobileCheck';

export default {
  data() {
    return {
      themeLoaded: false,
      sm: constants.IPAD_PORTRAIT,
      windowWidth: document.documentElement.clientWidth,
    };
  },
  components: {
    'app-header': Header,
    'app-sidebar': Sidebar,
    'org-add-edit-modal': OrgAddEditModal,
  },
  computed: {
    ...mapGetters('layout', ['getIsMobile',]),
  },
  mounted() {
    this.setIsMobile(mobileCheck());
    if (this.getIsMobile && window.innerWidth <= constants.IPAD_PORTRAIT) {
      this.setIsMobileipadPortrait(true);
    } else {
      this.setIsMobileipadPortrait(false);
    }
    this.setDeviceWidth(window.innerWidth);
    window.addEventListener('resize', this.onResize);
  },
  methods: {
    ...mapMutations('layout', [
      'setDeviceWidth',
      'setIsMobile',
      'setIsMobileipadPortrait',
    ]),
    onResize(event) {
      this.setIsMobile(mobileCheck());
      if (
        this.getIsMobile &&
        event.target.innerWidth <= constants.IPAD_PORTRAIT
      ) {
        this.setIsMobileipadPortrait(true);
      } else {
        this.setIsMobileipadPortrait(false);
      }
      this.windowWidth = event.target.innerWidth;
      this.setDeviceWidth(event.target.innerWidth);
    },
    beforeDestroy: function () {
      window.removeEventListener('resize', this.onResize);
    },
  },
};
</script>