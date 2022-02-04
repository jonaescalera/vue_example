<template>
  <div>
    <v-dialog @click:outside="closeModal" v-model="dialog" width="90vw" scrollable>
      <v-card id="mapPolygonAreaCreate">
        <v-btn color="seondary" text fab x-small dark class="float-right mt-1 mr-1 close-btn" title="close" @click="closeModal">
            <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-title class="secondary">
          <div>
            {{$t('area-name')}}:
            <b>{{area.name}}</b>
          </div>
          <div class="ml-2">
            | {{$t('site')}}:
            <b>{{area.site.value}}</b>
          </div>
        </v-card-title>
        <v-card-text v-bind:class="{ 'map-loaded': mapLoaded }" class="map-container">
          <div class="w-100 h-100" ref="mapboxMap"></div>
        </v-card-text>
        <v-card-text class="invalid-polygon" v-if="invalidPolygon">{{$t('invalid-area')}}</v-card-text>
        <v-card-actions>
          <v-col cols="12">
            <v-btn
              v-if="modalMode === 'create'"
              id="areaUploadMapPolygonBtn"
              depressed
              color="secondary"
              tabindex="2"
              @click="handleAddArea"
              class="px-8 float-right"
            >{{$t('add')}}</v-btn>
            <v-btn
              v-if="modalMode === 'edit'"
              id="areaEditMapPolygonBtn"
              depressed
              color="secondary"
              tabindex="3"
              @click="handleEditArea"
              class="px-8 float-right"
            >{{$t('save')}}</v-btn>
            <v-btn
              v-if="backBtn"
              text
              id="areaUploadMapPolygonBtnCancel"
              color="secondary"
              tabindex="4"
              @click="onBackHanddle"
              class="px-8 float-right mr-2"
            >{{$t('back')}}</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  fitPolygon,
  getMapStyles,
  pointsToString,
  getMapInitOptions,
  addFillLayerToMap,
  addLayerNameToMap,
  addPolygonToMap,
  pointsInsidePolygon
} from '../../utils/map';
import { mapActions } from 'vuex';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
export default {
  data() {
    return {
      dialog: false,
      map: null,
      areaLayerId: '',
      mapLoaded: false,
      mapBoxDraw: null,
      invalidPolygon: false
    };
  },
  props: ['area', 'modalMode', 'backBtn'],
  mounted() {},
  methods: {
    ...mapActions('area', ['createOutdoorArea', 'editArea']),
    initMap() {
      mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN || '';
      this.map = new mapboxgl.Map(getMapInitOptions(this.$refs.mapboxMap));
      this.map.on(
        'load',
        function() {
          this.onLoad();
        }.bind(this)
      );
    },
    openModal() {
      this.dialog = true;
      setTimeout(() => {
        this.initMap();
      }, 0);
    },
    onLoad() {
      this.mapBoxDraw = new MapboxDraw({
        displayControlsDefault: false,
        points: '',
        controls: {
          polygon: this.modalMode === 'create',
          trash: this.modalMode === 'create',
        },
        styles: getMapStyles(this.area.id, this),
      });
      this.map.addControl(this.mapBoxDraw, 'top-left');
      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.on('draw.create', this.createArea);
      this.map.on('draw.delete', this.deleteArea);
      this.map.on('draw.update', this.updateArea);
      this.mapLoaded = true;
      if (this.modalMode === 'edit') {
        this.mapLoaded = false;
        this.loadArea();
      }
    },
    createArea(ev) {
      let allFeatures = this.mapBoxDraw.getAll();
      if (allFeatures && allFeatures.features.length > 1) {
        this.mapBoxDraw.delete(allFeatures.features[0].id);
      }
      let feature = ev.features[0];
      if (feature) {
        this.areaLayerId = feature.id;
        this.points = pointsToString(feature.geometry.coordinates[0]);
      }
    },
    updateArea(ev) {
      let updatedArea = ev.features[0].geometry.coordinates[0]
      this.invalidPolygon = false;
      if (this.area.zones && this.area.zones.length > 0) {
        this.area.zones.map((zone)=> {
          if (!pointsInsidePolygon(zone.polygon, updatedArea)) {
            this.invalidPolygon = true;  
          }
        })  
      }
      if (!this.invalidPolygon) {
        this.points = pointsToString(
          this.mapBoxDraw.get(this.areaLayerId).geometry.coordinates[0]
        );
      }
    },
    deleteArea() {
      this.points = '';
    },
    onBackHanddle() {
      this.$emit('onBackHandler', this.area);
      this.closeModal();
    },
    loadArea() {
      this.areaLayerId = 'load-area-id';
      let feature = {
        id: this.areaLayerId,
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [this.area.polygon] },
      };
      this.mapBoxDraw.add(feature);
      fitPolygon(this.map, this.area.polygon);
      if (this.area.zones && this.area.zones.length > 0) {
        this.area.zones.map(zone => {
          addPolygonToMap(this.map, zone.polygon, zone.id, zone.name);
          addLayerNameToMap(this.map, zone.id);
          addFillLayerToMap(
            this.map,
            zone.id,
            this.$vuetify.theme.themes.light.secondary
          );
        });
      }
      this.mapLoaded = true;
    },
    async handleAddArea() {
      if (this.points) {
        let payload = {
          configValue: this.area.name,
          properties: {
            areaLocation: 'outdoor',
            geoReferenced: 'true',
            points: this.points,
            siteId: this.area.site.id,
          },
        };
        try {
          const area = await this.createOutdoorArea(payload);
          this.$toasted.show(this.$t('area-created'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          this.closeModal();
          this.$emit('areaCreatedEdited', area);
        } catch (error) {
          this.$toasted.show(error, {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });
        }
      }
    },
    async handleEditArea() {
      if (this.invalidPolygon) {
        return;
      }
      if (this.points) {
        let payload = {
          data: {
            configValue: this.area.name,
            points: this.points,
          },
          id: this.area.id,
        };
        try {
          const area = await this.editArea(payload);
          this.$toasted.show(this.$t('area-edited'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          this.closeModal();
          this.$emit('areaCreatedEdited', area);
        } catch (error) {
          this.$toasted.show(error, {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });
        }
      }
    },
    closeModal() {
      this.mapBoxDraw = null;
      this.map.remove();
      this.mapLoaded = false;
      this.dialog = false;
    },
  },
};
</script>

<style scoped lang="scss">
.map-container {
  height: 80vh;
  width: 100%;
  padding: 0 !important;
}
.close-btn {
  position: absolute;
  right: 0;
}
</style>