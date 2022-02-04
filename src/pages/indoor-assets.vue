<template>
  <div id="assets">
    <v-row>
      <v-col ref="card" class="custom-card px-0 pa-0" v-bind:class="{ 'card-no-footer-height': getMapVisible }">
        <v-row class="mb-3" style="height: 40px;">
            <!-- search bar -->
            <search-bar v-if="!getIsMobileIpadPortrait || (getIsMobileIpadPortrait && !getMapVisible)" @onSearchBarKeyUp="searchTyped" :searchText="searchTerm" @searchText="searchBarFilter" :cleanText="cleanText" v-bind:class="{'only-search': getIsMobileIpadPortrait}"/>
            <v-col cols="8" v-bind:class="{'col-12': getIsMobileIpadPortrait && getMapVisible}">
              <div class="d-none d-sm-inline float-left">
                <filter-form
                  v-if="getIsMobileIpadPortrait === false"
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
                <div v-if="filterApplied" class="primary--text total-text">
                  <b>{{filteredTotalRows}}</b>
                  <span> ({{ Math.round((filteredTotalRows * 100)/totalRows)}}%)</span>
                  {{$t('assets-page-of')}} {{ totalRows }} {{$t('assets-page-match-filter')}}
                </div>
                <div v-if="!filterApplied" class="primary--text total-text">
                  <b>{{ totalRows }}</b> {{$t('assets-page-assets-total')}}
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
              <v-btn v-if="getIsMobileIpadPortrait === false" @click="getMapVisible = true" depressed small class="show-map-btn">
                <v-icon color="secondary" small class="mr-1">mdi-map</v-icon>
                <span class="toggle-map-list-label"> {{ $t('btn-header-option2') }} </span>
              </v-btn>
            </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row  v-if="getIsMobileIpadPortrait === false">
          <v-col cols="12" class="filter-height">
            <div class="d-none d-sm-inline">
              <filters-saved
                ref="favFilters"
                :width="filtersWidth"
                :filters="favFilters"
                @applyFilter="applyFavFilter"
                @deleteFilter="deleteFavFilter"
              ></filters-saved>
            </div>
            <div class="mr-3 right-btn-container">
              <v-btn v-if="getWindowWidth > iphone" id="import-asset" min-width="50" height="32" @click="importDevice" :depressed="true" class="primary--text font-weight-bold mr-3 d-none d-sm-inline" v-bind:class="{'px-0': (sm > getWindowWidth)}" color="primaryLight">
                <v-icon v-if="sm >= getWindowWidth"> mdi-import </v-icon>
                <span v-if="sm < getWindowWidth">{{$t('assets-page-import-device')}}</span>
              </v-btn>
              <v-btn id="add-asset" min-width="50" height="32" @click="createDevice" :depressed="true" class="primary--text font-weight-bold" v-bind:class="{'px-0': (sm > getWindowWidth)}" color="primaryLight">
                <v-icon v-if="sm >= getWindowWidth"> mdi-plus </v-icon>
                <span v-if="sm < getWindowWidth">{{$t('assets-page-add-device')}}</span>
              </v-btn>
              <v-btn height="32" width="50" min-width="50" :depressed="true" class="primary--text font-weight-bold ml-3 p-0 action-popup-group-category" color="primaryLight">
                <actions-popup-component :closeDelay="'150'" :iconColor="'var(--v-primary-base)'" :actions="addGroupCategoryBtns"/>
              </v-btn>
            </div>
          </v-col>
        </v-row>
        <!-- Grid component -->
        <template v-if="!getMapVisible">
          <DataTable
            :settings="settings"
            :columns="columnDefs"
            :rows="tags"
            :resizeRef="$refs.card"
            :totalRows="filteredTotalRows"
            :page="pagination.page"
            :pageSize="pagination.size"
            :confirmDeleteModalBody="'delete-asset-selection'"
            :confirmDeleteModalTitle="'delete-asset-selection-title'"
            :customTbodyClass="getIsMobileIpadPortrait ? 'withoutFilters' : 'withFilters'"
            @onPaginationChange="onPaginationChange"
            @onSort="onSorting"
            @onDeleteSelection="deleteSelectedAssets"
            @onExport="downloadCsv"
          ></DataTable>
        </template>
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
            :mapLocations="locations"
            @loadMore="loadMoreTags">
        </list-map-view>
      </v-col>
    </v-row>
    <import-device-modal @finished="refreshTags" ref="importDeviceModal"/>
    <new-edit-device-modal @finished="refreshTags" :modalMode="createEditMode" ref="newEditDeviceModal"/>
    <new-edit-category-modal @finished="refreshTags" :modalMode="createEditMode" ref="newEditCategoryModal"/>
    <new-edit-group-modal @finished="refreshTags" :modalMode="createEditMode" ref="newEditGroupModal"/>
    <v-dialog v-model="confirmationDeleteDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">{{$t('devices-page-delete-device')}}</v-card-title>
        <v-card-text v-if="deviceToDelete" class="mt-3">{{$t('delete-are-you-sure', { name: deviceToDelete.name})}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn height="32" text color="secondary" @click="confirmationDeleteDialog = false; deviceToDelete = null" class="primary--text font-weight-bold">{{$t('cancel')}}</v-btn>
          <v-btn depressed color="secondary" @click="confirmDelete" class="px-8 float-right">{{$t('yes')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>

import { mapActions, mapGetters, mapMutations } from 'vuex'
import ListMapView from "../components/assets-map-view/indoor-assets-map-view"
import SearchBar from "../components/search-bar/search-bar"
import constants from '../constants/resolutions-constants'
import { pageSize } from '../constants/pagination'
import { csvMixin } from "../mixins/csvExport"
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
import AvailabiltyComponent from "../components/shared/data-table/custom-cells/availability-preview"
import ActionsPopupComponent from "../components/shared/data-table/custom-cells/actions-popup"

export default {
  name: "Assets",
  components: {
    DataTable,
    FilterForm,
    FiltersSaved,
    AvailabiltyComponent,
    BatteryLevelComponent,
    LocationBeaconCellComponent,
    ActionsPopupComponent,
    ImportDeviceModal,
    NewEditDeviceModal,
    NewEditGroupModal,
    NewEditCategoryModal,
    ListMapView,
    SearchBar
  },
  data() {
    return {
      columnDefs: null,
      favFilters: [],
      activeFilter: null,
      sm: constants.IPAD_PORTRAIT,
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
      searchText: '',
      isLoading: false,
      showSingleTag: null,
      cleanForm: false,
      cleanText: false,
      searchTerm: '',
      filterApplied: false,
      getMapVisible: false,
      toggleOption: this.getMapVisible ? 1 : 0
    };
  },
  mixins: [csvMixin],
  watch: {
    async currentSite(newSite, oldSite) {
      this.resetCurrentArea();
      this.cleanForm = true;
      this.setLabels(newSite);
      await this.setResetTags('true');
      await this.initTags(newSite.id);
      this.fetchFilters();
      this.favFilters = [];
    },
    getIsMobileIpadPortrait: function (value) {
      this.setMoreActionsSIAB(value);
    }
  },
  computed: {
      ...mapGetters('tag', ['tags', 'populatedTags', 'totalRows', 'filteredTotalRows', 'filters', 'getResetTags']),
      ...mapGetters('area', ['areas', 'currentArea']),
      ...mapGetters('site', ['currentSite']),
      ...mapGetters('location', ['locations']),
      ...mapGetters('organization', ['getIsIndividualUser']),
      ...mapGetters('layout', ['getWindowWidth', 'getIsMobileIpadPortrait', 'isSidebarMini']),
      filtersWidth: function (){
        return this.isSidebarMini ? (this.getWindowWidth < this.iphone) ? this.getWindowWidth - 330 : (this.sm >= this.getWindowWidth) ? this.getWindowWidth - 380 : this.getWindowWidth - 562 : this.getWindowWidth - 735
      }
	},
  async mounted() {
      if(this.currentSite && this.currentSite.id) {
        await this.setResetTags(true);
        await this.initTags(this.currentSite.id);
        this.fetchFilters();
        this.setLabels(this.currentSite);
      }
      this.setMoreActionsSIAB(this.getIsMobileIpadPortrait);
  },
  beforeMount() {
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
        name: this.$i18n.t('assets-column-location'), 
        field: "locationName",
        type: "render",
        cellRenderer: LocationBeaconCellComponent
      },
      {
        name: this.$i18n.t('assets-column-last-event'),
        field: "lastEventTime",
        type: "date",
        format: 'M/D/YYYY hh:mm A'
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
  },

  methods: {
    ...mapActions('area', ['setCurrentArea']),
    ...mapActions('site', ['getSites']),
    ...mapActions('tag', ['getTags', 'getTagsFilters', 'deleteTag', 'exportAllTags']),
    ...mapActions('header', ['toggleMapVisible']),
    ...mapMutations('tag', ['setResetTags', 'clearMapTags']),
    ...mapMutations('area', ['resetCurrentArea']),

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
      this.reloadTags(this.currentSite.id);
    },
    onSorting(sorting){
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
      if(filter.filterForm.areaName){
        await this.setCurrentArea({areaName: filter.filterForm.areaName});
        if(this.currentArea.assetInfo && this.currentArea.assetInfo.metadata.props.areaLocation.toLowerCase() === 'indoor'){
          this.noPagination = true;
        }else{
          this.noPagination = false;
        }
      }else{
        await this.resetCurrentArea();
      }
      this.searchText = '';
      this.filterString = filter.filterString;
      this.resetPagination();
      await this.setResetTags(true); //reset grid and list and store the first page for the filtered data
      const tags = await this.reloadTags(this.currentSite.id);
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
        this.$refs.filterFormRef.applyFilters();
        this.filterApplied = true;
      } else {
        this.searchText = '';
        this.$refs.filterFormRef.searchTerm = '';
        this.$refs.filterFormRef.applyFilters();
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
    async loadMoreTags(){
      if(!this.isLoading && this.filteredTotalRows > this.populatedTags.length){
        this.isLoading = true;
        this.mapPagination.page++;
        await this.reloadTags(this.currentSite.id);
        this.isLoading = false;
      }
    },
    async reloadTags(siteId) {
      let params = {
        siteId
      }
      //if the user is on Map view, use map pagination
      if(this.getMapVisible){
        params.fromMap = true;
        params.pagination = this.mapPagination;
      }else{
        params.pagination = this.pagination;
      }
      if (this.filterString) {
        params.filters = this.filterString;
      }
      if (this.sorting) {
        params.sorting = this.sorting;
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
      return tags;
    },
    async fetchSites() {
      const sites = await this.getSites();
    },
    fetchFilters() {
      this.getTagsFilters({ siteId: this.currentSite.id });
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
      let filters = this.filterString + this.searchText;
      let siteId = this.currentSite.id;
      let file = await this.exportAllTags({ siteId: siteId, filters: filters});
      csvMixin.methods.downloadFile('AllAssets', file.data);
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
 
  //media queries
  @media (max-width: 812px) {
    .right-btn-container {
      margin-left: 13px;
    }
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