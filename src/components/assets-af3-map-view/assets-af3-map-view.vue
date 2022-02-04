<template>
  <div class="mx-3 pb-3">
    <v-row>
      <v-col md="3" class="pt-0">
        <v-autocomplete
          id="areas"
          :items="floors"
          item-text="value"
          item-value="id"
          :label="$t('supertag-settings-select')"
          no-data-text="No Floors Available"
          v-model="selectedFloor"
          v-on:change="onFloorChange"
          hide-details
          solo
          dense
          outlined
          return-object
        >
        </v-autocomplete>
      </v-col>
      <v-col cols="9" class="pt-1">
        <div class="float-right">
          <v-btn
            id="refresh"
            height="32"
            :depressed="true"
            @click="refreshFloor"
            class="primary--text font-weight-bold"
            color="primaryLight"
            >{{ $t('assets-st-refresh') }}</v-btn
          >
        </div>
        <div class="float-right mr-2">
          <v-btn
            id="refresh"
            height="32"
            :depressed="true"
            @click="liveRefresh = !liveRefresh; liveRefreshFloor()"
            :class="!liveRefresh ? 'primary--text font-weight-bold' : 'font-weight-bold'"
            :color="liveRefresh ? 'primary' : 'primaryLight'"
            >{{ $t('assets-st-live') }}</v-btn
          >
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="af3-map">
        <mapGL
          key="indoor-map"
          styleType="clear"
          :options="indoorMapOptions"
          :readOnly="readOnly"
          @onLoad="onLoad"
        >
        <MapGrid
          v-if="areaFileMapping"
          :areaFileMapping="areaFileMapping"
          :showHideLocationsTool="true"
          :showHideBoundedErrorTool="true"
          :draggable="true"
          :map="map"
          :selectedFloor="selectedFloor"
          :floorData="floorData"
          @onMeasurementChange="onMeasurementChange"
          @onShowHideLocationsChange="handleOnShowHideLocationsChange"
          @onShowHideBoundedErrorChange="handleOnShowHideBoundedErrorChange"
        />
        </mapGL>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import mapGL from '../map/map.vue';
import SearchBar from '../search-bar/search-bar';
import MapGrid from '../shared/af3-map-tools/af3-map-tools';
import {
  drawAreaIndoorPlan,
  clearLayers,
  setAf3MapZoom,
  addPolygonsSourceToMap,
  addFillPolygonAndLineToMap
} from '../../utils/map';
import { newLatLong } from '../../utils/calculateLatLng';
import { NODE_ADDRESS_PATTERN } from '../../constants/regex';
import { mapGetters, mapActions } from 'vuex';
import AuthService from '../../services/auth';
const networkAssetPath = `${process.env.VUE_APP_NETWORK_ASSETS_URL}/networkAsset/airfinder/`;
const feet = 3.28084;

