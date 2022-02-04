<template>
  <v-row class="mx-0 pb-3">
    <v-col id="assets-map">
      <v-divider v-if="!onlyMap" class="assets-divider" />
      <v-row no-gutters>
        <v-col v-if="!onlyMap" cols="12"  class="assets-list" v-bind:class="{ 'no-rows': !locationFilteredTags.length, 'col-sm-3 col-md-3': (getWindowWidth > sm)  }" ref="panelsContainer">
          <p v-if="!locationFilteredTags.length && !this.simpleTag.length">
            {{ $t('table-no-rows') }}
          </p>
          <v-expansion-panels accordion focusable hover v-model="highlightTagIndex" ref="panels">
            <v-expansion-panel
              :ref="'tag-index-'+index"
              v-for="(item, index) in (simpleTag.length === 1 ? simpleTag : locationFilteredTags)"
              :key="item.name + index"
              class="p-1 assets-item"
              @click="onTagSelected(item, true)"
            >
              <v-expansion-panel-header>
                <template>
                  <div class="item-container">
                    <div class="ag-body-viewport name-label">
                      <v-img
                        v-if="!isIndoor(item) && !stInIndoor(item)"
                        class="float-left mr-2"
                        :src="tagIcons[item.source.toLowerCase()]"
                        height="16"
                        width="10"
                        :title="$t('assets-is-supertag')"
                      ></v-img>
                      <v-icon
                        small
                        v-if="isIndoor(item)"
                        v-text="'mdi-office-building-marker'"
                        :title="$t('assets-is-indoor')"
                      ></v-icon>
                      <v-icon
                        small
                        v-if="stInIndoor(item)"
                        :title="$t('assets-st-into-tag')"
                        v-text="'mdi-map-marker-off'"
                      ></v-icon>
                      {{ item.name }}
                    </div>
                    <div class="icons-cont">
                      <NotSeenInDaysComponent :params="item" :showBatteryOnly="true"/>
                      <img
                        class="battery-img mt-1 mr-1"
                        v-if="item.batteryStatus !== null && item.batteryStatus !== undefined"
                        :src="getBatteryIcon(item)"
                      />
                      <span class="mr-1" v-else>-- --</span>
                      <!-- HISTORY PLAY BUTTON START -->
                        <button v-if="item.showPlayBtn" @click="onPlayHistory($event)">
                          <v-icon v-if="showPlayButton" color="secondary" size="20">mdi-play-circle</v-icon>
                          <v-icon v-if="!showPlayButton" size="20">mdi-pause-circle</v-icon>
                        </button>
                      <!-- HISTORY PLAY BUTTON END -->
                      <v-btn class="actions ml-1" icon @click="onActionClick($event)">
                        <ActionsPopupComponent :actions="actions" :row="item"/>
                      </v-btn>
                    </div>

                    <div class="mt-2 ag-body-viewport float-right w-100">
                      <div class="last-seen ag-body-viewport">
                        <span v-if="item.lastEventTime">{{ item.lastEventTime | moment('M/D/YYYY hh:mm A') }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <div class="item-content">
                      <div class="font-weight-bold pt-3">{{ $t('assets-column-macaddr') }}</div>
                      <div class="big-text">{{ item.macAddress ? item.macAddress : '-- --' }}</div>
                      <div class="font-weight-bold mt-2">{{ currentSiteLabels.category }}</div>
                      <div class="big-text">{{ item.categoryName ? item.categoryName : '-- --' }}</div>
                      <div class="font-weight-bold mt-2">{{ $t('area-name') }}</div>
                      <div class="big-text">{{ item.areaName ? item.areaName : '-- --' }}</div>
                      <span v-if="currentSite.isAf3 && (item.xCoordinate || item.yCoordinate || item.zCoordinate)">
                        <div class="mt-2 font-weight-bold">X, Y & Z</div>
                        <div class="big-text">
                          X: {{ item.xCoordinate ? tagXYZ(item.xCoordinate) : '--' }} <br> 
                          Y: {{ item.yCoordinate ? tagXYZ(item.yCoordinate) : '--' }} <br> 
                          Z: {{ item.zCoordinate ? tagXYZ(item.zCoordinate) : '--' }}
                        </div>
                      </span>
                      <div class="mt-2">{{ $t('assets-column-zone') }}</div>
                      <div class="big-text">{{ item.zoneName ? item.zoneName : '-- --' }}</div>
                      <div class="mt-2">{{ currentSiteLabels.group }}</div>
                      <div class="big-text">{{ item.groupName ? item.groupName : '-- --' }}</div>
                      <div class="mt-2">{{ currentSiteLabels.field1 }}</div>
                      <div class="big-text">{{ item.field1 ? item.field1 : '-- --' }}</div>
                      <div class="mt-2">{{ currentSiteLabels.field2 }}</div>
                      <div class="big-text">{{ item.field2 ? item.field2 : '-- --' }}</div>
                      <v-btn
                        v-if="item.latitude && item.longitude && isGeoReferenced"
                        id="view-history"
                        color="secondary" 
                        @click="onViewHistory"
                        class="w-100 mt-4"
                        :disabled="showHistoryBar"
                      >
                        {{$t('assets-view-history')}}
                      </v-btn>
                    </div>
                </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-row id="pagination" justify="center" ref="pager">
            <div v-show="locationFilteredTags.length">
              <div class="viewing float-left">
                <span class="font-weight-bold">{{getViewingOf}}&nbsp;</span>
                <span>{{$t('pagination-viewing-of')}}&nbsp;</span> 
                <span class="font-weight-bold">{{totalRows}}</span>
              </div>
              <v-btn id="prev" x-small text color="secondary" @click="paginationChange(mapPagination.page -1)" class="float-left" :disabled="mapPagination.page === 1 ? true : false">
                  <v-icon dark>mdi-chevron-left</v-icon>
              </v-btn>
              <span class="float-left currentPage">{{mapPagination.page}}</span>
              <v-btn id="next" x-small text color="secondary" class="float-left" @click="paginationChange(mapPagination.page +1)" v-bind:disabled="mapPagination.page === pageCount ? true : false">
                  <v-icon dark>mdi-chevron-right</v-icon>
              </v-btn>
              <div class=" float-right pt-0 goto">
                <v-text-field
                  id="goto-page"
                  v-model="goToPage"
                  :label="$t('pagination-go-to-page')"
                  outlined
                  type="number"
                  :dense="true"
                  v-on:keyup.enter="onGoToPage"
                  color="secondary"
                ></v-text-field>
              </div>
            </div>
          </v-row>
        </v-col>
        <v-col :cols="onlyMap ? 12 : 9" class="assets-map" :style="styles" v-bind:class="{ 'col-12 order-first': (getWindowWidth <= sm)  }">

          <mapGL v-if="!isGeoReferenced"
            key="indoor-map"
            styleType='clear'
            :options="indoorMapOptions"
            :accessToken="'VUE_APP_MAPBOX_ACCESS_TOKEN'"
            :readOnly="readOnly"
            @onLoad="onLoad">
            <MapGrid
              ref="mapGrid"
              v-if="areaFileMapping && currentSite && currentSite.isAf3"
              :areaFileMapping="areaFileMapping"
              :showHideLocationsTool="true"
              :draggable="true"
              :map="map"
              :mapLoaded="af3MapLoaded"
              :selectedFloor="currentArea.id"
              :showHideBoundedErrorTool="true"
              @onMeasuringToolChange="onMeasurementChange"
              @onMeasurementChange="handleOnMeasureUnitChange"
              @onShowHideLocationsChange="handleOnShowHideLocationsChange"
            />
          </mapGL>

          <mapGL v-if="isGeoReferenced"
            key="outdoor-map"
            styleType='default'
            :options="outdoorMapOptions"
            :accessToken="'VUE_APP_SUPERTAG_MAPBOX_ACCESS_TOKEN'"
            :readOnly="readOnly"
            showScale= true
            @onLoad="onLoad">

            <!-- DATE BAR START -->
            <map-history-bar
              v-if="showHistoryBar"
              :map="map"
              :tag="selectedTag"
              :playHistory="playHistory"
              :area="historyTagArea"
              @showHistoryPlayBtn="showHistoryPlayBtn"
              @playHistoryFinished="showPlayButton = true"
              @onSubmit="onHistorySubmit"
              @onCancel="onHistoryCancel"
            >
            </map-history-bar>
            <!-- DATE BAR END -->
          </mapGL>
          <div class="float-right mr-3" v-if="filters.includes('areaId') && mapData.length > 0 && currentSite.isAf3">
            <v-btn
              id="refresh"
              height="32"
              :depressed="true"
              @click="refreshMapTags"
              class="mt-2 primary--text font-weight-bold"
              color="primaryLight"
              >{{ $t('assets-st-refresh') }}
            </v-btn>
          </div>
          <!-- SUPER TAG LEGEND START -->
          <div class="legend-container" v-if="isGeoReferenced">
            <div class="supertag-legend">
              <div class="d-flex legend-item">
                <img class="legend-icon" :src="tagIcons.beacon">
                <span class="legend-title">{{ $t('assets-map-location')}}</span>
              </div>
              <div class="d-flex legend-item">
                <img class="legend-icon" :src="tagIcons.gps">
                <span class="legend-title">{{ $t('assets-map-gps')}}</span>
              </div>
              <div class="d-flex legend-item">
                <img class="legend-icon" :src="tagIcons.wifi">  
                <span class="legend-title">{{ $t('assets-map-wifi')}}</span>
              </div>
              <div class="d-flex legend-item">
                <img class="legend-icon" :src="tagIcons.cellid">
                <span class="legend-title">{{ $t('assets-map-cell')}}</span>
              </div>
              <div class="d-flex legend-item" v-if="showHistoryBar">
                <img class="legend-icon" :src="tagIcons.heartbeat">
                <span class="legend-title">{{ $t('assets-map-heartbeat')}}</span>
              </div>
            </div>
          </div>
          <!-- SUPER TAG LEGEND END -->
          <div class="w-100 h-100 no-area-modal d-flex align-center justify-center" v-if="noAreaWarning">
            <h3 class="primary--text">{{$t('assets-no-location')}}</h3>
          </div>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import bbox from '@turf/bbox';
import mapGL from '../map/map';
import MapHistoryBar from '../map-history-bar/map-history-bar.vue';
import MapGrid from '../shared/af3-map-tools/af3-map-tools.vue';
import { mapActions, mapGetters } from 'vuex';
import {
  fitPolygon,
  getFirstLayer,
  clearLayers,
  addPolygonsSourceToMap,
  addFillPolygonAndLineToMap,
  mapCoordinates
} from '../../utils/map';
import AuthService from '../../services/auth';
import ActionsPopupComponent from "../shared/data-table/custom-cells/actions-popup";
import NotSeenInDaysComponent from "../shared/data-table/custom-cells/last-event-cell";
import constants from '../../constants/resolutions-constants';
import { AF3_INVALID_COORDINATES } from '../../constants/not-applicable-values';
import { WARNING_DAYS } from '../../constants/warning-days'
import { supertagTok } from '../../constants/supertag';
const networkAssetPath = `${process.env.VUE_APP_NETWORK_ASSETS_URL}/networkAsset/airfinder/`;
const networkAssetV2Path = `${process.env.VUE_APP_NETWORK_ASSETS_URL}/networkAsset/airfinder/v2/`;
const networkAssetV3Path = `${process.env.VUE_APP_NETWORK_ASSETS_URL}/networkAsset/airfinder/v3/`;
const usaCenterLong = -100.4458825;
const usaCenterLat = 39.7837304;
const feet = 3.28084;
const LIST_ITEM_HEIGHT = 75;
const COLLAPSIBLE_DELAY = 420;
export default {
  components: {
    mapGL,
    MapGrid,
    MapHistoryBar,
    NotSeenInDaysComponent,
    ActionsPopupComponent
  },
  props: {
    siteId: null,
    inputArea: null,
    mapData: null,
    filters: null,
    showSingleTag: null,
    totalRows: null,
    mapPagination: {},
    mapLocations: null,
    comment: null,
    onlyMap: null,
    readOnly: null,
    styles: null,
    noGeoJsonCall: false,
    actions: null
  },
  data() {
    return {
      sm: constants.IPAD_PORTRAIT,
      map: null,
      mapLoaded: false,
      af3MapLoaded: false,
      selectedTag: null,
      highlightTagIndex: null,
      indoorTagsFromUrlLayerId: 'indoor-area-tags-airfinder',
      indoorTagsFromUrlClusterLayerId: 'indoor-area-tags-cluster-airfinder',
      indoorTagsFromUrlClusterCountLayerId: 'indoor-area-tags-cluster-count-airfinder',
      indoorTagsSourceId: 'indoor-tags-source-airfinder',
      indoorTagsClusterLayerId: 'indoor-tags-cluster-airfinder',
      indoorTagsClusterCountLayerId: 'indoor-tags-cluster-counts-airfinder',
      superTagsLayerId: 'super-tags-airfinder',
      superTagsFromUrlLayerId: 'all-super-tags-airfinder',
      superTagsClusterLayerId: 'super-tags-cluster-airfinder',
      superTagsClusterCountLayerId: 'super-tags-cluster-count-airfinder',
      superTagsPositionNameLayerId: 'super-tags-name-airfinder',
      confidenceSourceId: 'confidence-layer-airfinder',
      superTagLayerClickHandler: {},
      superTagClusterLayerClickHandler: {},
      af3LocationsLayerId: 'tags-points-airfinder',
      zonesLayerId: 'zones-polygon-airfinder',
      indoorTagsFromUrlClusterClickhandler: {},
      indoorTagsClusterClickHandler: {},
      onMouseEnterLocationHandler: {},
      onMouseLeaveLocationHandler: {},
      showHistoryBar: false,
      historyTagArea: null,
      tagIcons: {
        gps: require('../../assets/img/map/pin_gps.png'),
        wifi: require('../../assets/img/map/pin_wifi.png'),
        cellid: require('../../assets/img/map/pin_cell.png'),
        beacon: require('../../assets/img/map/pin_location.png'),
        heartbeat: require('../../assets/img/map/pin_hb.png')
      },
      batteryFull: require('../../assets/img/aggrid/battery-full.png'),
      batteryLow: require('../../assets/img/aggrid/battery-low.png'),
      batteryHalf: require('../../assets/img/aggrid/battery-half.png'),
      batteryFullQuestion: require('../../assets/img/aggrid/battery-full-question.png'),
      batteryLowQuestion: require('../../assets/img/aggrid/battery-low-question.png'),
      batteryHalfQuestion: require('../../assets/img/aggrid/battery-half-question.png'),
      mapTags: [],
      simpleTag: [],
      isGeoReferenced: false,
      indoorMapOptions: {
        minZoom: 8,
        maxZoom: 14,
        transformRequest: this.mapSourceRequestHandler
      },
      outdoorMapOptions: {},
      supertagsSourceUrl: null,
      indoorTagsSourceUrl: null,
      zoneSourceUrl: null,
      clusterLeaves: [],
      clusterLeaveIndex: 0,
      clusterPopup: null,
      singleTag: this.showSingleTag,
      playHistory: false,
      showPlayButton: true,
      singleTagWhenNoArea: false,
      singleTagAreaWhenNoArea: false,
      noAreaWarning: false,
      supertagToken: supertagTok,
      areaFileMapping: null,
      measuringToolActive: false,
      masureUnit: "0",
      scale: 100,
      alreadyLoadedArea: null,
      goToPage: null,
      refreshingTags: false,
      alreadyAppliedFilters: ''
    };
  },
  computed: {
    ...mapGetters('area', ['currentArea', 'areas']),
    ...mapGetters('site', ['currentSiteLabels', 'currentSite']),
    ...mapGetters('tag', ['getMapTagsScroll']),
    ...mapGetters('layout', ['getWindowWidth']),
    mapArea: function () {
      return this.inputArea || this.currentArea;
    },
    locationFilteredTags: function() {
      // TO DO Remove computed property
      let filteredTags = [...this.mapData];
      return filteredTags;
    },
    pageCount() {
      return Math.ceil(this.totalRows / this.mapPagination.size);
    },
    getViewingOf(){
      const from = ((Number(this.mapPagination.page) - 1) * Number(this.mapPagination.size)) + 1;
      const to = (Number(from) - 1) + Number(this.mapPagination.size);
      return `${this.totalRows>0?from:0}-${to>=this.totalRows?this.totalRows:to}`;
    },
  },
  watch: {
    mapLoaded(){
      if(this.mapLoaded && !this.singleTag){
        this.selectFirstTag();
      }
    },
    currentSite(){
      this.alreadyLoadedArea = null;
      this.areaFileMapping = null;
      this.clearSelected();
      this.clearHistory();
    },
    filters(newFilters, oldFilters){
      this.alreadyAppliedFilters = oldFilters;
      this.clearSelected();
      this.clearSuperTagsLayers(this.map, true);
      this.supertagsSourceUrl = `${networkAssetV2Path}supertags/geojson?siteId=${this.currentSite.id}${this.filters}`;
      if(!this.isGeoReferenced) {
        this.areaFileMapping = null;
        this.clearIndoorTagsLayers(this.map, true);
      }
    },
    mapData(newMapData) {
      if(this.filters.includes('areaId')){
        this.singleTagWhenNoArea = false;
        this.singleTagAreaWhenNoArea = false;
        this.alreadyLoadedArea = null;
      }
      if(this.clusterPopup){
        this.clusterPopup.remove();
      }
      this.mapTags = Array.from(newMapData);
      this.simpleTag = [];
      if(!this.mapLoaded) {
        return;
      }
      if(!this.noGeoJsonCall){
        let index = this.getFirstTagIndex();
        if (this.mapTags && this.mapTags.length) {
          //check if there is an area already loaded and it is not the same area for the new item to be selected
          if(!this.alreadyLoadedArea || (index !== -1 && this.mapTags[index].area.id !== this.alreadyLoadedArea.id)) {
            //execute only if a filter was applied or a refresh was applied, not if mapData changed because of loadMore
            if(this.refreshingTags || (this.alreadyAppliedFilters !== this.filters)){
              this.refreshingTags = false;
              if (this.isGeoReferenced) {
                this.supertagsSourceUrl = `${networkAssetV2Path}supertags/geojson?siteId=${this.siteId}${this.filters}`;
                this.drawSuperTagsFromUrl(this.map, this.supertagsSourceUrl, this.showClusterLeaves);             
              } else if (this.mapArea && this.mapArea.id) {
                const filterString = this.createFiltersString(this.filters, 'areaId');
                if(!this.currentSite.isAf3){
                  this.indoorTagsSourceUrl = `${networkAssetV2Path}tags/indoor/geojson?siteId=${this.siteId}&areaId=${this.mapArea.id}${filterString}`;
                }else{
                  this.indoorTagsSourceUrl = `${networkAssetV3Path}tags/indoor/geojson?siteId=${this.siteId}&areaId=${this.mapArea.id}${filterString}`;
                }
                this.drawIndoorAreaTagsFromUrl(this.map, this.indoorTagsSourceUrl, this.showClusterLeaves);
              } 
            }
          }
        }
        // do not select first tag for af3
        if(this.highlightTagIndex === null && !this.currentSite.isAf3) {
          this.selectFirstTag();
        }
      }
    },
    async mapArea(newArea) {
      if(!this.mapLoaded) {
        return;
      }

      if (!this.mapArea || !this.mapArea.id) {
        clearLayers(this.map);
        return;
      }

      const geoReferenced = newArea.assetInfo.metadata.props.geoReferenced === 'true';
      
      this.singleTag = null;
      this.highlightTagIndex = null;
      this.selectedTag = null;
      this.clearHistory();
      if (this.isGeoReferenced !== geoReferenced) {
        this.isGeoReferenced = geoReferenced;
        clearLayers(this.map);
        return
      }

      if (newArea.assetInfo && newArea.assetInfo.metadata.props.polygon &&
        this.isGeoReferenced) {
        this.clearAreaPolygon(this.map);
        this.drawAreaPolygon(
          this.map,
          newArea.assetInfo.metadata.props.polygon,
          'outdoor-area',
          true,
          true
        );
      } else if (
        newArea && newArea.id &&
        newArea.assetInfo.metadata.props.indoorMapping &&
        !this.isGeoReferenced
      ) {
        clearLayers(this.map);
        await this.fetchIndoorPlan(newArea.id)
      } else {
        this.clearAreaPolygon(this.map);
      }
      this.drawZones(this.map, newArea.id);
      this.af3MapLoaded = true;
    },
    selectedTag(newSelectedTag, oldSelectedTag){
      this.playHistory = false;
      this.showPlayButton = true;
      if(newSelectedTag){
        this.$set(newSelectedTag, 'showPlayBtn', false);
      }
      if(oldSelectedTag){
        this.$set(oldSelectedTag, 'showPlayBtn', false);
      }
    }
  },
  updated() {
    if(this.simpleTag.length === 1){
      this.highlightTagIndex = 0;
    }
  },
  mounted() {
    this.supertagsSourceUrl = `${networkAssetV2Path}supertags/geojson?siteId=${this.siteId}${this.filters}`;
    if (this.currentSite.isAf3) {
      this.indoorTagsSourceUrl = `${networkAssetV3Path}tags/indoor/geojson?siteId=${this.siteId}`;
    }else {
      this.indoorTagsSourceUrl = `${networkAssetV2Path}tags/indoor/geojson?siteId=${this.siteId}`;
    }
    this.zoneSourceUrl = `${networkAssetPath}zones/geojson`;
    this.outdoorMapOptions = {
      transformRequest: this.mapSourceRequestHandler
    }
    this.mapTags = Array.from(this.mapData || []);
    if(this.getMapTagsScroll){
      this.$refs.panels.$el.parentElement.scrollTo(0, this.getMapTagsScroll);
    }
    window.addEventListener('resize', this.onResize);
    this.resizePager();
  },
  beforeDestroy() {
    if(this.selectedTag){
      this.$set(this.selectedTag, 'showPlayBtn', false);
    }
  },
  methods: {
    ...mapActions(['logout']),
    ...mapActions('tag', ['getTagHistory', 'getTag', 'getTagsUrl']),
    ...mapActions('area', ['getAreaIndoorFile', 'getAF3Points', 'getAreas']),
    async refreshMapTags() {
      this.highlightTagIndex = null;
      this.refreshingTags = true;
      this.$emit('refreshTags', this.currentSite.id);
      let mapSource = this.map.getSource(this.indoorTagsFromUrlLayerId);
      if (mapSource) {
        try {
          let freshTags = await this.getTagsUrl(this.indoorTagsSourceUrl);
          mapSource.setData(freshTags);
        } catch (e) {
          const errorMessage = e.data ? e.data.message : this.$t("something-went-wrong");
          throw errorMessage; 
        }
      }
    },
    onResize() {
      this.resizePager();
    },
    resizePager() {
      if(this.$refs.panels !== undefined){
        let width = this.$refs.panels.$el.offsetWidth;
        this.$refs.pager.style = 'width:'+width+'px';
        let viewing = this.$refs.pager.getElementsByClassName('viewing')[0];
        let goTo = this.$refs.pager.getElementsByClassName('goto')[0];
        if (viewing && goTo) {
          if(width < 235){
            viewing.style = 'display: none';
            goTo.style = 'display: none';
          }else{
            if(width < 300){
              viewing.style = 'display: none';
              goTo.style = 'display: block';
            }else{
              viewing.style = 'display: block';
              goTo.style = 'display: block';
            }
          }
        }
      }
    },
    async selectFirstTag(){
      if(this.mapTags.length > 0 && (!this.filters.includes('areaId'))){
        let index = this.getFirstTagIndex();
        index = index !== -1 ? index : 0;
        if(index !== -1){
          await this.onTagSelected(this.mapTags[index], true);
          this.highlightTagIndex = index;
        }
      }
    },
    getFirstTagIndex(){
      return this.mapTags.findIndex( item => item.area.id);
    },
    clearSelected(){
      this.singleTagWhenNoArea = false;
      this.singleTagAreaWhenNoArea = false;
      this.selectedTag = null;
      this.noAreaWarning = false;
      this.highlightTagIndex = null;
      this.map.fire('closeAllPopups');
    },
    isIndoor(tag){
      if(!this.supertagToken.includes(tag.appTok)){
        return true;
      }
      return false;
    },
    stInIndoor(tag){
      //supertag converted into indoor
      if(this.supertagToken.includes(tag.appTok) && (tag.locationTime > tag.latitudeTime)){
        return true;
      }
      return false;
    },
    showHistoryPlayBtn(value){
      this.$set(this.selectedTag, 'showPlayBtn', value);
    },
    paginationChange(page){
      this.highlightTagIndex = -1;
      this.$emit('loadMore', {
        page: page,
        pageSize: this.mapPagination.size,
      });
     },
     onGoToPage(){
       if(this.goToPage){
          if(this.goToPage < 1){
            this.goToPage = 1;
          }else{
            if(this.goToPage > this.pageCount){
              this.goToPage = this.pageCount;
            }
          }
          if(this.mapPagination.page !== this.goToPage){
            this.mapPagination.page = parseInt(this.goToPage);
            this.paginationChange(this.mapPagination.page);
          }
        }
     },
    async onLoad(mapRef) {
      this.map = mapRef;
      this.mapLoaded = true;
      let geoReferenced = true;
      let mapArea = null;
      if(this.mapArea && this.mapArea.id){
        mapArea = this.mapArea
      }else{
        if(this.singleTagAreaWhenNoArea){
          mapArea = this.singleTagAreaWhenNoArea;
        }
      }
      if (mapArea && mapArea.id) {
        geoReferenced = mapArea.assetInfo.metadata.props.geoReferenced === 'true';
      }
      if (this.isGeoReferenced !== geoReferenced) {
        this.isGeoReferenced = geoReferenced;
        this.mapLoaded = false;
        return
      }
      
      this.map.on('error', this.mapErrorHandler);

      if(!this.singleTagWhenNoArea){//execute if there is no tag selected from the list
        this.highlightTagIndex = null;
        this.selectedTag = null;
      }
      this.clearHistory();
      if (this.isGeoReferenced) {
        let tag = this.singleTag ? this.singleTag : [this.singleTagWhenNoArea];
        if ((this.singleTag || this.singleTagWhenNoArea) && tag && tag[0].latitude && tag[0].longitude) {
          this.drawSuperTags(this.map, tag, this.onTagSelected);
          this.map.flyTo({ center: [tag[0].longitude, tag[0].latitude] });
        } else {
          this.drawSuperTagsFromUrl(
            this.map,
            this.supertagsSourceUrl,
            this.showClusterLeaves
          );
        }
      } else if (this.mapTags && this.mapTags.length) {
        if (this.singleTag || this.singleTagWhenNoArea) {
          this.drawDevices(
            this.map,
            this.mapLocations,
            this.singleTagWhenNoArea ? [this.singleTagWhenNoArea] : this.mapTags
          );
        } else {
          const filterString = this.createFiltersString(this.filters, 'areaId');
          if (this.currentSite.isAf3) {
            this.indoorTagsSourceUrl = `${networkAssetV3Path}tags/indoor/geojson?siteId=${this.siteId}&areaId=${this.mapArea.id}${filterString}`;
          } else {
            this.indoorTagsSourceUrl = `${networkAssetV2Path}tags/indoor/geojson?siteId=${this.siteId}&areaId=${this.mapArea.id}${filterString}`;  
          }
          this.drawIndoorAreaTagsFromUrl(this.map, this.indoorTagsSourceUrl, this.showClusterLeaves);
        }
      }

      if (
        mapArea &&
        mapArea.assetInfo &&
        mapArea.assetInfo.metadata.props.polygon &&
        this.isGeoReferenced
      ) {
        this.drawAreaPolygon(
          this.map,
          mapArea.assetInfo.metadata.props.polygon,
          'outdoor-area',
          true,
          true
        );
      } else if (
        mapArea &&
        mapArea.assetInfo &&
        mapArea.assetInfo.metadata.props.indoorMapping && 
        !this.isGeoReferenced
      ) {
        await this.fetchIndoorPlan(mapArea.id)
      }
      if(mapArea || ((!mapArea || !mapArea.id) && !this.isGeoReferenced)){
        this.drawZones(this.map, mapArea.id);
      }
      this.updateMapCursor();
      this.af3MapLoaded = true;
      this.map.on('click', e => {
        const features = this.map.queryRenderedFeatures(e.point);
        if(features.length > 0){
          //airfinder layers, outdoor area and map grid has no click handler
          const featuresCount = features.filter( f => f.layer.id.includes("-airfinder") && f.layer.id !== 'outdoor-area-fill-polygon-airfinder' && f.layer.id !== 'map-grid-airfinder').length;
          const zoneFeatures = features.filter( f => f.layer.id.includes("zones-polygon-airfinder")); //airfinder zones polygon layers
          if(zoneFeatures.length > 0 && featuresCount === zoneFeatures.length){
            this.zonesLayerClickHandler(zoneFeatures, e);
          }
        }
      })
    },
    updateMapCursor() {
      this.map.off('mouseenter', this.indoorTagsClusterLayerId, this.onMouseEnterLocationHandler);
      this.map.off('mouseleave', this.indoorTagsClusterLayerId, this.onMouseLeaveLocationHandler); 
      this.onMouseEnterLocationHandler = () => {
        if (this.measuringToolActive) {
          this.map.getCanvas().style.cursor = 'crosshair'
        } else {
          this.map.getCanvas().style.cursor = 'pointer'
        }
      }
      this.onMouseLeaveLocationHandler = () => {
        if (this.measuringToolActive) {
          this.map.getCanvas().style.cursor = 'crosshair'
        } else {
          this.map.getCanvas().style.cursor = ''
        }
      }
      this.map.on('mouseenter', this.indoorTagsClusterLayerId, this.onMouseEnterLocationHandler);
      this.map.on('mouseleave', this.indoorTagsClusterLayerId, this.onMouseLeaveLocationHandler); 
    },
    // TODO remove to a mixin. Code repeated in battery-level-cell.js
    getBatteryIcon(tag) {
      let tagDate = new Date(tag.lastEventTime);
      let useQuestionMark = false;
      if (tag.notSeenInDays >= WARNING_DAYS.MIN) {
        useQuestionMark = true;
      }
      let img = '';
       switch (tag.batteryStatus) {
        case 0:
          img = useQuestionMark ? this.batteryLowQuestion : this.batteryLow;
          break;
        case 1:
          img = useQuestionMark ? this.batteryFullQuestion : this.batteryFull;
          break;  
        case 2:
          img = useQuestionMark ? this.batteryHalfQuestion : this.batteryHalf;
        break;
      }
      return img;
    },
    drawSuperTags(map, tagData, onTagClick) {
      const superTagsLayer = this.superTagsLayerId
      const superTagsPositionNameLayer = this.superTagsPositionNameLayerId;
      const points = tagData
        ? tagData
            .filter((tag) => tag.latitude && tag.longitude)
            .map((tag) => {
              if (tag.latitude && tag.longitude) {
                let point = {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [tag.longitude, tag.latitude],
                  },
                  properties: {
                    id: tag.id,
                    positionName: tag.positionName,
                    source: tag.source,
                    name: tag.name,
                    lastEventTime: tag.lastEventTime,
                  },
                };
                return point;
              }
            })
        : [];
      if (map.getLayer(superTagsLayer)) {
        let superTagsSource = map.getSource(superTagsLayer);
        superTagsSource.setData({
          type: 'FeatureCollection',
          features: points,
        });
      } else {
        map.addSource(superTagsLayer, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: points,
          },
        });
        map.addLayer({
          id: superTagsLayer,
          source: superTagsLayer,
          type: 'symbol',
          layout: {
            'icon-image': [
              'match',
              ['get', 'source'],
              'wifi',
              'wifi',
              'beacon',
              'beacon',
              'gps',
              'gps',
              'cellid',
              'cell',
              'cellId',
              'cell',
              'gps',
            ],
            'icon-offset': [0, -16],
            'icon-allow-overlap': true,
          },
        });

        map.addLayer({
          id: superTagsPositionNameLayer,
          type: "symbol",
          source: superTagsLayer,
          minzoom: 14,
          filter: ['==', 'source', 'beacon'],
          layout: {
            'text-field': ['get', 'positionName'],
            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
            'text-radial-offset': 0.5,
            'text-justify': 'auto',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          }
        });
      }
      if(!this.singleTag){
        if (this.tagLayerClickHandler) {
          map.off('click', superTagsLayer, this.tagLayerClickHandler);
        }

        this.tagLayerClickHandler = (e) => {
          //when this layer is drawn, there is a tag already selected
          onTagClick(this.selectedTag);
        };

        map.on('click', superTagsLayer, this.tagLayerClickHandler);
      }
      return superTagsLayer;
    },
    drawSuperTagsFromUrl(map, sourceUrl, onTagClick) {
      this.clearSingleSuperTagLayer();
      const superTagsLayer = this.superTagsFromUrlLayerId;
      const superTagsClusterLayer = this.superTagsClusterLayerId;
      const superTagsClusterCountLayer = this.superTagsClusterCountLayerId;
      const superTagsPositionNameLayer = this.superTagsPositionNameLayerId;

      if (!map.getSource(superTagsLayer)) {
        map.addSource(superTagsLayer, {
          type: 'geojson',
          data: sourceUrl,
          cluster: true,
          clusterRadius: 20
        });
      }

      if (!map.getLayer(superTagsLayer)) {
        map.addLayer({
          id: superTagsLayer,
          source: superTagsLayer,
          filter: ['!', ['has', 'point_count']],
          type: 'symbol',
          layout: {
            'icon-image': [
              'match',
              ['get', 'source'],
              'wifi',
              'wifi',
              'beacon',
              'beacon',
              'gps',
              'gps',
              'cellid',
              'cell',
              'cellId',
              'cell',
              'gps'
              
            ],
            'icon-offset': [0, -16],
            'icon-allow-overlap': true,
          },
        });

        map.addLayer({
          id: superTagsClusterLayer,
          type: 'circle',
          source: superTagsLayer,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#51bbd6',
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              100,
              30,
              750,
              40,
            ],
          },
        });

        map.addLayer({
          id: superTagsClusterCountLayer,
          type: 'symbol',
          source: superTagsLayer,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
        });
        map.addLayer({
          id: superTagsPositionNameLayer,
          type: "symbol",
          source: superTagsLayer,
          minzoom: 14,
          filter: ['==', 'source', 'beacon'],
          layout: {
            'text-field': ['get', 'positionName'],
            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
            'text-radial-offset': 0.5,
            'text-justify': 'auto',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          }
        });
        if (this.superTagLayerClickHandler) {
          map.off('click', superTagsLayer, this.superTagLayerClickHandler);
          map.off('click', superTagsClusterLayer, this.superTagClusterLayerClickHandler);
        }

        this.superTagLayerClickHandler = (e) => {
          const selectedTag = this.locationFilteredTags.find(
            (tag) => tag.id === e.features[0].properties.id
          );
          //if selected tag is not on the list
          if(!selectedTag){
            this.getTagById(e.features[0].properties.id);
          }else{
            this.onTagSelected(selectedTag);
          }
        };

        this.superTagClusterLayerClickHandler = (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: [superTagsClusterLayer] });
          const clusterId = features[0].properties.cluster_id;
          const point_count = features[0].properties.point_count;
          let clusterSource = map.getSource(superTagsLayer);
          if(clusterId) {
            // Get all points under a cluster
            clusterSource.getClusterLeaves(clusterId, point_count, 0, function(err, clusterFeatures) {
              onTagClick(clusterFeatures, false);
            });
          }
        };

        map.on('click', superTagsLayer, this.superTagLayerClickHandler);
        map.on('click', superTagsClusterLayer, this.superTagClusterLayerClickHandler);
      }
      if(!this.currentArea.id){
        this.map.flyTo({ center: [usaCenterLong, usaCenterLat], zoom: 3.5 });
      }
      return superTagsLayer;
    },
    async getTagById(tagId){
      const tag = await this.getTag(tagId);
      this.simpleTag.push(tag);
      this.onTagSelected(tag);
    },
    drawIndoorAreaTagsFromUrl(map, sourceUrl, onTagClick) {
      const indoorTagsSource = map.getSource(this.indoorTagsFromUrlLayerId);
      if (!indoorTagsSource) {
        map.addSource(this.indoorTagsFromUrlLayerId, {
          type: 'geojson',
          data: sourceUrl,
          cluster: true,
          clusterRadius: 20,
        });
      }

      if (!map.getLayer(this.indoorTagsFromUrlClusterLayerId)) {
        map.addLayer({
          id: this.indoorTagsFromUrlClusterLayerId,
          type: 'circle',
          source: this.indoorTagsFromUrlLayerId,
          paint: {
            'circle-radius': [
              'case',
              ['has', 'point_count'],
              ['step', ['get', 'point_count'], 14, 10, 20],
              14,
            ],
            'circle-color': '#51bbd6',
          },
        });

        map.addLayer({
          id: this.indoorTagsFromUrlClusterCountLayerId,
          type: 'symbol',
          source: this.indoorTagsFromUrlLayerId,
          layout: {
            'text-field': [
              'case',
              ['has', 'point_count'],
              ['get', 'point_count_abbreviated'],
              '1',
            ],
            'text-font': ['Montserrat ExtraBold'],
            'text-anchor': 'center',
            'text-allow-overlap': true,
            'icon-allow-overlap': true,
          },
          paint: {
            'text-color': 'white',
          },
        });

        if (this.indoorTagsFromUrlClusterClickhandler) {
          map.off('click', this.indoorTagsFromUrlClusterLayerId, this.indoorTagsFromUrlClusterClickhandler);
          map.off('mouseenter', this.indoorTagsFromUrlClusterLayerId, this.onMouseEnterLocationHandler);
          map.off('mouseleave', this.indoorTagsFromUrlClusterCountLayerId, this.onMouseLeaveLocationHandler);
        }
        const mapFeaturesHandler = (e) => {
          const selectedTag = this.locationFilteredTags.find(
            (tag) => tag.id === e[0].properties.tagId || (this.currentSite.isAf3 && tag.id === e[0].properties.nodeAddress)
          );
          //if selected tag is not on the list
          if(!selectedTag){
            this.getTagById(this.currentSite.isAf3 ? e[0].properties.nodeAddress : e[0].properties.tagId);
          }else{
            this.onTagSelected(selectedTag);
          }
        };

        this.indoorTagsFromUrlClusterClickhandler = (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: [this.indoorTagsFromUrlClusterLayerId] });
          const clusterId = features[0].properties.cluster_id;
          if(clusterId) {
            const point_count = features[0].properties.point_count;
            let clusterSource = map.getSource(this.indoorTagsFromUrlLayerId);
            // Get all points under a cluster
            clusterSource.getClusterLeaves(clusterId, point_count, 0, function(err, clusterFeatures){
              onTagClick(clusterFeatures, true);
            })
          } else {
            mapFeaturesHandler(features);
          }
        };

        this.onMouseEnterLocationHandler = () => (map.getCanvas().style.cursor = 'pointer');
        this.onMouseLeaveLocationHandler = () => (map.getCanvas().style.cursor = '');

        map.on('click', this.indoorTagsFromUrlClusterLayerId, this.indoorTagsFromUrlClusterClickhandler);
        map.on('mouseenter', this.indoorTagsFromUrlClusterLayerId, this.onMouseEnterLocationHandler);
        map.on('mouseleave', this.indoorTagsFromUrlClusterCountLayerId, this.onMouseLeaveLocationHandler);
      }
    },
    drawDevices(map, locations, tags) {
      //this method needs to be refactored after indoor geojson returns values for af3 tags
      let self = this;
      if(locations.length > 0){
        const locationDictionary = locations.reduce((dict, location) => {
            dict[location.id] = location;
          return dict;
        }, {});
        const newCollection = [];
        tags.forEach(tag => {
          if (!this.currentSite.isAf3) {
            const tagLocation = locationDictionary[tag.location.id];
            if (tagLocation) {
              newCollection.push({
                type: "Feature",
                geometry: {
                  type: 'Point',
                  coordinates: tagLocation.point
                },
                properties: {
                  locationId: tag.location.id,
                  tagId: tag.id,
                }
              });
            }
          } else {
            newCollection.push({
                type: "Feature",
                geometry: {
                  type: 'Point',
                  coordinates: [tag.latitude, tag.longitude]
                },
                properties: {
                  locationId: tag.id,
                  name: tag.name,
                  tagId: tag.id,
              }
            });
          }
        })
        this.drawPoints(map, newCollection);
        if (this.indoorTagsClusterClickHandler) {
          map.off('click', this.indoorTagsClusterLayerId, this.indoorTagsClusterClickHandler);
          map.off('mouseenter', this.indoorTagsClusterLayerId, this.onMouseEnterLocationHandler);
          map.off('mouseleave', this.indoorTagsClusterLayerId, this.onMouseLeaveLocationHandler);
        }

        if(!this.singleTagWhenNoArea) {//don't add click funtionality over the map if there is no area selected
          const mapFeaturesHandler = (e) => {
            const selectedTag = this.locationFilteredTags.find(
              (tag) => tag.id === e[0].properties.tagId
            );
            //if selected tag is not on the list
            if(!selectedTag) {
              this.getTagById(e[0].properties.tagId);
            } else {
              this.onTagSelected(selectedTag);
            }
          };
          this.indoorTagsClusterClickHandler = (e) => {
            if (!this.measuringToolActive) {
              const features = map.queryRenderedFeatures(e.point, { layers: [this.indoorTagsClusterLayerId] });
              const clusterId = features[0].properties.cluster_id;
              if(clusterId) {
                const point_count = features[0].properties.point_count;
                let clusterSource = map.getSource(this.indoorTagsSourceId);
                // Get all points under a cluster
                clusterSource.getClusterLeaves(clusterId, point_count, 0, function(err, clusterFeatures){
                  self.showClusterLeaves(clusterFeatures, true);
                })
              } else {
                if (!Number.isInteger(this.highlightTagIndex)) {
                  mapFeaturesHandler(features);
                }else{
                  if(Number.isInteger(this.highlightTagIndex)){
                    this.highlightTagIndex = null;
                    this.onTagSelected(this.selectedTag, true);
                  }
                }
              }
            }
          };
          this.updateMapCursor();
          map.on('click', this.indoorTagsClusterLayerId, this.indoorTagsClusterClickHandler);
        }
      }else{
        this.clearIndoorTagsLayers(map, true);
      }
    },
    drawPoints(map, points) {
      const indoorTagsSource = map.getSource(this.indoorTagsSourceId);
      if (!indoorTagsSource) {
        map.addSource(this.indoorTagsSourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: points
          },
          cluster: true,
          clusterRadius: 25
        });
      } else {
        indoorTagsSource.setData(
          {
            type: 'FeatureCollection',
            features: points
          }
        );
      }

      if (!map.getLayer(this.indoorTagsClusterLayerId)) {
        map.addLayer({
          id: this.indoorTagsClusterLayerId,
          type: 'circle',
          source: this.indoorTagsSourceId,
          paint: {
            'circle-radius': [
              'case', ['has', 'point_count'],
              ['step',
                ['get', 'point_count'],
                14,
                10,
                20
              ],
              14
            ],
            'circle-color': '#51bbd6',
          },
        });

        map.addLayer({
          id: this.indoorTagsClusterCountLayerId,
          type: 'symbol',
          source: this.indoorTagsSourceId,
          layout: {
            'text-field': ['case', ['has', 'point_count'], ['get', 'point_count_abbreviated'], '1'],
            'text-font': ['Montserrat ExtraBold'],
            'text-anchor': 'center',
            'text-allow-overlap': true,
            'icon-allow-overlap': true,
          },
          paint: {
            'text-color': 'white'
          }
        });
      }
    },
    async fetchIndoorPlan (areaId) {
      this.af3MapLoaded = false;
      this.areaFileMapping = await this.getAreaIndoorFile({ areaId });
      this.drawAreaIndoorPlan(this.map, this.areaFileMapping);
    },
    drawAreaIndoorPlan(map, area) {
      const { nwCorner, seCorner } = area;
      const file = area.file[0].preview;
      const areaOverlayLayerId = 'indoor-area-overlay-airfinder';
      const afterLayerId = getFirstLayer(this.map);

      if (!map.getLayer(areaOverlayLayerId)) {
        map.addSource(areaOverlayLayerId, {
          type: 'image',
          url: file,
          coordinates: [
            [nwCorner.lng, nwCorner.lat],
            [seCorner.lng, nwCorner.lat],
            [seCorner.lng, seCorner.lat],
            [nwCorner.lng, seCorner.lat]
          ]
        });
        
        map.addLayer(
          {
            id: areaOverlayLayerId,
            source: areaOverlayLayerId,
            type: 'raster'
          },
          afterLayerId
        );

        fitPolygon(this.map, [
          [nwCorner.lng, nwCorner.lat],
          [seCorner.lng, nwCorner.lat],
          [seCorner.lng, seCorner.lat],
          [nwCorner.lng, seCorner.lat]
        ]);

        map.setMaxBounds([
          [nwCorner.lng - 0.3, seCorner.lat - 0.1],
          [seCorner.lng + 0.3, nwCorner.lat + 0.1],
        ]);
      }
    },
    drawAreaPolygon(map, polygon, id, isArea = true, fitBounds = false) {
      const areaPolygonLayer = `${id}-polygon-airfinder`;
      const areaFillPolygonLayer = `${id}-fill-polygon-airfinder`;

      if (map.getLayer(areaPolygonLayer)) {
        let areaPolygonSource = map.getSource(areaPolygonLayer);
        let areaFillPolygonSource = map.getSource(areaFillPolygonLayer);

        areaPolygonSource.setData({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [polygon],
          },
        });
        areaFillPolygonSource.setData({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [polygon],
          },
        });
      } else {
        map.addLayer({
          id: areaFillPolygonLayer,
          type: 'fill',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [polygon],
              },
            },
          },
          paint: {
            'fill-color': isArea ? this.$vuetify.theme.themes.light.secondary : this.$vuetify.theme.themes.light.primary,
            'fill-opacity': 0.1,
          },
        });

        map.addLayer({
          id: areaPolygonLayer,
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [polygon],
              },
            },
          },
          paint: {
            'line-width': 3,
            'line-color': isArea ? this.$vuetify.theme.themes.light.secondary : this.$vuetify.theme.themes.light.primary,
          },
        });
      }

      fitBounds && fitPolygon(map, polygon);

      // To create Area Polygons beneath the supertags/locations
      if (this.map.getLayer(this.superTagsFromUrlLayerId)) { 
        this.map.moveLayer(areaPolygonLayer, this.superTagsFromUrlLayerId);
      } else if (this.map.getLayer(this.indoorTagsClusterLayerId)) {
        this.map.moveLayer(areaPolygonLayer, this.indoorTagsClusterLayerId);
      }
    },
    drawZones(map, areaId) {
      if (!map.getSource(this.zonesLayerId)) {
        this.zoneSourceUrl = `${networkAssetPath}zones/geojson?areaId=${areaId}`;
        const sourceId = addPolygonsSourceToMap(map, this.zoneSourceUrl, this.zonesLayerId);
        const layerId = addFillPolygonAndLineToMap(map, sourceId, this.$vuetify.theme.themes.light.primary, 3);
        const zoneLayerId = 'fill-'+sourceId;
        if (map.getLayer(this.indoorTagsClusterLayerId)) {
          map.moveLayer(layerId, this.indoorTagsClusterLayerId);
        } else if (map.getLayer(this.indoorTagsFromUrlClusterLayerId)) {
          map.moveLayer(layerId, this.indoorTagsFromUrlClusterLayerId);
        }
        this.zonesLayerClickHandler = (feature, e) => {
          // When a click event occurs on a zone
          // open a popup at the location of the click, with description
          // HTML from the click event's properties.
          let html = this.$t('assets-zone-name') + ': <b>' + feature[0].properties.name+'</b><br>';
          if(this.currentSite.isAf3 || this.isGeoReferenced){
            feature[0].geometry.coordinates[0].forEach( (p, i) => {
              let point = p[0]+', '+p[1];
              if(this.currentSite.isAf3){
                point = mapCoordinates({lngLat:{lng: p[0], lat: p[1]}}, this.$refs.mapGrid.floorData, this.$refs.mapGrid.unitGrid);
              }
              html += '<span><b> '+ this.$t('assets-point-lbl') + i + ':</b> ' + point + '</span><br>';
            });
          }
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(map);
        };

        // Change the cursor to a pointer when
        // the mouse is over the zones layer.
        map.on('mouseenter', zoneLayerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        
        // Change the cursor back to a pointer
        // when it leaves the zones layer.
        map.on('mouseleave', zoneLayerId, () => {
          map.getCanvas().style.cursor = '';
        });
      }
    },
    clearLayerByName(map, layerName){
      if (map.getLayer(layerName)) {
        map.removeLayer(layerName);
        map.removeSource(layerName);
      }
    },
    clearAreaPolygon(map) {
      let { layers, sources } = map.getStyle();
      const areaPolygonLayer = 'outdoor-area-polygon-airfinder';
      const areaFillPolygonLayer = 'outdoor-area-fill-polygon-airfinder';
      this.clearLayerByName(map, areaPolygonLayer);
      this.clearLayerByName(map, areaFillPolygonLayer);
      this.clearZones(map);
    },
    clearZones(map){
      let zonePolygonLayer = `line-${this.zonesLayerId}`;
      let zoneFillPolygonLayer = `fill-${this.zonesLayerId}`;
      if (map.getLayer(zonePolygonLayer)) {
        map.removeLayer(zonePolygonLayer);
        map.removeLayer(zoneFillPolygonLayer);
        map.removeSource(this.zonesLayerId);
      }
    },
    clearIndoorTagsLayers(map, removeClusterSource) {
      if(map.getSource(this.indoorTagsSourceId)){
        map.removeLayer(this.indoorTagsClusterCountLayerId);
        map.removeLayer(this.indoorTagsClusterLayerId);
        map.removeSource(this.indoorTagsSourceId);
      }

      if (map.getLayer(this.indoorTagsFromUrlClusterLayerId)) {
        map.removeLayer(this.indoorTagsFromUrlClusterLayerId);
        map.removeLayer(this.indoorTagsFromUrlClusterCountLayerId);
      }
      if (removeClusterSource && map.getSource(this.indoorTagsFromUrlLayerId)) {
        map.removeSource(this.indoorTagsFromUrlLayerId);
      }
    },
    clearSuperTagsLayers(map, removeSource){
      if (map.getLayer(this.superTagsFromUrlLayerId)) {
        map.removeLayer(this.superTagsFromUrlLayerId);
        map.removeLayer(this.superTagsClusterLayerId);
        map.removeLayer(this.superTagsClusterCountLayerId);
        map.removeLayer(this.superTagsPositionNameLayerId);
      }
      if (removeSource && map.getSource(this.superTagsFromUrlLayerId)) {
        map.removeSource(this.superTagsFromUrlLayerId);
      }
    },
    clearSingleSuperTagLayer(){
      if (this.map.getLayer(this.superTagsLayerId)) {
        this.map.removeLayer(this.superTagsLayerId);
        this.map.removeLayer(this.superTagsPositionNameLayerId);
        this.map.removeSource(this.superTagsLayerId);
      }
    },
    clearHistory() {
      this.showHistoryBar = false;
      this.historyTagArea = null
      this.hideClusterLeaves();
    },
    fitPolygon(map, polygon) {
      map.fitBounds(
        bbox({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [polygon],
          },
        }),
        { linear: true, padding: { top: 25, bottom: 25, right: 25, left: 25 } }
      );
    },
    async onTagSelected(tag, fromList) {
        this.clearIndoorTagsLayers(this.map, false);
        this.filteredLocations = [];
        if(!this.filters.includes('areaId')){//no area selected
          if(!tag.area.id && !tag.latitude && !tag.longitude){
            if(this.noAreaWarning && this.noAreaWarning.id === tag.id){//if it is deselecting a tag without an area
              this.noAreaWarning = false;
              this.selectedTag = tag; //mark this tag as selected to proceed with the deselection
              this.singleTagWhenNoArea = false;
              this.singleTagAreaWhenNoArea = false;
            }else{
              this.noAreaWarning = tag;
              if(!this.isGeoReferenced){
                //clear all the points in the floorplan
                this.drawDevices(this.map, [], this.mapData);
              }
              return
            }
          } else {
            if(this.noAreaWarning && this.singleTagWhenNoArea.id === tag.id){//if the selected item is the same that was clicked before clicking a tag without area
              this.noAreaWarning = false;
              if(!this.isGeoReferenced){
                this.drawDevices(this.map, this.mapLocations, [tag]); //draw the point againg on the floorplan
              }
              return
            }
            this.noAreaWarning = false;
            if(!this.singleTagWhenNoArea || (this.singleTagAreaWhenNoArea && (this.singleTagAreaWhenNoArea.id !== tag.area.id)) || 
            (!this.singleTagAreaWhenNoArea && tag.area.id)) {//no item selected or new area selected
              let areas;
              if (!this.alreadyLoadedArea) {
                areas = await this.getAreas({siteId: this.currentSite.id});
              } else {
                areas = this.areas;
              }
              let area = tag.area.id ? areas.find( item => item.id === tag.area.id) : null;
              let geoReferenced = area ? area.assetInfo.metadata.props.geoReferenced === 'true' : true;
              /* save selected tag and their area*/
              this.singleTagAreaWhenNoArea = area ? area : false;
              this.singleTagWhenNoArea = tag;
              /**/
              if(this.isGeoReferenced === geoReferenced) {//if not execute onLoad
                //if area is different form the one that already is on the map
                if((area && !this.alreadyLoadedArea) || (area && (this.alreadyLoadedArea && (area.id !== this.alreadyLoadedArea.id)))) {
                  await this.loadArea(area);
                }
              } else {
                this.selectedTag = tag;
                this.alreadyLoadedArea = area;
                this.isGeoReferenced = geoReferenced; //that trigger the onLoad
                return
              }
            } else {
              if((this.singleTagWhenNoArea.id !== tag.id) && (this.singleTagAreaWhenNoArea.id === tag.area.id)) {//new selection on same area
                this.singleTagWhenNoArea = tag;
              }else{
                if(this.singleTagWhenNoArea.id === tag.id){//close it
                    if(!Number.isInteger(this.highlightTagIndex)){
                      return
                    }
                    this.singleTagWhenNoArea = false;
                    this.singleTagAreaWhenNoArea = false;
                }
              }
            }
          }
        }
        if(this.clusterPopup){
          this.clusterPopup.remove();
        }
        
        if(this.showHistoryBar){
          this.onHistoryClear(true);
        }
        if(this.selectedTag === tag){//if click on an already selected tag => deselect it
          this.selectedTag = null;
          this.simpleTag = [];
          if(this.filters.includes('areaId')){
            this.mapTags = Array.from(this.mapData);
          }
          if(!fromList){
            this.highlightTagIndex = null;
          }
          if(this.isGeoReferenced) {
            this.clearSingleSuperTagLayer();

            if(!this.mapArea || !this.mapArea.id){
              await this.clearAreaPolygon(this.map);
            }

            this.drawSuperTagsFromUrl(this.map, this.supertagsSourceUrl, this.showClusterLeaves);
            this.alreadyLoadedArea = null;
          } else {
            if (!fromList) {
              return;
            }
            if(this.filters.includes('areaId')){
              if (this.filteredLocations && this.filteredLocations.length) {
                this.drawDevices(this.map, this.filteredLocations, this.mapData);
              } else {
                const filterString = this.createFiltersString(this.filters, 'areaId');
                if (this.currentSite.isAf3) {
                  this.indoorTagsSourceUrl = `${networkAssetV3Path}tags/indoor/geojson?siteId=${this.siteId}&areaId=${this.mapArea.id}${filterString}`;
                } else {
                  this.indoorTagsSourceUrl = `${networkAssetV2Path}tags/indoor/geojson?siteId=${this.siteId}&areaId=${this.mapArea.id}${filterString}`;
                }
                this.drawIndoorAreaTagsFromUrl(this.map, this.indoorTagsSourceUrl, this.showClusterLeaves);
              }
            }else{
              //clear all the points in the floorplan
              this.drawDevices(this.map, [], this.mapData);
            }
          }
        }else{
          if(this.isGeoReferenced) {
            if(tag.latitude && tag.longitude){
              this.selectedTag = tag;
              this.clearSuperTagsLayers(this.map, false);
              this.hideClusterLeaves();
              this.mapTags = [tag]; //keep on map only the selected tag
              this.drawSuperTags(this.map, this.mapTags, this.onTagSelected);
              if(!fromList && this.simpleTag.length === 0){ //open the tag on the list
                this.highlightTagIndex = this.mapData.findIndex((item) => item.id === tag.id);
                if (this.highlightTagIndex >= 0) {
                  setTimeout(() => {
                    this.$refs.panelsContainer.scrollTo(0, LIST_ITEM_HEIGHT * this.highlightTagIndex);
                  }, COLLAPSIBLE_DELAY);
                }
              }
              this.map.flyTo({ center: [tag.longitude, tag.latitude], zoom: 10 });
            }else{
              this.$toasted.show(this.$t('assets-undefined-lng-lat'), { 
                position: "bottom-right",
                className: ['toast-error'], 
                duration : 1500
              });
            }
          } else {
            this.selectedTag = tag;
            if(!fromList && this.simpleTag.length === 0){ //open the tag on the list
              this.highlightTagIndex = this.mapData.findIndex((item) => item.id === tag.id);
              if (this.highlightTagIndex >= 0) {
                setTimeout(() => {
                  this.$refs.panelsContainer.scrollTo(0, LIST_ITEM_HEIGHT * this.highlightTagIndex);
                }, COLLAPSIBLE_DELAY);
              }
            }
            this.drawDevices(this.map, this.mapLocations, [this.selectedTag]);
          }
        }
    },
    async loadArea(newArea){
      this.alreadyLoadedArea = newArea;
      if (newArea.assetInfo && newArea.assetInfo.metadata.props.polygon &&
        this.isGeoReferenced) {
        this.clearAreaPolygon(this.map);
        this.drawAreaPolygon(
          this.map,
          newArea.assetInfo.metadata.props.polygon,
          'outdoor-area',
          true,
          true
        );
        
      } else if (
        newArea && newArea.id &&
        newArea.assetInfo.metadata.props.indoorMapping &&
        !this.isGeoReferenced
      ) {
        if(this.map){
          clearLayers(this.map);
        }
        await this.fetchIndoorPlan(newArea.id);
      }
      this.drawZones(this.map, newArea.id);
    },
    onViewHistory() {
      this.clearHistory();
      this.historyTagArea =
        this.selectedTag && this.selectedTag.area && this.selectedTag.area.id
          ? this.areas.find((area) => area.id === this.selectedTag.area.id)
          : null;
      this.showHistoryBar = true;
      if (window.ga && this.selectedTag) {
        ga('send', 'event', {
          eventCategory: 'Supertag History',
          eventAction: 'click',
          eventLabel: 'History viewed of: ' + this.selectedTag.macAddress
        });
      }
    },
    async onHistorySubmit() {
      clearLayers(this.map);
    },
    onHistoryCancel() {
      this.$set(this.selectedTag, 'showPlayBtn', false);
      this.onHistoryClear(false);
      this.drawSuperTags(this.map, this.mapTags, this.onTagSelected);
      this.map.flyTo({ center: [this.mapTags[0].longitude, this.mapTags[0].latitude] });
    },
    onHistoryClear(fitBoundArea) {
      this.clearHistory();
      clearLayers(this.map);
      if((this.mapArea && this.mapArea.id) || (this.singleTagAreaWhenNoArea && this.singleTagAreaWhenNoArea.id)){
        this.drawAreaPolygon(
          this.map,
          this.mapArea.id ? this.mapArea.assetInfo.metadata.props.polygon : this.singleTagAreaWhenNoArea.assetInfo.metadata.props.polygon,
          'outdoor-area',
          true,
          fitBoundArea
        );
        this.drawZones(this.map, this.mapArea.id ? this.mapArea.id : this.singleTagAreaWhenNoArea.id);
      }
    },
    onPlayHistory(e){
      e.preventDefault();
      e.stopPropagation();
      this.playHistory = !this.playHistory;
      this.showPlayButton = !this.showPlayButton;
    },
    showClusterLeaves(leaves, isIndoor) {
      if (leaves && leaves.length) {
        this.clusterLeaveIndex = 0;
        this.clusterLeaves = leaves;
        this.clusterPopup = new mapboxgl.Popup({ offset: [0, -15], closeOnMove: true }).setLngLat(leaves[0].geometry.coordinates);
        this.setClusterPopup(isIndoor);
        this.clusterPopup.addTo(this.map);

        this.clusterPopup.getElement().addEventListener('click', (e) => {
          if(e.srcElement.localName === 'a'){
            if(e.srcElement.className === 'arrowRight'){
              this.showNextLeaf(true, isIndoor);
            }else{
              this.showNextLeaf(false, isIndoor);
            }
          } else if (e.srcElement.localName === 'i') {
            const popUpTagId = this.currentSite.isAf3 ? this.clusterLeaves[this.clusterLeaveIndex].properties.nodeAddress : this.clusterLeaves[this.clusterLeaveIndex].properties.tagId;
            const selectedTag = this.locationFilteredTags.find(
              (tag) => tag.id === popUpTagId
            );

            //if selected tag is not on the list
            if(!selectedTag){
              this.getTagById(popUpTagId);
            }else if(selectedTag) {
              this.onTagSelected(selectedTag);
            }
          }
        });
      }
    },
    hideClusterLeaves() {
      this.clusterLeaveIndex = 0;
      this.clusterLeaves = [];
    },
    showNextLeaf(next, showPopOutPin) {
      let nextLeafIndex;
      if (next) {
        nextLeafIndex = this.clusterLeaveIndex + 1;
        if (nextLeafIndex >= this.clusterLeaves.length) {
          nextLeafIndex = 0;
        }
      } else {
        nextLeafIndex = this.clusterLeaveIndex - 1;
        if (nextLeafIndex < 0) {
          nextLeafIndex = this.clusterLeaves.length - 1;
        }
      }
      this.clusterLeaveIndex = nextLeafIndex;
      this.setClusterPopup(showPopOutPin);
    },
    setClusterPopup(showPopOutPin){
      let popupHTML = `
                <div class="d-flex justify-center mx-2">
                  <a class="arrowLeft"><&nbsp;&nbsp;</a>
                    <label>`+ this.$t("assets-cluster-showing") + '&nbsp;' + (this.clusterLeaveIndex + 1) + '&nbsp;' + this.$t("assets-cluster-of") + '&nbsp;' + this.clusterLeaves.length + `</label>
                  <a class="arrowRight"">&nbsp;&nbsp;></a>
                </div>
                <div class="d-flex justify-center mt-2">
                  <h2>`+ (this.currentSite.isAf3 ? this.clusterLeaves[this.clusterLeaveIndex].properties.nodeName : this.clusterLeaves[this.clusterLeaveIndex].properties.name) + `</h2>
                </div>`
      popupHTML = showPopOutPin ? `<i aria-hidden="true" medium="" class="v-icon notranslate mdi mdi-export pin"></i>${popupHTML}` : popupHTML
      this.clusterPopup.setHTML(popupHTML);
    },
    async mapErrorHandler(e) {
      if (e.sourceId === this.superTagsFromUrlLayerId && e.error.url &&
        e.error.url.toLowerCase().indexOf(this.supertagsSourceUrl.toLowerCase()) > -1) {
        try {
          await AuthService.refreshToken();
          this.clearSuperTagsLayers(this.map, false);
          this.drawSuperTagsFromUrl(this.map, this.supertagsSourceUrl, this.showClusterLeaves);
        } catch(err) {
          this.logout({vuetify: this.$vuetify});
        }
      } else if(e.sourceId === this.indoorTagsSourceUrl && e.error.url &&
          e.error.url.toLowerCase().indexOf(this.indoorTagsSourceUrl.toLowerCase()) > -1) {
          try {
            await AuthService.refreshToken();
            this.clearIndoorTagsLayers(this.map, true);
            const filterString = this.createFiltersString(this.filters, 'areaId');
            if (this.currentSite.isAf3) {
              this.indoorTagsSourceUrl = `${networkAssetV3Path}tags/indoor/geojson?siteId=${this.siteId}&areaId=${this.mapArea.id}${filterString}`;
            } else {
              this.indoorTagsSourceUrl = `${networkAssetV2Path}tags/indoor/geojson?siteId=${this.siteId}&areaId=${this.mapArea.id}${filterString}`;
            }
            this.drawIndoorAreaTagsFromUrl(this.map, this.indoorTagsSourceUrl, this.showClusterLeaves);
          } catch(err) {
            this.logout({vuetify: this.$vuetify});
          }
      } else if(e.sourceId && e.sourceId.indexOf('zones') > -1 && e.error.url &&
          e.error.url.toLowerCase().indexOf(this.zoneSourceUrl.toLowerCase()) > -1) {
          try {
            await AuthService.refreshToken();
            this.clearZones(this.map);
            this.drawZones(this.map, this.showHistoryBar ? this.historyTagArea.id : this.mapArea.id);
          } catch(err) {
            this.logout({vuetify: this.$vuetify});
          }
      }
    },
    mapSourceRequestHandler(url, resourceType) {
      if (resourceType === 'Source' && 
        (url.toLowerCase().indexOf(this.supertagsSourceUrl.toLowerCase()) > -1 || 
        url.toLowerCase().indexOf(this.indoorTagsSourceUrl.toLowerCase()) > -1 ||
        url.toLowerCase().indexOf(this.zoneSourceUrl.toLowerCase() > -1))
        ) {
        const authData = AuthService.checkLoggedIn();
        const accessToken = authData.access_token;
        return {
            url: url, 
            headers: { authorization: `Bearer ${accessToken}` },
          }
      }
    },
    onActionClick(e){//for mobile version
      e.stopPropagation();
      e.preventDefault();
    },
    onMeasurementChange(value) {
      this.measuringToolActive = value;
      this.map.fire('closeAllPopups');
      this.updateMapCursor();
    },
    handleOnShowHideLocationsChange(value) {
      if (this.map.getLayer(this.af3LocationsLayerId)) {
        this.map.removeLayer(this.af3LocationsLayerId);
        this.map.removeSource(this.af3LocationsLayerId);
      }
      if (value) {
        this.drawAf3LB(this.map, this.mapLocations, this.af3LocationsLayerId);
      }
    },
    drawAf3LB(map, points, deviceLayerId) {
      let af3Collection = this.createFeatureCollection(points, this.currentArea.id);

      if(af3Collection.length > 0){
        if (map.getLayer(deviceLayerId)) {
          let deviceSource = map.getSource(deviceLayerId);
          deviceSource.setData({
            type: 'FeatureCollection',
            features: af3Collection,
          });
        } else {
          map.addSource(deviceLayerId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: af3Collection,
            },
          });
          map.addLayer({
            id: deviceLayerId,
            source: deviceLayerId,
            type: 'symbol',
            layout: {
                'icon-image': 'beacon_cross',
                "icon-offset": [0,-14], 
                'icon-allow-overlap': true,
                'icon-ignore-placement': true
            }
          });
        }
        
        if (this.onTagLayerHoverHandler) {
          map.off('mouseover', deviceLayerId, this.onTagLayerHoverHandler);
        }
        this.onTagLayerHoverHandler = (e) => {
          if (this.measuringToolActive) {
            return;
          }
          const id = e.features[0].properties.popupId;
          if(!document.getElementById(id)){//if exist means that the popup was pinned, so don't create another
            this.map.fire('closePopup');
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = this.popupContent(e.features[0].properties);
            
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            const popup = new mapboxgl.Popup({ closeOnClick: false })
              .setLngLat(coordinates)
              .setHTML(description)
              .addTo(map);
            popup.getElement().id = id;
            //pin the popup
            popup.getElement().getElementsByClassName('pin')[0].addEventListener("click", (e)=>{ 
              popup.options.className = (popup.options.className === "") ? 'pinned' : "";
              if(popup.options.className === 'pinned'){
                e.currentTarget.classList.add('mdi-pin');
                e.currentTarget.classList.remove('mdi-pin-outline');
              }else{
                e.currentTarget.classList.remove('mdi-pin');
                e.currentTarget.classList.add('mdi-pin-outline');
              }
            });
            //close popup on mouseleave
            popup.getElement().addEventListener("mouseleave", (e)=>{ this.map.fire('closePopup'); });
            
            // Add a custom event listener to the map
            map.on('closePopup', () => {
              if(popup.options.className !== 'pinned'){
                popup.remove();
              }
            });
            // Add a custom event listener to the map
            map.on('closeAllPopups', () => {
                popup.remove();
            });
            // Add a custom event listener to the map
            map.on('changePopupMeasure', () => {
              popup.setHTML(this.popupContent(e.features[0].properties, popup.options.className));
            });
          };
        }
        map.on('mouseover', deviceLayerId, this.onTagLayerHoverHandler);
      }
    },
    createFeatureCollection(locations, floorId) {
      const collection = [];
      const floorLocations = locations.filter(location => location.areaId === floorId);

      floorLocations.forEach((point) => {
        if (point.latitude) {
          collection.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [point.latitude, point.longitude],
            },
            properties: {
              popupId: Math.random(),
              popupTitle: this.$t('assets-st-grid-lb-detail'),
              name: point.name ? point.name : '',
              mac: point.macAddress,
              xCoor: point.xCoordinate,
              yCoor: point.yCoordinate,
              zCoor: point.zCoordinate,
              lastEvent: point.lastAf3EventTime
            },
          });
        }
      });

      return collection;
    },
    popupContent(props, className = ""){
      let xCoordinateInMeters = props.xCoor / 10;
      let yCoordinateInMeters = props.yCoor / 10;
      let zCoordinateInMeters = props.zCoor / 10;
      if(this.masureUnit === "1"){
        xCoordinateInMeters = parseFloat(xCoordinateInMeters * feet).toFixed(2);
        yCoordinateInMeters = parseFloat(yCoordinateInMeters * feet).toFixed(2);
        zCoordinateInMeters = parseFloat(zCoordinateInMeters * feet).toFixed(2);
      }
      const unit = this.masureUnit === "0" ? this.$t('assets-st-grid-meters') : this.$t('assets-st-grid-feet');
      return `
            <i aria-hidden="true" medium="" class="v-icon notranslate mdi ${(className === "") ? 'mdi-pin-outline' : 'mdi-pin' } pin"></i>
            <p style='margin-bottom: 0px'><b><u>${props.popupTitle}</u></b></p>
            <p style='margin-bottom: 0px'><b>Name: ${props.name}</b></p>
            <p style='margin-bottom: 0px'><b>Mac address: ${props.mac}</b></p>
            <p style='margin-bottom: 0px'><b>X: </b>${xCoordinateInMeters} ${unit}</p>
            <p style='margin-bottom: 0px'><b>Y: </b>${yCoordinateInMeters} ${unit}</p>
            <p style='margin-bottom: 0px'><b>Z: </b>${zCoordinateInMeters} ${unit}</p>
            <p style='margin-bottom: 0px'><b>Updated: </b>${props.lastEvent}</p>`
    },
    handleOnMeasureUnitChange(value) {
      this.masureUnit = value;
      this.map.fire('changePopupMeasure');
    },
    tagXYZ(value) {
      if (value == AF3_INVALID_COORDINATES.VALUE) {
        return 'N/A';
      } else {
        const unit = this.masureUnit == "0" ? this.$t('assets-st-grid-meters') : this.$t('assets-st-grid-feet');
        return parseFloat((value / 10) * (this.masureUnit == "1" ? feet : 1)).toFixed(2) + ' ' + unit;
      }
    },
    createFiltersString(filters, filterToExclude){
      const filtersList = filters.split('&');
      const excludedFilterIndex = filtersList.findIndex(filterKey => filterKey.includes(filterToExclude));
      filtersList.splice(excludedFilterIndex, 1);
      const filterString = filtersList.join('&');
      return filterString;
    }
  },
};
</script>

