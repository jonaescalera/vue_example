<template>
  <v-app
    id="portal"
    v-bind:class="{ collapsed: $store.getters.getSidebarOpen }"
  >
    <overlay />
    <right-container
      v-bind:class="{
        'right-cont-collapsed': getRightContainerOpen === 'closed',
        'right-cont-not-collapsed': getRightContainerOpen === 'opened',
        'right-cont-not-init': getRightContainerOpen === '',
      }"
    />
    <!--Session expired dialog -->
    <v-dialog v-model="myModal" v-show="isIdle" width="400" persistent>
      <v-card>
        <v-card-title style="color: var(--primary);">
					{{$t('session-expired')}}
        </v-card-title>
        <v-card-text>
					{{$t('continue-session')}}
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="primary-btn" @click="onClose" text>
            {{$t('ok')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--End session expired dialog -->

    	<app-sidebar :windowWidth="windowWidth" :themeLoaded="themeLoaded"></app-sidebar>
    	<app-header :windowWidth="windowWidth" v-if="!$route.meta.noHeader || (windowWidth <= sm)"></app-header>

    	<v-main>
	      <v-container
	        fluid
	      >	
	        <v-row>
	          <v-col>
	          	<slot/>
	          </v-col>
	      	</v-row>
		  </v-container>
			<org-add-edit-modal />
		</v-main>
    </v-app>
</template>
<script type="text/javascript">
import { defaultTheme } from '../constants/theme';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import constants from '../constants/resolutions-constants';
import Header from './shared/header.vue';
import Sidebar from './shared/sidebar.vue';
import RightCont from './shared/right-info-panel.vue';
import Overlay from './shared/overlay.vue';
import OrgAddEditModal from "../components/organizations/organization-new-edit.vue";
import { mobileCheck } from '../utils/mobileCheck'
const sitesForAnalytics = ['ed071bf1-e94c-493c-b5a9-79afc70f6915', 'af0a6325-78f8-46c1-b5c7-17e4ae5e7c4f']

	export default {
		data() {
			return {
				myModal: false,
				themeLoaded: false,
				previousSiteId: localStorage.getItem('siteId'),
				sm: constants.IPAD_PORTRAIT,
				defaultTheme: defaultTheme,
				windowWidth: document.documentElement.clientWidth
			}
		},
		components: {
		  'app-header': Header,
		  'app-sidebar': Sidebar,
		  'overlay': Overlay,
		  'right-container': RightCont,
			'org-add-edit-modal': OrgAddEditModal,
		},
		computed: {
			...mapGetters('organization', ['orgSelected']),
			...mapGetters('layout', ['getTheme', 'getRightContainerOpen', 'getIsMobile']),
			...mapGetters('site', ['currentSiteId']),
			...mapGetters('tableau', ['workbooks']),
			isIdle() {
				if(this.$store.state.idleVue.isIdle)
					this.myModal=true;
  			}	
		},
		async mounted() {
			this.setIsMobile(mobileCheck());
			if (this.getIsMobile && window.innerWidth <= constants.IPAD_PORTRAIT) {
				this.setIsMobileipadPortrait(true);
			}else{
				this.setIsMobileipadPortrait(false);
			}
			this.setDeviceWidth(window.innerWidth);
			window.addEventListener('resize', this.onResize);
			await this.fetchSites();
			this.fetchTheme();
    	},
		watch:{
			workbooks(newWorkbooks){
				if(newWorkbooks.length > 0){
					if(!this.previousSiteId && !this.getIsMobile && sitesForAnalytics.includes(this.currentSiteId)){//if TOSCA or Joshua site was selected
						this.$router.push('/analytics/'+encodeURIComponent(newWorkbooks[0].param.view));
					}
				}
			}
		},
		methods:{
			...mapActions('layout', ['getCustomTheme']),
			...mapActions('site', ['getSites', 'setCurrentSiteId']),
			...mapMutations('layout', ['setDeviceWidth', 'setIsMobile', 'setIsMobileipadPortrait']),
			async fetchSites() {
				const sites = await this.getSites();
				if(sites.length > 0) {
					let siteIdToSelect;
					if(this.previousSiteId) {
						this.previousSite = sites.find(site => site.id === this.previousSiteId);
						siteIdToSelect = this.previousSite ? this.previousSite.id : sites[0].id;
					} else {
						siteIdToSelect = sites[0].id;
					}
					this.setCurrentSiteId({ siteId: siteIdToSelect });
				}
			},
			onResize(event) {
				this.setIsMobile(mobileCheck());
				if (this.getIsMobile && event.target.innerWidth <= constants.IPAD_PORTRAIT) {
					this.setIsMobileipadPortrait(true);
				}else{
					this.setIsMobileipadPortrait(false);
				}
				this.windowWidth = event.target.innerWidth;
				this.setDeviceWidth(event.target.innerWidth);
			},
			onClose(){
				this.$store.dispatch('logout', {vuetify: this.$vuetify});
			},
			setTheme(){
				const theme = this.getTheme;
				this.$vuetify.theme.themes.light.primary = theme.colorSettings.primary;
				this.$vuetify.theme.themes.light.secondary = theme.colorSettings.secondary;
				this.$vuetify.theme.themes.light.primaryLight = theme.colorSettings.primaryLight;
				this.$vuetify.theme.themes.light.info = theme.colorSettings.info || '#3b5762';
			},
			beforeDestroy: function () {
			window.removeEventListener('resize', this.onResize);
		},
		async fetchTheme(){
			await this.getCustomTheme({organizationUuid: this.orgSelected});
			this.$set(this, 'themeLoaded', true);
			this.setTheme();
		}
	}
}
</script>

<style lang="scss" type="text/css" scoped>
.right-cont-collapsed .outside-right-container {
  display: none;
}
.right-cont-collapsed {
  position: absolute;
  z-index: 8;
  animation-fill-mode: forwards;
  animation-name: fade-out;
  animation-duration: 0.6s;
}
.right-cont-not-collapsed {
  position: absolute;
  z-index: 8;
  animation-fill-mode: forwards;
  animation-name: fade-in;
  animation-duration: 0.6s;
}
.right-cont-not-init {
  display: none;
}

@keyframes fade-out {
  from {
    left: calc(100vw - 450px);
  }
  to {
    left: 100vw;
  }
}
@keyframes fade-in {
  from {
    left: 100vw;
  }
  to {
    left: calc(100vw - 450px);
  }
}

// IE styles
@media all and (-ms-high-contrast: none) {
  .right-cont-collapsed {
    position: absolute;
    z-index: 3;
    display: none;
  }
  .right-cont-not-collapsed {
    position: absolute;
    z-index: 3;
    left: calc(100vw - 450px);
    display: block;
  }
}
</style>
