<template>
  <div>
    <v-dialog
      @click:outside="closeModal"
      @keydown.esc="closeModal"
      v-model="dialog"
      fullscreen
    >
      <v-card>
        <v-card-text
          v-bind:class="{ 'map-loaded': mapLoaded }"
          class="map-container"
        >
          <MapGrid
            class="grid-control"
            v-if="area && indoorMap && area.site && area.site.isAf3"
            :areaFileMapping="indoorMap"
            :draggable="true"
            :map="map"
            :createMode="mode !== 'edit'"
            :mapLoaded="mapLoaded"
            :selectedFloor="area.id"
            @onFloorDataChange="handleOnFloorDataChange"
          />
          <v-row class="h-100">
            <v-col lg="9" md="8" cols="7">
              <div class="w-100 h-100" ref="mapboxMap"></div>
            </v-col>
            <v-col lg="3" md="4" col="5" class="right-container">
              <v-row class="mb-5">
                <v-col cols="12">
                  <v-img :src="iconOPoint" class="float-left"></v-img>
                  <v-btn
                    depressed
                    color="secondary"
                    @click="drawOrigin()"
                    :disabled="originPoint ? true : false"
                    class="float-left ml-3"
                  >
                    {{ $t('origin-point-label') }}
                  </v-btn>
                  <p
                    class="mt-2 float-left w-100 error--text"
                    v-if="originPointError"
                  >
                    {{ originPointError }}
                  </p>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row class="mt-5">
                <v-col cols="12">
                  <v-img :src="iconRPoints" class="float-left"></v-img>
                  <v-btn
                    depressed
                    color="secondary"
                    @click="drawRPs()"
                    :disabled="referencePoints ? true : false"
                    class="float-left ml-3"
                  >
                    {{ $t('reference-points-label') }}
                  </v-btn>
                  <p
                    class="mt-2 float-left w-100 error--text"
                    v-if="referencePointsError"
                  >
                    {{ referencePointsError }}
                  </p>
                </v-col>
              </v-row>
              <v-divider class="mt-5 mb-5"></v-divider>
              <form submit.stop.prevent="handleSubmit" id="floorPlanEditForm">
                <v-row>
                  <v-col class="py-0" cols="11">
                    <v-text-field
                      :label="$t('distance-label')"
                      v-model="rpDistance"
                      :dense="true"
                      type="number"
                      outlined
                      color="secondary"
                      :disabled="!referencePoints ? true : false"
                      ref="distanceMtrs"
                      :error-messages="rpDistanceError"
                    ></v-text-field>
                  </v-col>
                  <v-col class="py-0" cols="11">
                    <v-text-field
                      :label="$t('floor-bottom-height')"
                      v-model="form.areaBottomHeight"
                      :dense="true"
                      outlined
                      type="number"
                      color="secondary"
                      :error-messages="areaBottomHeightErrors"
                      @input="$v.form.areaBottomHeight.$touch()"
                      @blur="$v.form.areaBottomHeight.$touch()"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </form>
              <v-row class="button-container">
                <v-col>
                  <v-btn
                    depressed
                    color="secondary"
                    @click="save()"
                    class="float-right mr-5"
                  >
                    {{ $t('save') }}
                  </v-btn>
                  <v-btn
                    text
                    color="secondary"
                    @click="closeModal()"
                    class="float-right mr-2"
                  >
                    {{ $t('cancel') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import MapGrid from '../shared/af3-map-tools/af3-map-tools';
import { mapActions } from 'vuex';
import { getIndoorMapInitOptions, drawAreaIndoorPlan } from '../../utils/map';
import mapboxgl from 'mapbox-gl';
import length from '@turf/length';
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export default {
  props: ['mode'],
  data() {
    return {
      iconOrigin: require('../../assets/img/map/origin.png'),
      iconOriginActive: require('../../assets/img/map/origin_active.png'),
      iconCross: require('../../assets/img/map/cross.png'),
      iconCrossActive: require('../../assets/img/map/cross_active.png'),
      iconOPoint: require('../../assets/img/map/o_point.png'),
      iconRPoints: require('../../assets/img/map/r_points.png'),
      area: null,
      areaPoints: null,
      map: null,
      indoorMap: null,
      dialog: false,
      mapLoaded: false,
      originPoint: null,
      referencePoints: null,
      originPointError: null,
      referencePointsError: null,
      mapDistance: null,
      rpDistance: null,
      rpDistanceError: null,
      form: {
        areaBottomHeight: null,
      },
    };
  },
  components: {
    MapGrid
  },
  validations: {
    form: {
      areaBottomHeight: {          
        required,
      },
    }
  },
  mixins: [validationMixin],
  computed: {
    areaBottomHeightErrors() {
      const errors = [];
      if (this.$v.form.areaBottomHeight && !this.$v.form.areaBottomHeight.$dirty) {
        return errors;
      } 
      this.$v.form.areaBottomHeight && !this.$v.form.areaBottomHeight.required &&
        errors.push(this.$t('error-required'));
      return errors;
    },
  },
  methods: {
    ...mapActions('area', ['getAreaIndoorFile', 'saveAF3Points']),
    openModal(area) {
      this.dialog = true;
      this.area = area;
      this.referencePoints = null;
      this.originPoint = null;
      this.rpDistance = null;
      this.mapLoaded = false;
      Object.assign(this.form, {
        areaBottomHeight: null,
      });
      this.$v.form.$reset();
      this.initIndoorMap();
      this.mapDistance = null;
    },
    async initIndoorMap() {
      try {
        const indoorMapImage = await this.getAreaIndoorFile({
          areaId: this.area.id,
        });
        this.indoorMap = indoorMapImage;
        this.initMap();
      } catch (error) {
        throw error;
      }
    },
    initMap() {
      mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN || '';
      this.map = new mapboxgl.Map(getIndoorMapInitOptions(this.$refs.mapboxMap)); 
      this.map.on(
        'load',
        function () {
          this.onLoad();
          this.map.loadImage(this.iconOrigin, (error, image) => {
            if (error) throw error;
            this.map.addImage('origin', image);
          });
          this.map.loadImage(this.iconOriginActive, (error, image) => {
            if (error) throw error;
            this.map.addImage('originActive', image);
          });
          this.map.loadImage(this.iconCross, (error, image) => {
            if (error) throw error;
            this.map.addImage('cross', image);
          });
          this.map.loadImage(this.iconCrossActive, (error, image) => {
            if (error) throw error;
            this.map.addImage('crossActive', image);
          });
        }.bind(this)
      );
    },
    onLoad() {
      drawAreaIndoorPlan(this.map, this.indoorMap);
      this.mapBoxDraw = new MapboxDraw({
        displayControlsDefault: false,
        points: '',
        styles: [
          {
            'id': 'origin-point-inactive',
            'filter': ['all',
                ['==', 'active', 'false'],
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['!=', 'mode', 'static']
            ],
            'layout': {
                'icon-image': 'origin',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true
            },
            'type': 'symbol'
          },
          {
            'id': 'origin-point-active',
            'filter': ['all',
                ['==', '$type', 'Point'],
                ['!=', 'meta', 'midpoint'],
                ['==', 'active', 'true'],
                ["!=", "meta", "vertex"]
            ],
            'layout': {
                'icon-image': 'originActive',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true
            },
            'type': 'symbol'
          },
          {
            'id': 'reference-points-line',
            'type': 'line',
            'filter': ['all',
                ['==', '$type', 'LineString'],
                ['!=', 'mode', 'static'],
                ['==', 'active', 'false'],
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#008fe8',
                'line-width': 4
            }
          },
          {
            'id': 'reference-points-line-active',
            'type': 'line',
            'filter': ['all',
              ['==', '$type', 'LineString'],
              ['==', 'active', 'true']
            ],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#fbb03b',
              'line-dasharray': [0.2, 2],
              'line-width': 4
            }
          },
          {
            "id": "reference-points-vertex",
            "filter": ["all", ["==", "meta", "vertex"],
                ["==", "$type", "Point"],
                ["!=", "mode", "static"]
            ],
            'layout': {
                'icon-image': 'cross',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true
            },
            'type': 'symbol'
          },
          {
            "id": "reference-points-vertex-active",
            "filter": ["all", ["==", "meta", "vertex"],
                ['==', 'active', 'true'],
                ["==", "$type", "Point"],
                ["!=", "mode", "static"]
            ],
            'layout': {
                'icon-image': 'crossActive',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true
            },
            'type': 'symbol'
          }
        ]
      });
      this.map.addControl(this.mapBoxDraw);
      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.on('draw.update', this.handleUpdatePoint);
      this.mapLoaded = true;
    },
    handleUpdatePoint(ev) {
      if (
        ev &&
        ev.features &&
        ev.features[0] &&
        ev.features[0].geometry.type === 'LineString'
      ) {
        this.$refs.distanceMtrs.focus();
      }
    },
    handleOnFloorDataChange(areaPoints) {
      this.areaPoints = areaPoints;
      if (areaPoints) {
        this.form.areaBottomHeight = areaPoints.floorStartsAt;
        this.drawOrigin([this.areaPoints.originPointLat, this.areaPoints.originPointLng]);
        this.drawRPs([[this.areaPoints.distancePoint1Lat, this.areaPoints.distancePoint1Lng], [this.areaPoints.distancePoint2Lat, this.areaPoints.distancePoint2Lng]]);
        this.rpDistance = this.areaPoints.distance;
      }
    },
    drawOrigin(originPoint) {
      var feature = { type: 'Point', coordinates: originPoint? originPoint : [0, 0] };
      var featureId = this.mapBoxDraw.add(feature);
      this.originPoint = featureId;
      this.originPointError = null;
    },
    drawRPs(referencesPoints) {
      var feature = {
        type: 'LineString',
        coordinates: referencesPoints ? referencesPoints : [
          [0, 0],
          [0.02, 0],
        ],
      };
      var featureId = this.mapBoxDraw.add(feature);
      this.referencePoints = featureId;
      this.referencePointsError = null;
    },
    setMapDistance(p1, p2) {
      let geojson = {
        type: 'FeatureCollection',
          features: [],
        };
      let linestring = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      };
      let point1 = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p1.split(',')[1], p1.split(',')[0]],
        }
      };
      geojson.features.push(point1);
      let point2 = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p2.split(',')[1], p2.split(',')[0]],
        }
      };
      geojson.features.push(point2);
      linestring.geometry.coordinates = geojson.features.map(point => point.geometry.coordinates)
      geojson.features.push(linestring);
      this.mapDistance = parseFloat(length(linestring)).toFixed(3);
    },
    async save() {
      this.$v.$touch();
      if (this.referencePoints && this.originPoint && this.rpDistance && !this.$v.form.$anyError) {
        let point1 = this.mapBoxDraw.getAll().features.filter(x => x.id === this.referencePoints[0])[0].geometry.coordinates[0][0] + "," + this.mapBoxDraw.getAll().features.filter(x => x.id === this.referencePoints[0])[0].geometry.coordinates[0][1];
        point1 = point1 === '0,0' ? '0.0,0.0' : point1;
        let point2 = this.mapBoxDraw.getAll().features.filter(x => x.id === this.referencePoints[0])[0].geometry.coordinates[1][0] + "," + this.mapBoxDraw.getAll().features.filter(x => x.id === this.referencePoints[0])[0].geometry.coordinates[1][1];
        point2 = point2 === '0.02,0' ? '0.02,0.0' : point2;
        this.setMapDistance(point1, point2);
        let origin = this.mapBoxDraw.getAll().features.filter(x => x.id === this.originPoint[0])[0].geometry.coordinates[0] + "," + this.mapBoxDraw.getAll().features.filter(x => x.id === this.originPoint[0])[0].geometry.coordinates[1];
        origin = origin === '0,0' ? '0.0,0.0' : origin;
        let data = {
          areaId: this.area.id,
          floorStartsAt: this.form.areaBottomHeight,
          originPoint: origin,
          distancePoint1: point1,
          distancePoint2: point2,
          distance: this.rpDistance,
          mapDistance: this.mapDistance,
        };

        try{
          await this.saveAF3Points(data);
          this.closeModal();
          this.$toasted.show(this.$t('area-saved'), { 
            position: "bottom-right",
            className: ['toast-success'], 
            duration : 3000
          });
        } catch(error) {
          this.$toasted.show(error.data.message, { 
            position: "bottom-right",
            className: ['toast-error'], 
            duration : 5000
          });
        }
        
      } else {
        if (!this.referencePoints) {
          this.referencePointsError = this.$t('reference-points-error');
        }
        if (!this.originPoint) {
          this.originPointError = this.$t('origin-point-error');
        }
        if (this.referencePoints && !this.rpDistance) {
          this.rpDistanceError = this.$t('distance-error');
        }
      }
    },
    closeModal() {
      this.dialog = false;
      this.area = null;
    }
  },
};
</script>
<style scoped lang="scss">
.error--text {
  font-size: 12px;
}
.grid-control {
  top: 15px;
  left: 15px;
}
.map-container {
  height: 100vh;
  width: 100%;
  padding: 0 !important;
  opacity: 0;
}
.right-container {
  border-left: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 25px;
}
.button-container {
  position: absolute;
  right: 0;
  bottom: 15px;
}
</style>