<style lang="scss" scoped>

.assets-divider {
  width: 99%;
  margin-left: 4px;
  border-bottom: 1px solid #cfd0d3;
  box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.2);
  margin-bottom: 5px;
}
.assets-list {
  scroll-behavior: smooth;
  overflow-y: auto;
  height: calc(100vh - 311px);
}
.assets-map {
  overflow-y: auto;
  height: calc(100vh - 250px);
  border: 1px solid;
  position: relative;
}
.mapboxgl-map{
  position: absolute;
}
.no-area-modal{
  position: absolute;
  background: #fff;
  opacity: 0.85;
}
.item-container {
  margin-left: 5%;
  width: 100%;
  color: var(--v-primary-darken2);
}
.icons-cont {
  position: absolute;
  top: 13px;
  right: 24px;
}
.name-label {
  width: 60%;
  padding-left: 5px;
  display: inline-block;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 18px;
  font-size: .8rem;
  img{
    margin-right: 10px;
  }
}
.availability-img {
  height: 25px;
  width: 25px;
  margin-top: -3px;
}
.battery-img {
  top: -3px;
  margin-bottom: -2px;
  height: fit-content;
}
.actions {
  height: 20px;
  width: 20px;
}
.map-img {
  height: 260px;
  max-height: 260px;
}
.zone-name {
  font-weight: normal;
  margin-left: 25px;
  width: 55%;
  float: left;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.8rem;
}
.last-seen {
  font-weight: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 126px;
  float: right;
  text-align: right;
  font-size: 0.8rem;
  height: 15px;
}
.item-content {
  background-color: #f7fafa;
  border-left: 5px solid var(--v-primary-base);
  padding-left: 25px;
  color: var(--primary);
  font-size: 0.8rem;
  padding-right: 5px;
  padding-bottom: 15px;
}
.comment-input {
  height: 32px;
  margin-top: 0px !important;
  padding-top: 5px;
  font-size: 12px;
}
.legend-container {
  position: absolute;
  z-index: 1;
  top: 5%;
  left: 2%;
  border: 1px solid white;
  background-color: white;
  border-radius: 3px;
  .supertag-legend {
    padding: 6px;
    position: relative;
    font-size: 12px;
    .legend-item {
      margin: 3px 0px;
      .legend-title {
        margin-left: 5px;
        align-self: center;
      }
      .legend-icon {
        height: 28px;
        width: 18px;
      }
    }
  }
}

