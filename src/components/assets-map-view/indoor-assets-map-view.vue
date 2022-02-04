<template>
  <v-row class="mx-0 pb-3">
    <v-col id="assets-map">
      <v-divider v-if="!onlyMap" class="assets-divider" />
      <v-row no-gutters>
        <v-col v-if="!onlyMap" cols="12"  class="assets-list" v-bind:class="{ 'no-rows': !locationFilteredTags.length, 'col-sm-3 col-md-3': (getWindowWidth > sm)  }" ref="panelsContainer" id="scroll-target">
          <p v-if="!locationFilteredTags.length && !this.simpleTag.length">
            {{ $t('table-no-rows') }}
          </p>
          <v-expansion-panels accordion focusable hover v-model="highlightTagIndex" ref="panels" v-scroll:#scroll-target="onScroll">
            <v-expansion-panel
              :ref="'tag-index-'+index"
              v-for="(item, index) in (simpleTag.length === 1 ? simpleTag : locationFilteredTags)"
              :key="item.name + index"
              class="p-1 assets-item"
              @click="onTagSelected(item, true)"
            >
              <v-expansion-panel-header>
                <template v-slot:default="{ open }">
                  <div class="item-container">
                    <div :title="item.name" class="ag-body-viewport name-label">
                      <v-img
                        class="float-left mr-1"
                        :src="tagIcons[item.source.toLowerCase()]"
                        height="12"
                        width="8"
                      ></v-img>
                      {{ item.name }}
                      <!--v-icon
                        small
                        v-if="open"
                        key="0"
                        v-text="'mdi-pencil'"
                        @click="editListItem(item.name)"
                      ></v-icon-->
                    </div>
                    <div class="float-right d-flex">
                      <v-img
                        class="battery-img mt-1 mr-1"
                        v-if="item.batteryStatus !== null && item.batteryStatus !== undefined"
                        :src="getBatteryIcon(item.batteryStatus)"
                      ></v-img>
                      <span class="mr-1" v-else>-- --</span>
                      <!-- HISTORY PLAY BUTTON START -->
                        <button v-if="item.showPlayBtn" @click="onPlayHistory($event)">
                          <v-icon v-if="showPlayButton" color="secondary" size="20">mdi-play-circle</v-icon>
                          <v-icon v-if="!showPlayButton" size="20">mdi-pause-circle</v-icon>
                        </button>
                      <!-- HISTORY PLAY BUTTON END -->
                    </div>

                    <div class="mt-2 ag-body-viewport float-right w-100">
                      <div class="zone-name pb-1">
                        {{ item.zoneName ? item.zoneName : '-- --' }}
                      </div>
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
                      <div class="mt-2">{{ currentSiteLabels.group }}</div>
                      <div class="big-text">{{ item.groupName ? item.groupName : '-- --' }}</div>
                      <div class="mt-2">{{ currentSiteLabels.field1 }}</div>
                      <div class="big-text">{{ item.field1 ? item.field1 : '-- --' }}</div>
                      <div class="mt-2">{{ currentSiteLabels.field2 }}</div>
                      <div class="big-text">{{ item.field2 ? item.field2 : '-- --' }}</div>
                      <v-btn
                        v-if="item.latitude && item.longitude"
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
            <transition name="fade">
              <div
                v-if="viewMore"
                class="d-flex v-card--reveal white--text"
                v-bind:class="{ 'view-more-btn': viewMoreText === 'assets-view-more-click' }"
                @click="onLoadMore()"
              >
                {{ $t(viewMoreText) }}
              </div>
            </transition>
            <div class="infinite-pagination" v-if="locationFilteredTags.length > 0 && simpleTag.length !== 1">
              {{$t('pagination-viewing')}}&nbsp;
              <span class="font-weight-bold">{{ locationFilteredTags.length }}&nbsp;</span>
              {{$t('pagination-viewing-of')}}&nbsp;
              <span class="font-weight-bold">{{ totalRows }}</span>
            </div>
          </v-expansion-panels>
        </v-col>

        <v-col :cols="onlyMap ? 12 : 9" class="assets-list" :style="styles">
            <div id="MapwizeUI"></div>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { scrollMixin } from "../../mixins/scrollParentToChild"
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import bbox from '@turf/bbox';
import mapGL from '../map/map'
import MapHistoryBar from '../map-history-bar/map-history-bar.vue';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { removeMarker, fitPolygon, getFirstLayer, clearLayers } from '../../utils/map';
import AuthService from '../../services/auth';
import MapwizeUI from 'mapwize-ui';