export default {
  components: {
    mapGL,
    MapGrid,
    SearchBar,
  },
  props:{
    siteHasChanged: null
  },
  data() {
    return {
      readOnly: false,
      map: null,
      markerIndex: 0,
      floors: [],
      areaTags: [],
      selectedFloor: null,
      af3TagsLayerId: 'af3-tags-airfinder',
      locationsLayerId: 'locations-airfinder',
      zonesLayerId: 'zones-polygon-airfinder',
      zoneSourceUrl: null,
      confidenceSourceId: 'confidence-layer-airfinder',
      onTagLayerClickHandler: null,
      nodeAddressRegex: new RegExp(NODE_ADDRESS_PATTERN),
      indoorMapOptions: {
        minZoom: 10,
        maxZoom: 14,
        transformRequest: this.mapSourceRequestHandler
      },
      referencePoint: [0, 0],
      scale: 100,
      liveRefresh: false,
      floorData: null,
      areaFileMapping: null,
      unitGrid: "0"
    };
  },
  watch: {
    siteHasChanged(){
      if(this.siteHasChanged){
        this.map.fire('closeAllPopups');
        this.initView();
      }
    }
  },
  computed: {
    ...mapGetters('site', ['currentSite']),
    ...mapGetters('area', ['areas']),
    ...mapGetters('location', ['locations']),
  },
  methods: {
    ...mapActions('area', ['getAreaIndoorFile', 'getAF3Points']),
    ...mapActions('zone', ['getZoneByArea']),
    ...mapActions('tag', ['getAF3TagsInArea']),
    async onLoad(mapRef) {
      this.map = mapRef;
      this.initView();
    },
    async initView(){
      this.map && clearLayers(this.map);
      this.areaFileMapping = null;
      this.floorData = null;
      this.floors = this.areas;

      if (this.floors.length) {
        this.selectedFloor = this.floors[0];
        this.initMapData(this.selectedFloor.id);
      }
    },
    async fetchIndoorPlan(areaId) {
      this.areaFileMapping = await this.getAreaIndoorFile({ areaId });
      drawAreaIndoorPlan(this.map, this.areaFileMapping);
    },
    drawDevices(map, points, deviceLayerId, isTag) {
      let af3Collection = this.createFeatureCollection(points,isTag);
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

          if(isTag){
            map.addLayer({
              id: deviceLayerId,
              source: deviceLayerId,
              type: 'symbol',
              layout: {
                  'icon-image': 'tag_cross',
                  "icon-offset": [-6,-16], 
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true
              }
            });
          }else{
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
        }

        if (this.onTagLayerHoverHandler) {
          map.off('mouseover', deviceLayerId, this.onTagLayerHoverHandler);
        }

        this.onTagLayerHoverHandler = (e) => {
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
    popupContent(props, className = ""){
      let xCoordinateInMeters = props.xCoor / 10;
      let yCoordinateInMeters = props.yCoor / 10;
      let zCoordinateInMeters = props.zCoor / 10;
      if(this.unitGrid === "1"){
        xCoordinateInMeters = parseFloat(xCoordinateInMeters * feet).toFixed(2);
        yCoordinateInMeters = parseFloat(yCoordinateInMeters * feet).toFixed(2);
        zCoordinateInMeters = parseFloat(zCoordinateInMeters * feet).toFixed(2);
      }
      const unit = this.unitGrid === "0" ? this.$t('assets-st-grid-meters') : this.$t('assets-st-grid-feet');
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
    onMeasurementChange(unitGrid){
      this.unitGrid = unitGrid;
      this.map.fire('changePopupMeasure');
    },
    handleOnShowHideLocationsChange(value) {
      if (this.map.getLayer(this.locationsLayerId)) {
        this.map.removeLayer(this.locationsLayerId);
        this.map.removeSource(this.locationsLayerId);
      }
      if (value) {
        const floorLocations = this.locations.filter(location => location.areaId === this.selectedFloor.id)
        this.drawDevices(this.map, floorLocations, this.locationsLayerId, false);
      }
    },
    handleOnShowHideBoundedErrorChange(value){
      if (this.map.getSource(this.confidenceSourceId)) {
        this.map.removeLayer('fill-'+this.confidenceSourceId);
        this.map.removeLayer('line-'+this.confidenceSourceId);
        this.map.removeSource(this.confidenceSourceId);
      }
      if (value) {
        this.drawConfidence();
      }
    },
    drawZones(map, areaId) {
      this.zoneSourceUrl = `${networkAssetPath}zones/geojson?areaId=${areaId}`;
      const sourceId = addPolygonsSourceToMap(map, this.zoneSourceUrl, this.zonesLayerId);
      const layerId = addFillPolygonAndLineToMap(map, sourceId, '#eb4986');
      if(this.map.getLayer(this.af3TagsLayerId)){
        this.map.moveLayer(layerId, this.af3TagsLayerId);
      }
    },
    drawConfidence(){
      let polygons = [];
      this.areaTags.forEach( tag => {
        if(tag.xConfidence && tag.yConfidence){
          const rightLatLng = newLatLong(Number(tag.xCoordinate) / 10, (Number(tag.yCoordinate) + Number(tag.yConfidence)) / 10, Number(tag.zCoordinate) /10 , this.scale, this.referencePoint);
          const leftLatLng = newLatLong(Number(tag.xCoordinate) / 10, (Number(tag.yCoordinate) - Number(tag.yConfidence)) / 10, Number(tag.zCoordinate) /10 , this.scale, this.referencePoint);
          const topLatLng = newLatLong((Number(tag.xCoordinate) + Number(tag.xConfidence)) / 10, Number(tag.yCoordinate) / 10, Number(tag.zCoordinate) /10 , this.scale, this.referencePoint);
          const bottomLatLng = newLatLong((Number(tag.xCoordinate) - Number(tag.xConfidence)) / 10, Number(tag.yCoordinate) / 10, Number(tag.zCoordinate) /10 , this.scale, this.referencePoint);

          const polygon = [[topLatLng[0], leftLatLng[1]], [topLatLng[0], rightLatLng[1]], [bottomLatLng[0], rightLatLng[1]], [bottomLatLng[0], leftLatLng[1]], [topLatLng[0], leftLatLng[1]]];
          polygons.push(polygon);
        }
      });
      if(polygons.length > 0){
        addPolygonsSourceToMap(this.map, polygons, this.confidenceSourceId);
        const layerId = addFillPolygonAndLineToMap(this.map, this.confidenceSourceId, '#d02c39', 2);

        if(this.map.getLayer(this.af3TagsLayerId)){
          this.map.moveLayer(layerId, this.af3TagsLayerId);
        }
      }
    },
    createFeatureCollection(tags, isTag) {
      const collection = [];
      tags.forEach((point) => {
        if(point.latitude && point.longitude){
          collection.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [point.latitude, point.longitude],
            },
            properties: {
              popupId: Math.random(),
              popupTitle: isTag ? this.$t('assets-st-grid-tag-detail') : this.$t('assets-st-grid-lb-detail'),
              name: point.name ? point.name : '',
              mac: point.macAddress,
              xCoor: point.xCoordinate,
              yCoor: point.yCoordinate,
              zCoor: point.zCoordinate,
              lastEvent: point.lastEventTime ? point.lastEventTime : '--'
            },
          });
        }
      });

      return collection;
    },
    createMarker(coords, map, color = '#faff67') {
      let sourceId = `selected-event${this.markerIndex++}-airfinder`;

      let source = {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coords,
          },
        },
      };

      map.addSource(sourceId, source);
      map.addLayer({
        id: sourceId,
        source: sourceId,
        type: 'circle',
        paint: {
          'circle-radius': 6,
          'circle-color': '#fe0000'
        }
      });
    },
    CreateFloorCorners(floor) {
      // TOP LEFT
      this.createMarker([floor.nwCorner.lng, floor.nwCorner.lat], this.map);

      // BOTTOM LEFT
      this.createMarker([floor.nwCorner.lng, floor.seCorner.lat], this.map);

      // BOTTOM RIGHT
      this.createMarker([floor.seCorner.lng, floor.seCorner.lat], this.map);

      // // TOP RIGHT
      this.createMarker([floor.seCorner.lng, floor.nwCorner.lat], this.map);
    },
    drawLineString(map) {
      // GeoJSON object to hold our measurement features
      let geojson = {
        type: 'FeatureCollection',
        features: [],
      };

      // Used to draw a line between points
      let linestring = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      };

      map.addSource('geojson-airfinder', {
        type: 'geojson',
        data: geojson,
      });

      // Add styles to the map
      map.addLayer({
        id: 'measure-points-airfinder',
        type: 'circle',
        source: 'geojson-airfinder',
        paint: {
          'circle-radius': 5,
          'circle-color': '#000',
        },
        filter: ['in', '$type', 'Point'],
      });

      map.addLayer({
        id: 'measure-lines-airfinder',
        type: 'line',
        source: 'geojson-airfinder',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#000',
          'line-width': 2.5,
        },
        filter: ['in', '$type', 'LineString'],
      });

      map.on('click', function (e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ['measure-points-airfinder'],
        });

        // Remove the linestring from the group
        // So we can redraw it based on the points collection
        if (geojson.features.length > 1) geojson.features.pop();

        // If a feature was clicked, remove it from the map
        if (features.length) {
          var id = features[0].properties.id;
          geojson.features = geojson.features.filter(function (point) {
            return point.properties.id !== id;
          });
        } else {
          var point = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [e.lngLat.lng, e.lngLat.lat],
            },
            properties: {
              id: String(new Date().getTime()),
            },
          };

          geojson.features.push(point);
        }

        if (geojson.features.length > 1) {
          linestring.geometry.coordinates = geojson.features.map(function (
            point
          ) {
            return point.geometry.coordinates;
          });

          geojson.features.push(linestring);
        }

        map.getSource('geojson-airfinder').setData(geojson);
      });

      map.on('mousemove', function (e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ['measure-points-airfinder'],
        });
        // UI indicator for clicking/hovering a point on the map
        map.getCanvas().style.cursor = features.length
          ? 'pointer'
          : 'crosshair';
      });
    },
    async refreshFloor() {
      this.areaTags = await this.getAF3TagsInArea({ siteId: this.currentSite.id, areaName: this.selectedFloor.value });
      if (this.map.getLayer(this.af3TagsLayerId)) {
        this.map.removeLayer(this.af3TagsLayerId);
        this.map.removeSource(this.af3TagsLayerId);
      }
      this.drawDevices(this.map, this.areaTags, this.af3TagsLayerId, true);
    },
    async liveRefreshFloor(){
      if(this.liveRefresh){
        await this.refreshFloor();
        setTimeout(()=>{
          this.liveRefreshFloor();
        }, 3000);
      }
    },
    async onFloorChange(newFloor) {
      clearLayers(this.map);
      this.map.fire('closeAllPopups');
      this.initMapData(newFloor.id);
    },
    async initMapData(floorId){
      await this.fetchIndoorPlan(floorId);
      const floorSetup = await this.setupFloorData(floorId);
      this.createMarker(this.referencePoint, this.map, '#4832a8');
      this.areaTags = await this.getAF3TagsInArea({ siteId: this.currentSite.id, areaName: this.selectedFloor.value });
      floorSetup && this.drawDevices(this.map, this.areaTags, this.af3TagsLayerId, true);
      let zones = await this.getZoneByArea(floorId);
      this.drawZones(this.map, floorId);
    },
    async setupFloorData(floorId) {
      this.floorData = await this.getAF3Points(floorId);
      setAf3MapZoom(this.map, this.floorData, this.areaFileMapping);
      this.scale = (this.floorData.mapDistance * 1000) / this.floorData.distance;

      if (
        this.floorData &&
        (this.floorData.originPointLat || !isNaN (this.floorData.originPointLat)) &&
        this.floorData.distance &&
        this.floorData.mapDistance
      ) {
        this.referencePoint = [
          this.floorData.originPointLat,
          this.floorData.originPointLng,
        ];

        return true;
      }

      this.$toasted.show('Floor setup has missing details', {
        position: 'bottom-right',
        className: ['toast-error'],
        duration: 5000,
      });
      return false;
    },
    mapSourceRequestHandler(url, resourceType) {
      if (
        resourceType === 'Source' &&
        url.toLowerCase().indexOf(this.zoneSourceUrl.toLowerCase() > -1)
      ) {
        const authData = AuthService.checkLoggedIn();
        const accessToken = authData.access_token;
        return {
          url: url,
          headers: { authorization: `Bearer ${accessToken}` },
        };
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.custom-card {
  overflow-y: auto;
}

.af3-map {
  overflow-y: auto;
  height: calc(100vh - 230px);
}
</style>