.circle {
  height: 12px;
  width: 12px;
  background-clip: 'padding-box';
  border: 2px solid;
  border-radius: 100px;
}

.gps {
  background-color: #5668ff;
  border-color: BLACK;
}

.cellid {
  background-color: #36d123;
  border-color: BLACK;
}

.wifi {
  background-color: #af09f1;
  border-color: BLACK;
}
.no-rows{
  background-color: #f1f3f4;
  p{
    text-align: center;
    margin-top: 25px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--v-primary-darken2);
  }
} 
#pagination{
  position: fixed;
  bottom: 30px;
  height: 40px;
  .goto{
    margin-top: -7px;
  }
  button{
    height: 27px;
  }
  span{
    font-size: 10px;
    height: 27px;
    color: var(--v-secondary-base);
    &.currentPage{
      background-color: var(--v-secondary-base);
      color: #fff;
      min-width: 27px;
      text-align: center;
      padding-top: 5px;
      border-radius: 4px;
    }
  }
 }
.v-card--reveal {
  height: 65px;
  position: sticky;
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: .8;
  width: 100%;
  background-color: var(--v-secondary-base);
  font-size: 19px;
  font-weight: 600;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease-out;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.view-more-btn{
  cursor: pointer;
}
@media (max-width: 768px){
  .assets-list{
    height: auto;
  }
  .v-expansion-panels{
    margin-bottom: 30px;
  }
}
</style>