import constants from '../../constants/resolutions-constants';
const networkAssetV2Path = `${process.env.VUE_APP_NETWORK_ASSETS_URL}/networkAsset/airfinder/v2/`;
const usaCenterLong = -100.4458825;
const usaCenterLat = 39.7837304;
export default {
  components: {
    mapGL,
    MapHistoryBar
  },
  mixins: [scrollMixin],
  props: {
    siteId: null,
    inputArea: null,
    mapData: null,
    filters: null,
    showSingleTag: null,
    totalRows: null,
    mapLocations: null,
    mapZones: null,
    comment: null,
    onlyMap: null,
    readOnly: null,
    styles: null,
  },
  data() {
    return {
      mapwizeUI : {},
      sm: constants.IPAD_PORTRAIT,
      map: null,
      mapLoaded: false,
      selectedTag: null,
      filteredLocation: null,
      highlightTagIndex: null,
      superTagsLayerId: 'super-tags-airfinder',
      superTagsFromUrlLayerId: 'all-super-tags-airfinder',
      superTagsClusterLayerId: 'super-tags-cluster-airfinder',
      superTagsClusterCountLayerId: 'super-tags-cluster-count-airfinder',
      superTagLayerClickHandler: {},
      superTagClusterLayerClickHandler: {},
      locationLayerClickHandler: {},
      onMouseEnterLocationHandler: {},
      onMouseLeaveLocationHandler: {},
      showHistoryBar: false,
      tagIcons: {
        gps: require('../../assets/img/map/pin_gps.png'),
        wifi: require('../../assets/img/map/pin_wifi.png'),
        cellid: require('../../assets/img/map/pin_cell.png'),
      },
      availabilityIcon: require('../../assets/img/aggrid/logo_transparent.png'),
      userAvatar: require('../../../src/assets/img/user-circle.png'),
      mapTags: [],
      simpleTag: [],
      isGeoReferenced: false,
      indoorMapOptions: {
        minZoom: 10,
        maxZoom: 14,
      },
      outdoorMapOptions: {},
      viewMore: false,
      viewMoreText: 'assets-view-more',
      supertagsSourceUrl: null,
      accessToken: null,
      clusterLeaves: [],
      clusterLeaveIndex: 0,
      clusterPopup: null,
      singleTag: this.showSingleTag,
      playHistory: false,
      showPlayButton: true
    };
  },
  computed: {
    ...mapGetters('area', ['currentArea']),
    ...mapGetters('site', ['currentSiteLabels']),
    ...mapGetters('tag', ['getMapTagsScroll']),
    ...mapGetters('layout', ['getWindowWidth']),
    mapArea: function () {
      return this.inputArea || this.currentArea;
    },
    locationFilteredTags: function() {
      let filteredTags = [...this.mapData];
      if (this.filteredLocation) {
        filteredTags = filteredTags.filter(tag => tag.location.id === this.filteredLocation.id);
      }
      return filteredTags;
    }
  },
  watch: {
    mapData(newMapData) {
      if(this.clusterPopup){
        this.clusterPopup.remove();
      }
      this.viewMore = false;
      this.mapTags = Array.from(newMapData);
      this.simpleTag = [];

      if(!this.mapLoaded) {
        return;
      }
      if (this.mapTags && this.mapTags.length) {
        if (this.isGeoReferenced) {
          //execute only if a filter was applied, not if mapData changed because of loadMore
          if(this.supertagsSourceUrl !== `${networkAssetV2Path}supertags/geojson?siteId=${this.siteId}${this.filters}`){
            this.supertagsSourceUrl = `${networkAssetV2Path}supertags/geojson?siteId=${this.siteId}${this.filters}`;
            this.drawSuperTagsFromUrl(this.map, this.supertagsSourceUrl, this.showClusterLeaves);
          }
          
        } else {
          this.drawLocations(this.map, this.mapLocations, this.mapTags);
        }
        if(this.mapTags.length < this.totalRows){
          this.viewMore = true;
        }
      }
    },
    mapArea(newArea, oldArea) {
      if(!this.mapLoaded) {
        return;
      }

      if (!this.mapArea || !this.mapArea.id) {
        this.isGeoReferenced = true;
        clearLayers(this.map);
        return;
      }

      const geoReferenced = newArea.assetInfo.metadata.props.geoReferenced === 'true';
      
      this.singleTag = null;
      this.highlightTagIndex = null;
      this.selectedTag = null;
      this.filteredLocation = null;        
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
        // this.drawSuperTags(this.map, this.mapTags, this.onTagSelected);
      } else if (
        newArea && newArea.id &&
        newArea.assetInfo.metadata.props.indoorMapping &&
        !this.isGeoReferenced
      ) {
        clearLayers(this.map);
        this.fetchIndoorPlan(newArea.id)
      } else {
        this.clearAreaPolygon(this.map);
      }

      let areaZones = this.mapZones && newArea.id in this.mapZones ? this.mapZones[newArea.id] : [];
      this.drawZones(this.map, areaZones);          
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
    if(!this.singleTag && (this.mapTags.length < this.totalRows)){
      if((this.$refs.panels.$el.offsetHeight < this.$refs.panelsContainer.offsetHeight) || (this.getWindowWidth <= this.sm)){
        this.viewMoreText = 'assets-view-more-click';
      }else{
        this.viewMoreText = 'assets-view-more';
      }
    }
    if(this.simpleTag.length === 1){
      this.highlightTagIndex = 0;
    }
  },
  mounted() {
    this.supertagsSourceUrl = `${networkAssetV2Path}supertags/geojson?siteId=${this.siteId}${this.filters}`;
    const authData = AuthService.checkLoggedIn();
    this.accessToken = authData.access_token;
    this.outdoorMapOptions = {
      transformRequest: this.mapSourceRequestHandler
    }
    this.mapTags = Array.from(this.mapData || []);
    if(this.mapTags.length < this.totalRows){
      this.viewMore = true;
    }
    if(this.getMapTagsScroll){
      this.$refs.panels.$el.parentElement.scrollTo(0, this.getMapTagsScroll);
    }
    this.initMapize();
  },
  beforeDestroy() {
    if(this.selectedTag){
      this.$set(this.selectedTag, 'showPlayBtn', false);
    }
  },
  methods: {
    ...mapActions('tag', ['getTagHistory', 'getTag']),
    ...mapActions('area', ['getAreaIndoorFile']),
    ...mapMutations('tag', ['setMapTagsScroll']),
    initMapize() {
      console.log('mapwize');
      let self = this;
      let options = {
        apiKey: 'cd1486afd117494842e165e26b25bc27',
        container: 'MapwizeUI',
        mainColor: '#00a1c0', 
        center: [-76.492180, 38.978443],
	      zoom:  5,
      }
      MapwizeUI('MapwizeUI', options).then((resp)=>{
        Object.assign(self.mapwizeUI, resp);
        //self.addMarkers(resp);
      })
    },
    showHistoryPlayBtn(value){
      this.$set(this.selectedTag, 'showPlayBtn', value);
    },
    onLoadMore(){
      if(this.viewMoreText === 'assets-view-more-click'){
        this.$emit('loadMore');
      }
    },
    onScroll(e){
      if(!this.filteredLocation && (this.getWindowWidth > this.sm)){
        this.viewMore = false;
        this.setMapTagsScroll(e.target.scrollTop);
        if((this.$refs.panels.$el.offsetHeight - this.$refs.panelsContainer.offsetHeight) === e.target.scrollTop){
          this.$emit('loadMore');
        }
      }
    },
    onLoad(mapRef) {
      this.map = mapRef;
      this.mapLoaded = true;

      let geoReferenced = true;

      if (this.mapArea && this.mapArea.id) {
        geoReferenced = this.mapArea.assetInfo.metadata.props.geoReferenced === 'true';
      }

      if (this.isGeoReferenced !== geoReferenced) {
        this.isGeoReferenced = geoReferenced;
        this.mapLoaded = false;
        return
      }

      this.highlightTagIndex = null;
      this.selectedTag = null;
      this.filteredLocation = null;
      this.clearHistory();

      if (this.isGeoReferenced) {
        if (this.singleTag) {
          this.drawSuperTags(this.map, this.singleTag);
          this.map.flyTo({ center: [this.singleTag[0].longitude, this.singleTag[0].latitude] });
        } else {
          const tagsLayer = this.drawSuperTagsFromUrl(
            this.map,
            this.supertagsSourceUrl,
            this.showClusterLeaves
          );
        }
      } else if (this.mapTags && this.mapTags.length) {
          const tagsLayer = this.drawLocations(
            this.map,
            this.mapLocations,
            this.mapTags
          );
      }

      if (
        this.mapArea &&
        this.mapArea.assetInfo &&
        this.mapArea.assetInfo.metadata.props.polygon &&
        this.isGeoReferenced
      ) {
        this.drawAreaPolygon(
          this.map,
          this.mapArea.assetInfo.metadata.props.polygon,
          'outdoor-area',
          true,
          true
        );
      } else if (
        this.mapArea &&
        this.mapArea.assetInfo &&
        this.mapArea.assetInfo.metadata.props.indoorMapping && 
        !this.isGeoReferenced
      ) {
        this.fetchIndoorPlan(this.mapArea.id)
      }

      let areaZones = this.mapZones && this.mapArea.id in this.mapZones ? this.mapZones[this.mapArea.id] : [];
      this.drawZones(this.map, areaZones);        

    },
    // TODO remove to a mixin. Code repeated in battery-level-cell.js
    getBatteryIcon(id) {
      let img = '';
       switch (id) {
        case 0:
          img = require('../../assets/img/aggrid/battery-low.png');
          break;
        case 1:
          img = require('../../assets/img/aggrid/battery-full.png');
          break;  
        case 2:
          img = require('../../assets/img/aggrid/battery-half.png');
          break;
      }
      return img;
    },
    editListItem(id) {
      //edit list map item
      console.log(id);
    },
    drawSuperTags(map, tagData, onTagClick) {
      const superTagsLayer = this.superTagsLayerId
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
            'icon-image': 'tag',
            'icon-offset': [0, -24],
            'icon-allow-overlap': true,
          },
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
      const superTagsLayer = this.superTagsFromUrlLayerId;
      const superTagsClusterLayer = this.superTagsClusterLayerId;
      const superTagsClusterCountLayer = this.superTagsClusterCountLayerId;

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
            'icon-image': 'tag',
            'icon-offset': [0, -24],
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
            clusterSource.getClusterLeaves(clusterId, point_count, 0, function(err, clusterFeatures){
            onTagClick(clusterFeatures);
          })
          } else {
            onTagClick(features);
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
    drawLocations(map, locations, tags) {
      let filteredTags = [...tags];
      let locationTags = filteredTags.reduce((filteredTags, tag) => {
        if (tag.location && tag.location.id) {
          if (tag.location.id in filteredTags) {
            filteredTags[tag.location.id].push(tag);
          } else {
            filteredTags[tag.location.id] = [tag];
          }
        }
        return filteredTags;
      }, {});

      let locationList = []
      if(locations){
        locationList = [... locations];
      }
      const collection = [];
      locationList.forEach(location => {
        if (location.point && location.id in locationTags && locationTags[location.id].length) {
          collection.push({
            type: "Feature",
            geometry: {
              type: 'Point',
              coordinates: location.point
            },
            properties: {
              title: locationTags[location.id].length,
              locationId: location.id
            }
          })
        }
      })
      const pointLayerId = this.drawPoints(
        map,
        collection,
        'tags',
        'circle'
      );

      if (this.locationLayerClickHandler) {
        map.off('click', pointLayerId, this.locationLayerClickHandler);
        map.off('mouseenter', pointLayerId, this.onMouseEnterLocationHandler);
        map.off('mouseleave', pointLayerId, this.onMouseLeaveLocationHandler);
      }

      this.locationLayerClickHandler = (e) => {
        const locationId = e.features[0].properties.locationId;
        const selectedLocation = this.mapLocations.find(location => location.id === locationId);
        if (selectedLocation) {
          this.selectedTag = null;
          this.highlightTagIndex = null;
          this.filteredLocation = selectedLocation;
          this.drawLocations(map, [selectedLocation], this.mapTags);
        }
      }

      this.onMouseEnterLocationHandler = () => (map.getCanvas().style.cursor = 'pointer');
      this.onMouseLeaveLocationHandler = () => (map.getCanvas().style.cursor = '');

      map.on('click', pointLayerId, this.locationLayerClickHandler);
      map.on('mouseenter', pointLayerId, this.onMouseEnterLocationHandler);
      map.on('mouseleave', pointLayerId, this.onMouseLeaveLocationHandler);
    },
    drawPoints(map, points, id, type = 'circle') {
      const pointsLayerId = `${id}-points-airfinder`;
      const pointsCountsLayerId = `${id}-points-counts-airfinder`;
      if (map.getLayer(pointsLayerId)) {
        let countsLayer = map.getSource(pointsCountsLayerId);
        countsLayer.setData({
          type: 'FeatureCollection',
          features: points
        });
        let pointsLayer = map.getSource(pointsLayerId);
        pointsLayer.setData({
          type: 'FeatureCollection',
          features: points
        });
      }
      else {
        let opts = {
          id: pointsLayerId,
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: points
            }
          }
        };
        if (type === 'circle') {
          opts.paint = {
            'circle-radius': 14,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#5668ff',
            'circle-color': '#5668ff'
          }
        } else {
          opts.paint = {
            'circle-radius':
            {
              stops: [[1, 2], [8, 3], [10, 4]]
            },
            'circle-color': '#5668ff',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#333333'
          }
        }
        map.addLayer(opts);

        map.addLayer({
          id: pointsCountsLayerId,
          type: 'symbol',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: points
            }
          },
          layout: {
            'text-field': '{title}',
            'text-font': ['Montserrat ExtraBold'],
            'text-anchor': 'center',
            'text-allow-overlap': true,
            'icon-allow-overlap': true
          },
          paint: {
            'text-color': 'white'
          }
        });
      }
      return pointsLayerId;
    },
    async fetchIndoorPlan (areaId) {
      const areaFileMapping = await this.getAreaIndoorFile({ areaId });
      this.drawAreaIndoorPlan(this.map, areaFileMapping);
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
            'fill-color': isArea ? '#5668ff' : '#eb4986',
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
            'line-width': 6,
            'line-color': isArea ? '#5668ff' : '#eb4986',
          },
        });
      }

      fitBounds && fitPolygon(map, polygon);

      // To create Area Polygons beneath the supertags
      if (this.map.getLayer(this.superTagsFromUrlLayerId)) { 
        this.map.moveLayer(areaPolygonLayer, this.superTagsFromUrlLayerId);
      }
    },
    drawZones(map, zones) {
      if (zones) {
        zones.forEach(zone => {
          if (zone.polygon) {
            this.drawAreaPolygon(map, zone.polygon, zone.id, false, false);
          }
        });
      }
    },
    clearAreaPolygon(map) {
      let { layers, sources } = map.getStyle();
      const areaPolygonLayer = 'outdoor-area-polygon-airfinder';
      const areaFillPolygonLayer = 'outdoor-area-fill-polygon-airfinder';
      if (map.getLayer(areaPolygonLayer)) {
        map.removeLayer(areaPolygonLayer);
        map.removeSource(areaPolygonLayer);
      }
      if (map.getLayer(areaFillPolygonLayer)) {
        map.removeLayer(areaFillPolygonLayer);
        map.removeSource(areaFillPolygonLayer);
      }
    },
    clearHistory() {
      this.showHistoryBar = false;
      removeMarker(this.map);
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
    onTagSelected(tag, fromList) {
      if(this.clusterPopup){
        this.clusterPopup.remove();
      }
      
      if(this.showHistoryBar){
        this.onHistoryClear(true);
      }
      if(this.selectedTag === tag){//if click on an already selected tag => deselect it
        this.selectedTag = null;
        this.simpleTag = [];
        this.mapTags = Array.from(this.mapData);
        if(!fromList){
          this.highlightTagIndex = null;
        }
        if(this.isGeoReferenced) {
          if (this.map.getLayer(this.superTagsLayerId)) {
            this.map.removeLayer(this.superTagsLayerId);
            this.map.removeSource(this.superTagsLayerId);
          }
          this.drawSuperTagsFromUrl(this.map, this.supertagsSourceUrl, this.showClusterLeaves);
        } else {
          if (!fromList) {
            return;
          }
          const locations =  this.filteredLocation ? [this.filteredLocation] : this.mapLocations;
          this.drawLocations(this.map, locations, this.mapData);
        }
      }else{
        if(this.isGeoReferenced) {
          if(tag.latitude && tag.longitude){
            this.selectedTag = tag;
            if (this.map.getLayer(this.superTagsFromUrlLayerId)) {
              this.map.removeLayer(this.superTagsFromUrlLayerId);
              this.map.removeLayer(this.superTagsClusterLayerId);
              this.map.removeLayer(this.superTagsClusterCountLayerId);
            }
            this.hideClusterLeaves();
            this.mapTags = [tag]; //keep on map only the selected tag
            this.drawSuperTags(this.map, this.mapTags, this.onTagSelected);
            if(!fromList && this.simpleTag.length === 0){ //open the tag on the list
              this.highlightTagIndex = this.mapData.findIndex((item) => item.id === tag.id);
              scrollMixin.methods.scrollParentToChild(this.$refs.panelsContainer, this.$refs['tag-index-' + this.highlightTagIndex][0].$el);
            }
            this.map.flyTo({ center: [tag.longitude, tag.latitude] });
          }else{
            this.$toasted.show(this.$t('assets-undefined-lng-lat'), { 
              position: "bottom-right",
              className: ['toast-error'], 
              duration : 1500
            });
          }
        } else {
          this.selectedTag = tag;
          if(!fromList){ //open the tag on the list
            this.highlightTagIndex = this.mapData.findIndex((item) => item.id === tag.id);
            scrollMixin.methods.scrollParentToChild(this.$refs.panelsContainer, this.$refs['tag-index-' + this.highlightTagIndex][0].$el);
          }
          this.drawLocations(this.map, this.mapLocations, [this.selectedTag]);
        }
      }
    },
    onViewHistory() {
      this.clearHistory();
      this.showHistoryBar = true;
    },
    async onHistorySubmit() {
      clearLayers(this.map);
      removeMarker(this.map);
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
      if(this.mapArea && this.mapArea.id){
        this.drawAreaPolygon(
          this.map,
          this.mapArea.assetInfo.metadata.props.polygon,
          'outdoor-area',
          true,
          fitBoundArea
        );
        this.drawZones(this.map, this.mapZones[this.mapArea.id]);
      }
    },
    onPlayHistory(e){
      e.preventDefault();
      e.stopPropagation();
      this.playHistory = !this.playHistory;
      this.showPlayButton = !this.showPlayButton;
    },
    onCancelLocationFilter() {
      this.highlightTagIndex = null;
      this.filteredLocation = null;
      this.selectedTag = null
      this.drawLocations(this.map, this.mapLocations, this.mapTags);
    },
    showClusterLeaves(leaves) {
      if (leaves && leaves.length) {
        this.clusterLeaveIndex = 0;
        this.clusterLeaves = leaves;
        this.clusterPopup = new mapboxgl.Popup({ offset: [0, -15], closeOnMove: true }).setLngLat(leaves[0].geometry.coordinates);
        this.setClusterPopup();
        this.clusterPopup.addTo(this.map);

        this.clusterPopup.getElement().addEventListener('click', (e) => {
          if(e.srcElement.localName === 'a'){
            if(e.srcElement.className === 'arrowRight'){
              this.showNextLeaf(true);
            }else{
              this.showNextLeaf(false);
            }
          }
        });
      }
    },
    hideClusterLeaves() {
      this.clusterLeaveIndex = 0;
      this.clusterLeaves = [];
    },
    showNextLeaf(next) {
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
      this.setClusterPopup();
    },
    setClusterPopup(){
      this.clusterPopup.setHTML(`<div class="d-flex justify-center mx-2">
                  <a class="arrowLeft"><&nbsp;&nbsp;</a>
                    <label>`+ this.$t("assets-cluster-showing") + '&nbsp;' + (this.clusterLeaveIndex + 1) + '&nbsp;' + this.$t("assets-cluster-of") + '&nbsp;' + this.clusterLeaves.length + `</label>
                  <a class="arrowRight"">&nbsp;&nbsp;></a>
                </div>
                <div class="d-flex justify-center mt-2">
                  <h2>`+ this.clusterLeaves[this.clusterLeaveIndex].properties.name + `</h2>
                </div>`);
    },
    mapSourceRequestHandler(url, resourceType) {
      if (resourceType === 'Source' && url.toLowerCase().indexOf(this.supertagsSourceUrl.toLowerCase()) > -1) {
        return {
            url: url, 
            headers: { authorization: `Bearer ${this.accessToken}` },
          }
      }
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
.assets-list, .assets-map {
  overflow-y: auto;
  height: calc(100vh - 270px);
}
.assets-map{
  min-height: 445px;
}
.item-container {
  margin-left: 5%;
  width: 100%;
  color: var(--v-primary-darken2);
}
.name-label {
  width: 84%;
  padding-left: 5px;
  display: inline-block;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 18px;
}
.availability-img {
  height: 25px;
  width: 25px;
  margin-top: -3px;
}
.battery-img {
  height: 11px;
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
      }
    }
  }
}

.location-detail {
  position: absolute;
  background-color: #f5f5f5;
  right: 2%;
  top: 5%;
  padding: 10px;
  z-index: 1;
  border-radius: 3px;
  text-align: center;
  .divider{
    margin: 5px 0px 5px 0px;
  }
  .option {
    cursor: pointer;
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
.infinite-pagination{
  position: fixed;
  bottom: 20px;
  color: var(--v-primary-darken2);
  font-size: 13px;
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
  .infinite-pagination{
    position: absolute;
    bottom: -29px;
  }
}
#MapwizeUI {
    top:0; 
    bottom:0; 
    width:100%; 
    height: 100%;
 }
</style>
