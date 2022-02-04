<template>
    <div class="org-container">
	<v-row>
		<v-col class="custom-card card-no-footer-height ">
			<v-row>
				<v-col cols="1" class="pre-organization">
					<v-btn id="hide-show-list" @click="addOrganization" :depressed="true" class="primary--text font-weight-bold ml-5 w-100" color="primaryLight"> 
						<span>{{$t('add')}}</span>
					</v-btn>
				</v-col>
				<v-col cols="1" class="pre-organization">
					<v-btn id="hide-show-list" @click="showList = !showList; searchedOrganizations = []; searchValue = ''" :depressed="true" class="w-100 primary--text font-weight-bold ml-5" color="primaryLight"> 
						<span v-if="!showList">{{$t('browse')}}</span>
						<span v-if="showList">{{$t('search')}}</span> 
					</v-btn>
				</v-col>
				<v-col :cols="getWindowWidth >= ipadPortrait ? '8' : '11'" class="pt-0">
					<v-row class="searchBarsContainer" v-if="!showList">
						<search-bar :cols="getWindowWidth >= ipadPortrait ? '5' : '12'" :placeholder="$t('organizations-select-placeholder')" @searchText="search"/>
						<label class="ml-6" v-bind:class="{ 'mt-5': getWindowWidth >= ipadPortrait }">{{ $t('organizations-select-or') }}</label>
						<search-bar :cols="getWindowWidth >= ipadPortrait ? '5' : '12'" :placeholder="$t('organizations-select-placeholder-2')" @searchText="handleSearchSite" :id="'search-bar-sitefield'"/>
					</v-row>
				</v-col>
			</v-row>
			<v-row>
				<v-col>
					<v-alert
					id="login-alert-error1"
					class="submit-error"
					:value="!loading && searchedOrganizations.length === 0 && !showList && searchValue !== ''"
					transition="scale-transition"
					>
					{{$t('no-results')}}
				</v-alert>
					<v-list class="org-list default-scroll-bar" rounded>
						<v-list-item-group color="primary">
							<v-list-item v-for="(item, i) in displayOrganizations" :key="i" :id="`org-select-search-list-item-${i + 1}`">
								<v-list-item-content @click="selectOrganization(item)">
									<v-list-item-title v-text="item.name"></v-list-item-title>
								</v-list-item-content>
								<v-list-item-action>
									<v-menu
										bottom
										left
										:open-on-hover="true"
										:open-on-click="true"
										:close-on-click="true"
										:close-on-content-click="true"
										:offset-x="true"
									>
										<template v-slot:activator="{ on }">
											<v-btn class="center-content w-100" dark icon v-on="on">
												<v-icon ref="icon" class="icon-color">mdi-dots-horizontal</v-icon>
											</v-btn>
										</template>
										<v-list>
											<v-list-item id="edit-org" @click="handleEditOrganization(item)">
												<v-icon small class="mr-2">mdi-pen</v-icon>
												<v-list-item-title>Edit</v-list-item-title>
											</v-list-item>
											<v-list-item id="delete-org" @click="handleDeleteOrganization(item)">
												<v-icon small class="mr-2">mdi-delete</v-icon>
												<v-list-item-title>Delete</v-list-item-title>
											</v-list-item>
										</v-list>
									</v-menu>
								</v-list-item-action>
							</v-list-item>
						</v-list-item-group>
					</v-list>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
		<ConfirmationByWritingModal 
		@confirm='confirmDeleteOrg'
		@cancel='confirmModal = false'
		:dialogModel='confirmModal'
		:dialogTitle="$t('delete-organization')"
		:nameToDelete="orgToDelete ? orgToDelete.name : ''"
		:customMessage="$t('organization-delete-confirm-message')" />
    </div>
</template>

