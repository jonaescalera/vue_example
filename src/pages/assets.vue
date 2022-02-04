<template>
  <div id="assets" ref="assets">
    <v-row>
      <v-col class="custom-card px-0 pa-0" v-bind:class="{ 'card-no-footer-height': getMapVisible, 'relative-position': sitesLoaded && !currentSite.id }">
        <v-row v-if="sitesLoaded && !currentSite.id">
          <v-col class="no-sites-msg">
            <b>An asset belongs to one (and only one) Airfinder site. Please add a site to the organization so that you may add an Asset.</b>
          </v-col>
        </v-row>
        <v-row class="mb-3" style="height: 40px;">
            <!-- search bar -->
              <search-bar v-if="(!getIsMobileIpadPortrait || (getIsMobileIpadPortrait && !getMapVisible))" @clearClicked="clearSearchClicked" @onSearchBarKeyUp="searchTyped" :searchText="searchTerm" @searchText="searchBarFilter" :cleanText="cleanText" v-bind:class="{'only-search': getIsMobileIpadPortrait}"/>            
              <v-col cols="8" v-bind:class="{'col-12': (getIsMobileIpadPortrait && getMapVisible)}">
              <div class="d-none d-sm-inline float-left">
                <filter-form
                  v-if="(getIsMobileIpadPortrait === false)"
                  :filterFields="filters"
                  :searchApplied="filterApplied"
                  :searchText="searchTerm"
                  :savedFilterForm="activeFilter"
                  :cleanForm="cleanForm"
                  @saveFilter="saveFilterToFav"
                  @onSearchTyped="searchTyped"
                  @applyFilters="applyFilters"
                  @deselectFilter="deselectFavFilter"
                  ref="filterFormRef"
                ></filter-form>
              </div>
              <div>
                <div v-if="filterApplied && !hideTags" class="primary--text total-text">
                  <b>{{filteredTotalRows}}</b>
                  <span> ({{ Math.round((filteredTotalRows * 100)/totalRows)}}%)</span>
                  {{$t('assets-page-of')}} {{ totalRows }} {{$t('assets-page-match-filter')}}
                </div>
                <div v-if="!filterApplied && !hideTags" class="primary--text total-text">
                  <b>{{ totalRows }}</b> {{$t('assets-page-assets-total')}}
                </div>
                <div v-if="hideTags" class="primary--text total-text">
                  <a @click="loadAllTags">{{$t('assets-page-search-all')}}</a>
                </div>
              </div>
            <v-btn-toggle
              v-model="toggleOption"
              v-show="$route.meta.headerToggle"
              class="btn-toggle float-right mr-3"
            >
              <v-btn v-if="!getIsMobileIpadPortrait || (getIsMobileIpadPortrait && getMapVisible)" @click="getMapVisible = false" depressed small>
                <v-icon color="secondary" small class="mr-1">
                  mdi-format-list-bulleted
                </v-icon>
                <span class="toggle-map-list-label">{{ $t('btn-header-option1') }}</span>
              </v-btn>
              <v-btn v-if="getIsMobileIpadPortrait === false" @click="goToMap" depressed small class="show-map-btn" :disabled="!mapFiltersLoaded">
                <v-icon color="secondary" small class="mr-1">mdi-map</v-icon>
                <span class="toggle-map-list-label"> {{ $t('btn-header-option2') }} </span>
              </v-btn>
            </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row  v-if="getIsMobileIpadPortrait === false">
          <v-col :cols="getWindowWidth > iphone ? 7 : 1" class="filter-height">
            <div class="d-none d-sm-inline">
              <filters-saved
                ref="favFilters"
                :width="filtersWidth"
                :filters="favFilters"
                @applyFilter="applyFavFilter"
                @deleteFilter="deleteFavFilter"
              ></filters-saved>
            </div>
          </v-col>
          <v-col :cols="getWindowWidth > iphone ? 5 : 11" class="pb-0">
            <div class="mr-3 right-btn-container">
              <v-btn v-if="getWindowWidth > iphone" id="import-asset" min-width="50" height="32" @click="importDevice" :depressed="true" class="primary--text font-weight-bold mr-3" v-bind:class="{'px-0': (sm > getWindowWidth)}" color="primaryLight">
                <v-icon v-if="sm > getWindowWidth"> mdi-import </v-icon>
                <span v-if="sm <= getWindowWidth">{{$t('assets-page-import-device')}}</span>
              </v-btn>
              <v-btn id="add-asset" min-width="50" height="32" @click="createDevice" :depressed="true" class="primary--text font-weight-bold" v-bind:class="{'px-0': (sm > getWindowWidth)}" color="primaryLight">
                <v-icon v-if="sm > getWindowWidth"> mdi-plus </v-icon>
                <span v-if="sm <= getWindowWidth">{{$t('assets-page-add-device')}}</span>
              </v-btn>
              <v-btn height="32" width="50" min-width="50" :depressed="true" class="primary--text font-weight-bold ml-3 p-0 action-popup-group-category" color="primaryLight">
                <actions-popup-component id="assets-options" :closeDelay="'150'" :iconColor="'var(--v-primary-base)'" :actions="addGroupCategoryBtns"/>
              </v-btn>
            </div>
          </v-col>
        </v-row>
        <!-- Grid component -->
        <DataTable
          v-show="!getMapVisible"
          :visible="getMapVisible"
          :settings="settings"
          :resizeRef="$refs.assets"
          name="assets"
          :columns="columnDefs"
          :rows="tags"
          :totalRows="filteredTotalRows"
          :page="pagination.page"
          :pageSize="pagination.size"
          :confirmDeleteModalBody="'delete-asset-selection'"
          :confirmDeleteModalTitle="'delete-asset-selection-title'"
          :customTableContainerClass="getIsMobileIpadPortrait ? 'withoutFilters' : 'withFilters'"
          :instructions="hideTags"
          @onPaginationChange="onPaginationChange"
          @onSort="onSorting"
          @onDeleteSelection="deleteSelectedAssets"
          @onExport="downloadCsv"
        ></DataTable>
        <!-- view with accordion list and map -->
        <list-map-view
            class="d-block" 
            v-if="getMapVisible"
            :siteId="currentSite.id"
            :mapData="populatedTags"
            :filters="filterString"
            :showSingleTag="showSingleTag"
            :onlyMap="getIsMobileIpadPortrait ? true : false"
            :totalRows="filteredTotalRows"
            :mapPagination="mapPagination"
            :mapLocations="locations"
            :actions="settings.moreActions"
            :noGeoJsonCall="noGeoJsonCall"
            @loadMore="loadMoreTags"
            @refreshTags="reloadTags">
        </list-map-view>
      </v-col>
    </v-row>
    <site-label-edit ref="siteLabelEditModal" @labelsEdited="setLabels(currentSite)"/>
    <import-device-modal @finished="refreshTags" ref="importDeviceModal"/>
    <new-edit-device-modal @editModalMode="createEditMode = 'edit'" @finished="refreshTags" :modalMode="createEditMode" ref="newEditDeviceModal"/>
    <new-edit-category-modal @finished="refreshTags" :modalMode="createEditMode" ref="newEditCategoryModal"/>
    <new-edit-group-modal @finished="refreshTags" :modalMode="createEditMode" ref="newEditGroupModal"/>
    <v-dialog v-model="confirmationDeleteDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">{{$t('devices-page-delete-device')}}</v-card-title>
        <v-card-text v-if="deviceToDelete" class="mt-3">{{$t('delete-are-you-sure', { name: deviceToDelete.name})}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn id="delete-btn-cancel" height="32" text color="secondary" @click="confirmationDeleteDialog = false; deviceToDelete = null" class="primary--text font-weight-bold">{{$t('cancel')}}</v-btn>
          <v-btn id="delete-btn-yes" depressed color="secondary" @click="confirmDelete" class="px-8 float-right">{{$t('yes')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import ListMapView from "../components/assets-map-view/assets-map-view"
import Af3MapView from "../components/assets-af3-map-view/assets-af3-map-view"
import SearchBar from "../components/search-bar/search-bar"
import constants from '../constants/resolutions-constants'
import { pageSize } from '../constants/pagination'
import { pageSizeAF3 } from '../constants/pagination'
import { csvMixin } from "../mixins/csvExport"
import { supertagTok } from '../constants/supertag';
import { AF3_INVALID_COORDINATES } from '../constants/not-applicable-values';
import AssetModel from "../models/tag"
import ImportDeviceModal from "../components/assets/import-device"
import NewEditDeviceModal from "../components/assets/device-new-edit"
import NewEditGroupModal from "../components/assets/group-new-edit" 
import NewEditCategoryModal from "../components/assets/category-new-edit" 
import DataTable from "../components/shared/data-table/data-table.vue"
import FilterForm from "../components/shared/filter-form/filter-form.vue"
import FiltersSaved from "../components/shared/filter-form/filters-saved.vue"
import BatteryLevelComponent from "../components/shared/data-table/custom-cells/battery-level"
import LocationBeaconCellComponent from "../components/shared/data-table/custom-cells/location-beacon-cell"
import LastEventCellComponent from "../components/shared/data-table/custom-cells/last-event-cell"
import AvailabiltyComponent from "../components/shared/data-table/custom-cells/availability-preview"
import ActionsPopupComponent from "../components/shared/data-table/custom-cells/actions-popup"
const emptyAssetsSites = ['ca9996b6-d7f9-4623-abe3-0c922c0e0fe5', '56c6fdde-a434-40ed-bb2b-fabd7dbc37ab']
import SiteLabelEdit from '../components/sites/site-label-edit'
import { ROLES } from '../constants/roles';
const gmapSites = ['fe6e88b1-47a2-4979-962b-610c1b1c2e13', 'ed071bf1-e94c-493c-b5a9-79afc70f6915']

export default {
  name: "Assets",
  components: {
    DataTable,
    FilterForm,
    FiltersSaved,
    AvailabiltyComponent,
    BatteryLevelComponent,
    LocationBeaconCellComponent,
    LastEventCellComponent,
    ActionsPopupComponent,
    SiteLabelEdit,
    ImportDeviceModal,
    NewEditDeviceModal,
    NewEditGroupModal,
    NewEditCategoryModal,
    ListMapView,
    Af3MapView,
    SearchBar
  },
  data() {
    return {
      columnDefs: null,
      favFilters: [],
      activeFilter: null,
      sm: constants.IPAD_LANDSCAPE,
      iphone: constants.IPHONE_8_PLUS_LANDSCAPE,
      createEditMode: "create",
      confirmationDeleteDialog: false,
      deviceToDelete: null,
      addGroupCategoryBtns: [
        {
          name: this.$i18n.t('devices-page-export-all'),
          fn: this.exportAll,
          icon: 'file-download-outline'
        },
        {
          name: this.$i18n.t('devices-page-add-group'),
          reference: 'addGroup',
          fn: this.addGroup,
          icon: 'table-plus'
        },
        {
          name: this.$i18n.t('devices-page-edit-group'),
          reference: 'editGroup',
          fn: this.editGroup,
          icon: 'table-edit'
        },
        {
          name: this.$i18n.t('devices-page-delete-group'),
          reference: 'deleteGroup',
          fn: this.deleteGroup,
          icon: 'table-minus'
        },
        {
          name: this.$i18n.t('devices-page-add-category'),
          reference: 'addCategory',
          fn: this.addCategory,
          icon: 'briefcase-plus-outline'
        },
        {
          name: this.$i18n.t('devices-page-edit-category'),
          reference: 'editCategory',
          fn: this.editCategory,
          icon: 'briefcase-edit-outline'
        },
        {
          name: this.$i18n.t('devices-page-delete-category'),
          reference: 'deleteCategory',
          fn: this.deleteCategory,
          icon: 'briefcase-minus-outline'
        }
      ],
      settings: {
            actionsPanel: true,
            sorting: true,
            moreActions: []
          },
      pagination: {
        size: pageSize,
        page: 1
      },
      mapPagination: {
        size: pageSize,
        page: 1
      },
      noPagination: false, //no pagination for indoor tags
      filterString: '',
      sorting: '',
      newSorting: false,
      searchText: '',
      showSingleTag: null,
      cleanForm: false,
      cleanText: false,
      searchTerm: '',
      filterApplied: false,
      getMapVisible: false,
      toggleOption: this.getMapVisible ? 1 : 0,
      supertagToken: supertagTok,
      noGeoJsonCall: false,
      hideTags: false
    };
  },
  mixins: [csvMixin],
  watch: {
    async currentSite(newSite, oldSite) {
      if (newSite && oldSite && newSite.id === oldSite.id) {
        return;
      }
      this.getColumnDefs();
      if (newSite.isAf3) {
        this.pagination = {
        size: pageSizeAF3,
        page: 1
        },
        this.mapPagination = {
          size: pageSizeAF3,
          page: 1
        }
      } else {
        this.pagination = {
          size: pageSize,
          page: 1
        },
        this.mapPagination = {
          size: pageSize,
          page: 1
        }
      }
      this.clearArea();
      this.$refs.filterFormRef && this.$refs.filterFormRef.clearForm();
      this.setLabels(newSite);
      await this.setResetTags('true');
      if(!emptyAssetsSites.includes(this.currentSite.id)){
        if(this.currentSite.isAf3){
          this.noGeoJsonCall = true;
          await this.fetchFilters(); //if we are on map view we need the areas to select one of them
        }else{
          this.fetchFilters();
        }
        await this.initTags(newSite.id);
        this.hideTags = false;
      }else{
        this.fetchFilters();
        this.setTags([]);
        this.setFilteredTotal(0);
        this.hideTags = true;
      }
      this.favFilters = [];
      this.activeFilter = null;
      if (this.getMapVisible && newSite.isAf3) {
        this.setAf3AreaFilter();
      }
      this.getActionBtns();
    },
    getIsMobileIpadPortrait: function (value) {
      this.setMoreActionsSIAB(value);
    },
    async getMapVisible(newValue) {
      // Check if Site is Hurley and Total Number of Tags in Site is undefined
      // This means this is a first load
      if (newValue && emptyAssetsSites.includes(this.currentSite.id) && !this.totalRows) {
        await this.initTags(this.currentSite.id);
        this.hideTags = false;
      }
    },
  },
  computed: {
      ...mapGetters('tag', ['tags', 'populatedTags', 'totalRows', 'filteredTotalRows', 'filters', 'getResetTags']),
      ...mapGetters('area', ['areas', 'currentArea']),
      ...mapGetters('site', ['currentSite', 'sitesLoaded']),
      ...mapGetters('site', { siteUserRole: 'userRole' }),
      ...mapGetters('location', ['locations']),
      ...mapGetters('organization', ['getIsIndividualUser']),
      ...mapGetters('organization', { orgUserRole: 'userRole'}),
      ...mapGetters('layout', ['getWindowWidth', 'getIsMobileIpadPortrait', 'isSidebarMini']),
      filtersWidth: function (){
        return this.isSidebarMini ? (this.getWindowWidth < this.iphone) ? this.getWindowWidth - 330 : (this.sm >= this.getWindowWidth) ? this.getWindowWidth - 380 : this.getWindowWidth - 562 : this.getWindowWidth - 735
      },
      mapFiltersLoaded: function() {
        let zones = this.filters.find(f => f.field === "zoneName");
        let areas = this.filters.find(f => f.field === "areaId");
        let locations = this.filters.find(f => f.field === "locationName");
        return zones && zones.optionsLoaded && areas && areas.optionsLoaded && location && locations.optionsLoaded;
      }
	},
  beforeMount() {
    this.getColumnDefs();
    this.getActionBtns();
  },
  async mounted() {
      if(this.currentSite && this.currentSite.id) {
        if (this.currentSite.isAf3) {
          this.pagination = {
            size: pageSizeAF3,
            page: 1
          },
          this.mapPagination = {
            size: pageSizeAF3,
            page: 1
          }
        }
        await this.setResetTags(true);
        if(!emptyAssetsSites.includes(this.currentSite.id)){
          await this.initTags(this.currentSite.id);
          this.hideTags = false;
        }else{
          this.setTags([]);
          this.setFilteredTotal(0);
          this.hideTags = true;
        }
        this.fetchFilters();
        this.setLabels(this.currentSite);
      }
      this.setMoreActionsSIAB(this.getIsMobileIpadPortrait);
  },
  
  methods: {
    ...mapActions('area', ['setCurrentArea', 'getAreas']),
    ...mapActions('site', ['getSites']),
    ...mapActions('tag', ['getTags', 'getTagsFilters', 'clearFilters', 'deleteTag', 'exportAllTags']),
    ...mapActions('header', ['toggleMapVisible']),
    ...mapActions('zone', ['getZones']),
    ...mapActions('location', ['getLocationsBySite']),
    ...mapActions('supertag', ['setSupertagForSettings']),
    ...mapMutations('tag', ['setResetTags', 'clearMapTags', 'setAreaFilters', 'setLocationFilters', 'setZoneFilters', 'setTags', 'setFilteredTotal']),
    ...mapMutations('area', ['resetCurrentArea', 'clearArea']),

    getActionBtns(){
      //check user role (Admin SiteUser or Admin OrgUser or SuperAdmin)
      if((this.orgUserRole && (this.orgUserRole.assetInfo.metadata.props.role === ROLES.ADMIN || this.orgUserRole.assetInfo.metadata.props.role === ROLES.SUPER_ADMIN))
       || (this.siteUserRole && this.siteUserRole.assetInfo.metadata.props.Admin === 'true')){
         if(!this.addGroupCategoryBtns.find( item => item.reference === 'editLabels')){
            this.addGroupCategoryBtns.splice(1, 0, {
                name: this.$i18n.t('edit-site-labels'),
                reference: 'editLabels',
                fn: this.editLabels,
                icon: 'label-outline'
            });
         }
      } else {
        const item = this.addGroupCategoryBtns.find( item => item.reference === 'editLabels');
        if(item){
          const index = this.addGroupCategoryBtns.indexOf(item);
          this.addGroupCategoryBtns.splice(index, 1);
        }
      }
    },

    getColumnDefs(){
      //define columns, TODO this can be loaded dynamically from JSON since it will come from a service in the future
      this.columnDefs = [
        {
          name: this.$i18n.t('assets-column-name'),
          field: "name",
          type: "data",
          width: "15%"
        },
        { 
          name: this.$i18n.t('assets-column-area'), 
          field: "areaName", 
          type: "data"
        }, 
        { 
          name: this.$i18n.t('assets-column-zone'), 
          field: "zoneName",
          type: "data"
        },
        { 
          name: this.$i18n.t('assets-column-last-event'), 
          field: "lastEventTime",
          type: "render",
          cellRenderer: LastEventCellComponent
        },
        { 
          name: this.$i18n.t('assets-column-category'), 
          field: "categoryName",
          type: "data"
        },
        { 
          name: this.$i18n.t('assets-column-group'), 
          field: "groupName",
          type: "data"
        },
        { 
          name: this.$i18n.t('assets-column-field1'), 
          field: "field1",
          type: "data"
        },
        { 
          name: this.$i18n.t('assets-column-field2'), 
          field: "field2",
          type: "data"
        },
        {
          name: this.$i18n.t('assets-column-battery'),
          field: "batteryStatus",
          type: "render",
          cellRenderer: BatteryLevelComponent
        }
      ];
      if(!this.currentSite.isAf3){
        this.columnDefs.splice(3, 0,  { 
          name: this.$i18n.t('assets-column-location'), 
          field: "locationName",
          type: "render",
          cellRenderer: LocationBeaconCellComponent
        });
      }
      if(gmapSites.includes(this.currentSite.id)){
        this.columnDefs.splice(this.columnDefs.length - 1, 0,  { 
          name: this.$i18n.t('assets-column-gmap'), 
          type: "gmap",
          field: 'gmap',//it is for the header class used on the column order and size
          latField: "latitude",
          lngField: "longitude"
        });
      }
      if(localStorage.getItem('tableWidthassets') && (JSON.parse(localStorage.getItem('tableWidthassets')).length !== this.columnDefs.length)){
        localStorage.removeItem('tableWidthassets');
      }
    },
    async setAf3AreaFilter() {
      if (!this.$refs.filterFormRef.filterString.includes('areaId')) {
        try {
          let firstTagWithArea = null;
          for (let index = 0; index < this.tags.length; index++) {
            if (this.tags[index].areaName && this.tags[index].xCoordinate != AF3_INVALID_COORDINATES.VALUE) {
              firstTagWithArea = this.tags[index];
              break;
            }
          }
          if (!firstTagWithArea) {
            firstTagWithArea = this.tags[0];
          }
          if (firstTagWithArea) {
            this.$refs.filterFormRef.filterForm.areaId = firstTagWithArea.area.id;
            this.$refs.filterFormRef.filterString += '&areaId=eq:' + firstTagWithArea.area.id;
            await this.applyFilters({filterForm: this.$refs.filterFormRef.filterForm, filterString: this.$refs.filterFormRef.filterString});
          }
          this.getMapVisible = true;
        } catch (error) {
          this.$refs.filterFormRef.menu = false;
          this.getMapVisible = true;
        }
      } else {
        this.getMapVisible = true;
      }
    },
    goToMap() {
      if (this.currentSite.isAf3 && this.tags[0] && this.tags[0].areaName) {
        this.setAf3AreaFilter();
      } else {
        this.getMapVisible = true;
      }
    },
    async loadAllTags(){
      await this.initTags(this.currentSite.id);
      this.fetchFilters();
      this.hideTags = false;
    },
    createDevice() {
      this.createEditMode = 'create';
      this.$refs.newEditDeviceModal.openModal();
    },
    setMoreActionsSIAB(isSIAB) {
      if (isSIAB) {
        this.settings.moreActions = [
          {
            name: this.$i18n.t('assets-open-map'),
            fn: this.openMap,
            enabledIf: ['latitude', 'longitude'],
            icon: 'map-marker-radius'
          },
          {
            name: this.$i18n.t('table-edit'),
            fn: this.editDevice,
            icon: 'pen'
          }
        ]
      } else {
        this.settings.moreActions = [
          {
            name: this.$i18n.t('table-edit'),
            fn: this.editDevice,
            icon: 'pen'
          },
          {
            name: this.$i18n.t('sidebar-supertag-settings'),
            fn: this.openSTSettings,
            icon: 'cog',
            condition: { 
              field: 'appTok',
              operator: 'CONTAINS',
              value: this.supertagToken
            }
          },
          {
            name: this.$i18n.t('table-delete'),
            fn: this.delete,
            icon: 'delete'
          }
        ]
      }
    },
    searchTyped(text) {
      this.searchTerm = text;
    },
    importDevice(){
      this.$refs.importDeviceModal.openModal();
    },
    editDevice(asset) {
      this.createEditMode = 'edit';
      this.$refs.newEditDeviceModal.openModal(asset);
    },
    delete(asset) {      
      this.deviceToDelete = asset;
      this.confirmationDeleteDialog = true;
    },
    openSTSettings(tag){
      this.setSupertagForSettings(tag);
      this.$router.push('/system/settings');
    },
    openMap(asset){
      this.showSingleTag = [asset];
      this.getMapVisible = true;
    },
    async deleteSelectedAssets(assets) {
      let promises = [];
      try {
        assets.forEach(asset => {
          let device = {
            nodeAddress: asset.id,
            siteId: asset.site.id
          };
          promises.push(this.deleteTag({ device }));
        });
        let resp = await Promise.all(promises);
        this.$toasted.show(resp.length + ' ' + this.$t('devices-page-devices-deleted'), { 
          position: "bottom-right",
          className: ['toast-success'], 
          action : {
              text : this.$t('devices-page-ok'),
              onClick : (e, toastObject) => {
                  toastObject.goAway(0);
              }
            },
        });
        this.refreshTags();
      } catch (error) {
        this.$toasted.show(error, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
        this.refreshTags();
      }
    },
    async confirmDelete() {
      let device = {
        nodeAddress: this.deviceToDelete.id,
        siteId: this.currentSite.id
      };
      try {
        let resp = await this.deleteTag({ device });
        this.$toasted.show(this.$t('devices-page-device-deleted'), { 
          position: "bottom-right",
          className: ['toast-success'], 
          duration : 1500
        });
        this.confirmationDeleteDialog = false;
        this.refreshTags();
      } catch (error) {
        this.$toasted.show(error, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
        this.confirmationDeleteDialog = false;
        this.refreshTags();
      }
    },  
    setLabels(site) {
      let labels = site?.assetInfo?.metadata?.props?.labels;
      if (labels) {
        this.columnDefs.map((col) => {
          switch (col.field) {
            case 'name':
              col.name = labels.tag;
              break;
            case 'categoryName':
              col.name = labels.category;
              break;
            case 'groupName':
              col.name = labels.group;
              break;
            case 'field1':
              col.name = labels.field1;
              break;
            case 'field2':
              col.name = labels.field2;
              break;
            default:
              break;
          }
        })
        this.addGroupCategoryBtns.map((btn) => {
          switch (btn.reference) {
            case 'addGroup':
              btn.name = this.$i18n.t('add') + ' ' + labels.group;
              break;
            case 'editGroup':
              btn.name = this.$i18n.t('edit') + ' ' + labels.group;
              break;
            case 'deleteGroup':
              btn.name = this.$i18n.t('delete') + ' ' + labels.group;
              break;
            case 'addCategory':
              btn.name = this.$i18n.t('add') + ' ' + labels.category;
              break;
            case 'editCategory':
              btn.name = this.$i18n.t('edit') + ' ' + labels.category;
              break;
            case 'deleteCategory':
              btn.name = this.$i18n.t('delete') + ' ' + labels.category;
              break;
            default:
              break;
          }
        })        
      }
    },
    refreshTags() {  
      this.reloadTags(this.currentSite.id, true);
    },
    onSorting(sorting){
      this.newSorting = true;
      this.sorting = sorting;
      this.reloadTags(this.currentSite.id);
    },
    saveFilterToFav(newFilter) {
      // adds a filter to filters array
      let filter = this.favFilters.filter( f => f.id === newFilter.id );
      if(!filter.length){
        this.$set(this.favFilters, this.favFilters.length, newFilter);
        //call endpoint to save the new filter
      }else{
        Object.assign(filter[0], newFilter);
        //call endpoint to update the filter
      }
    },
    applyFavFilter(filter) {
      //load the filter form
      this.activeFilter = filter;
      //call endpoint to get the filterd data
    },
    deleteFavFilter(id) {
      // removes a filter from filters array
      this.favFilters = this.favFilters.filter( filter => filter.id !== id );      
    },
    async applyFilters(filter) {
      if(filter.filterForm && filter.filterForm.areaId){
        await this.setCurrentArea({areaId: filter.filterForm.areaId});
        if(this.currentArea.assetInfo && this.currentArea.assetInfo.metadata.props.areaLocation.toLowerCase() === 'indoor'){
          this.noPagination = true;
        }else{
          this.noPagination = false;
        }
      }else{   
        //reset it just if previous filter has setted it
        if(this.filterString.includes('areaId')){
          await this.resetCurrentArea();
        }
      }
      this.noGeoJsonCall = false;
      this.searchText = '';
      this.filterString = filter.filterString;
      this.resetPagination();
      await this.setResetTags(true); //reset grid and list and store the first page for the filtered data
      await this.reloadTags(this.currentSite.id);
      this.hideTags = false;
      if(this.filterString){
        this.filterApplied = true;
      }else{
        if(!this.searchText){
          this.filterApplied = false;
        }
      }
    },
    deselectFavFilter(filterId){
      let filter = this.favFilters.filter( f => f.id === filterId);
      filter[0].selected = false;
      this.activeFilter = null;
      this.$refs.favFilters.deselectFilter();
    },
    async searchBarFilter(text){
      await this.setResetTags(true); //reset grid and list and store the first page for the filtered data
      this.filterString = '';
      if(text){
        this.searchText = '&search='+ text;
        (!this.getIsMobileIpadPortrait) ? this.$refs.filterFormRef.applyFilters() : this.applyFilters({filterString: this.searchText});
        this.filterApplied = true;
      } else {
        this.searchText = '';
        if(!this.getIsMobileIpadPortrait){
          this.$refs.filterFormRef.searchTerm = '';
          this.$refs.filterFormRef.applyFilters();
        }else{
          this.applyFilters({filterString: this.searchText});
        }
      }
    },
    async onPaginationChange(newPagination) {
      if(newPagination.pageSize !== this.pagination.size){
        this.mapPagination.page = 1;
        this.mapPagination.size = newPagination.pageSize;
        this.setResetTags(true);// we need to reset and load page 1 with the new page size
      }
      this.pagination.page = newPagination.page;
      this.pagination.size = newPagination.pageSize;      
      const tags = await this.reloadTags(this.currentSite.id);
    },
    resetPagination() {
      Object.assign(this.pagination, {
        size: this.pagination.size,
        page: 1
      });
      Object.assign(this.mapPagination, {
        size: this.mapPagination.size,
        page: 1
      });
      this.clearMapTags();
    },
    resetFilter() {
      this.filterString = '';
      this.cleanForm = true;
      this.searchText = "";
      this.filterApplied = false;
      this.cleanText = true;
      this.searchTerm = "";
    },
    clearSearchClicked() {
      this.resetFilter();
      if(!this.getIsMobileIpadPortrait){
        this.$refs.filterFormRef.resetSearch();
      }
    },
    async initTags(siteId) {
      this.resetPagination();
      this.resetFilter();
      try{
        // TODO ADD RESET SORT
        const tags = await this.reloadTags(siteId);
        this.cleanText = false;
        this.cleanForm = false;
        return tags;
      }catch(error){
        this.$toasted.show(error, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
        return [];
      }
    },
    async loadMoreTags(pagination){
        this.mapPagination.page = pagination.page;
        await this.reloadTags(this.currentSite.id);
    },
    async reloadTags(siteId, refresh) {
      let params = {
        siteId: siteId,
        refresh: refresh
      }
      //if the user is on Map view, use map pagination
      if(this.getMapVisible && !refresh){//if refresh we need to get tags from grid and list
        params.fromMap = true;
        params.pagination = this.mapPagination;
      }else{ //add the map pagination to get the list tags
        params.pagination = this.pagination;
        params.mapPagination = this.mapPagination;
      }
      if (this.filterString) {
        params.filters = this.filterString;
      }
      if (this.sorting) {
        params.sorting = this.sorting;
        if(this.newSorting){
          params.newSorting = true;
        }
      }
      if(this.searchText){
        params.filters = (params.filters) ? params.filters + this.searchText : this.searchText; 
      }
      if(this.currentArea && this.currentArea.assetInfo && this.currentArea.assetInfo.metadata.props.areaLocation.toLowerCase() === 'indoor'){
        if(this.getResetTags){
          params.indoor = true;
        }
      }
      let tags = await this.getTags(params);
      if(this.newSorting){
        this.newSorting = false;
        this.mapPagination.page = 1;
      }
      return tags;
    },
    async fetchSites() {
      const sites = await this.getSites();
    },
    async fetchFilters() {
      await this.clearFilters();
      this.getTagsFilters({ siteId: this.currentSite.id });
        let areasPromise = this.getAreas({siteId: this.currentSite.id, hiddenLoader: true});
        let zonesPromise = this.getZones({siteId: this.currentSite.id, hiddenLoader: true});
        let locationsPromise = this.getLocationsBySite({ siteId: this.currentSite.id, hiddenLoader: true});
      try {
        this.setAreaFilters(await areasPromise);
      } catch (error) {
        console.error(error);  
      }
      try {
        this.setZoneFilters(await zonesPromise);
      } catch (error) {
        console.error(error);  
      }
      try {
        this.setLocationFilters(await locationsPromise);
      } catch (error) {
        console.error(error);  
      }
    },
    editLabels(){
      this.$refs.siteLabelEditModal.openModal(this.currentSite);
    },
    addCategory() {
      this.$refs.newEditCategoryModal.openModal('create');
    },
    editCategory() {
      this.$refs.newEditCategoryModal.openModal('edit');
    },
    deleteCategory() {
      this.$refs.newEditCategoryModal.openModal('delete');
    },
    addGroup() {
      this.$refs.newEditGroupModal.openModal('create');
    },
    editGroup() {
      this.$refs.newEditGroupModal.openModal('edit');
    },
    deleteGroup() {
      this.$refs.newEditGroupModal.openModal('delete');
    },
    downloadCsv(assets) {
      let normalizedAssets = assets.map((asset)=> new AssetModel().normalizeForCsv(asset, this.columnDefs));
      if (normalizedAssets) {
        csvMixin.methods.csvExport(normalizedAssets, 'Assets');
      }
    },
    async exportAll(){
      const filters = this.filterString + this.searchText;
      const siteId = this.currentSite.id;
      const file = await this.exportAllTags({ siteId: siteId, filters: filters});
      const transformedData = csvMixin.methods.removeCol(file.data, 'Battery');
      csvMixin.methods.downloadFile('AllAssets', transformedData);
    }
  }
};
</script>

<style lang="scss" scoped>
  .btn-toggle .v-btn {
    background-color: #fff !important;
    color:var(--v-secondary-base) !important;
  }
  .btn-toggle .v-btn.v-item--active {
    color: #ffffff !important;
    background-color: var(--v-secondary-base) !important;
    .v-icon {
      color: #ffffff !important;
    }
  }
  .show-map-btn.theme--dark.v-btn.v-btn--disabled{
    background-color: lightgray!important;
    span {
      color: #f2f2f2!important;
    }
  }
  .pull-up{
    position: absolute;
    margin-left: 20px;
    z-index: 999;
  }
  .total-text{
    font-size: 0.85rem;
    width: auto;
    float: left;
    margin-top: 9px;
  }
  .right-btn-container {
    height: 100%;
    float: right;
  }
    // dialogs
  .headline {
    height: 48px;
    font-size: 18px !important;
    font-weight: 600;
    color: #3B5762;
  }

  .action-popup-group-category {
    width: 62px;
    margin: 0px;
    button {
      width: 100% !important;
    }
  }

  .only-search{
    max-width: 90%;
    flex: 0 0 90%;
  }

  .filter-height{
    height: 50px;
  }

  .relative-position{
    position: relative;
  }

  .no-sites-msg{
    position: absolute;
    right: 0;
    height: 100%;
    width: 100%;
    z-index: 99;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  //media queries
  @media (max-width: 1365px) {
    .total-text {
      display: none;
    }
  }

  // IE styles
  @media all and (-ms-high-contrast:none) {
    .right-btn-container {
      padding-top: 2px;
    } 
  }
</style>