<script type="text/javascript">
	import { mapActions, mapMutations, mapGetters } from 'vuex';
	import SearchBar from "../components/search-bar/search-bar";
	import ResolutionConstants from '../constants/resolutions-constants'
	import Header from '../layouts/shared/header';
	import ConfirmationByWritingModal from '../components/shared/modals/confirmModalByWriting';
	import deliveryData  from "../assets/data/deliveryData";

	export default {
  name: "Org-Select",
		components: {
			ConfirmationByWritingModal,
			'app-header': Header,
			"search-bar": SearchBar
		},
		data() {	
			return {
				showList: false,
				searchValue: '',
				confirmModal: false,
				orgToDelete: null,
				ipadPortrait: ResolutionConstants.IPAD_PORTRAIT,
				innerWidth: window.innerWidth,
				searchedOrganizations: [],
				loading: false
			}
		},
		watch: {
			organizations() {
				if (this.searchValue) {
					this.search(this.searchValue);
				}
			}
		},
		mounted() {
			localStorage.removeItem('siteId');
			this.setDeviceWidth(window.innerWidth);
			window.addEventListener('resize', this.onResize);
			this.refreshOrgList();
		},
		computed: {
			...mapGetters('organization', ['organizations', 'userRole']),
			...mapGetters('layout', ['getWindowWidth']),
			displayOrganizations() {
				return this.showList ? this.organizations : this.searchedOrganizations;
			}
		},
		methods: {
			...mapActions('organization', [
				'setSelectedOrganizationId',
				'setSelectedOrganizationName',
				'getOrgUserRole',
				'getOrganizations',
				'deleteOrganization',
				'openAddEditModal',
			]),
			...mapActions('site', ['searchSite']),
			...mapMutations('layout', ['setDeviceWidth']),
			...mapMutations('site', ['clearSite']),
			...mapMutations('tag', ['clearTags']),
			...mapMutations('area', ['clearArea']),
			...mapMutations('header', ['setMapVisible']),
			addOrganization(){
				this.openAddEditModal();
			},
			handleEditOrganization(org) {
				this.openAddEditModal(org.id);
			},
			handleDeleteOrganization(org) {
				this.orgToDelete = org;
				this.confirmModal = true;
			},
			async refreshOrgList() {
				await this.getOrganizations();
				if (this.searchValue) {
					this.search(this.searchValue);
				}
			},
			selectOrganization: async function(organization) {
				// TODO Add localstorage service/utils
				await this.clearSite();
				await this.clearTags();
				this.setSelectedOrganizationId({id: organization.id});
				this.setSelectedOrganizationName({ name: organization.name });
				await this.clearArea();
				await this.setMapVisible(false);
				localStorage.setItem('orgId', organization.id);
				// set the user's role for the selected organization
				await this.getOrgUserRole(organization.id);
				// check if it is 'delivery' org and 'delivery' user. In the future, we need to ask for the apps' JSON from the logged user.
				if(deliveryData.deliveryOrgsIds.includes(organization.id)){
					this.$router.push('/apps');
				}else{
					this.$router.push('/assets');
				}
			},
			async confirmDeleteOrg() {
				try {
					let resp = await this.deleteOrganization(this.orgToDelete.id);
					this.$toasted.show(this.$t('organization-deleted'), {
						position: 'bottom-right',
						className: ['toast-success'],
						duration: 2000,
					});
					this.refreshOrgList();
					this.confirmModal = false;
				} catch (error) {
						this.$toasted.show(error, {
						position: 'bottom-right',
						className: ['toast-error'],
						duration: 5000,
					});
				}
			},
			search(str) {
				this.searchedOrganizations = [];
				this.searchValue = str;
				if (str !== '') {
					this.searchedOrganizations = this.organizations.filter(o => 
					o.name.toLowerCase().replaceAll(' ', '').includes(str.toLowerCase().replaceAll(/%20/g, '')) ||
					o.id === str
				)}
			},
			async handleSearchSite(searchVal){
				this.searchedOrganizations = [];
				if(searchVal){
					try{
						this.loading = true;
						let sites = await this.searchSite(searchVal);
						this.searchValue = searchVal;
						let organization = null;
						if(sites){
							sites.forEach(site => {
							if(site.assetInfo.metadata.props.organizationId) {
								organization = this.organizations.filter(org => org.id === site.assetInfo.metadata.props.organizationId);
								if(organization.length > 0 ){
									let aux = this.searchedOrganizations.filter(org => org.id === organization[0].id)
									if(!aux.length){
										this.searchedOrganizations.push(organization[0]);
									}
								}
							}
							});
						}
						this.loading = false;
					}catch (error) {
						this.$toasted.show(error.data.message, { 
							position: "bottom-right",
							className: ['toast-error'], 
							duration : 5000
						});
						this.loading = false;
					}
				}else{
					this.searchValue = searchVal;
				}
			},
			onResize(ev) {
				this.setDeviceWidth(event.target.innerWidth);
			}
		},
		beforeDestroy: function () {
			window.removeEventListener('resize', this.onResize);
		},
	}
</script>

<style type="text/css" scoped>
	.searchBarsContainer {
		margin-left: -4px;
	}
	.searched-org-list {
		height: calc(100vh - 215px);
		overflow-y: scroll;
	}
	.org-list {
		height: calc(100vh - 215px);
		overflow-y: scroll;
	}
	.pre-organization {
		min-width: 110px;
		width: 100%;
	}
	.submit-error {
		color: var(--v-error-base);
		margin-left: 5px;
		position: absolute;
		margin-top: -30px;
		font-size: .8rem;
	}
	.icon-color {
		color: #b8bdc7 !important;
	}
</style>
