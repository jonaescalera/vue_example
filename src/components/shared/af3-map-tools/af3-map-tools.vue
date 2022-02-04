<template>
  <!-- SQUARE GRID OPTIONS -->
  <vue-draggable-resizable
    v-if="areaFileMapping && floorData && map"
    :resizable="false"
    :draggable="draggable"
    :parent="true"
    :w="small ? 53 : 225"
    :h="350"
    class="sg-container"
    ref="draggableContainer"
    v-bind:class="{ 'small-view-container': small }"
  >
    <div class="pa-2">
      <v-icon class="collapse-icon" v-if="!small" @click="small = !small">mdi-chevron-left</v-icon>
      <v-icon class="collapse-icon" v-else @click="small = !small">mdi-chevron-right</v-icon>
      <div v-show="!small">
        <h4>{{ $t('assets-st-grid') }}</h4>
        <hr class="mt-2">
        <v-checkbox
          v-model="overlayGrid"
          :label="$t('assets-st-grid-check')"
          class="mb-0"
        ></v-checkbox>
        <div class="pl-3">
          <h4 class="mt-2">{{ $t('assets-st-grid-units') }}</h4>
          <v-radio-group class="mt-0" v-model="unitGrid" row>
            <v-radio
              :label="$t('assets-st-grid-unit-1')"
              value="0"
            ></v-radio>
            <v-radio
              :label="(gridScale === '2') ? $t('assets-st-grid-unit-3') : $t('assets-st-grid-unit-2')"
              value="1"
            ></v-radio>
          </v-radio-group>
          <h4>{{ $t('assets-st-grid-scale') }}</h4>
          <v-radio-group class="mt-0" v-model="gridScale" row :disabled="!overlayGrid">
            <v-radio
              v-if="unitGrid === '0'"
              :label="$t('assets-st-grid-scale-1x1')"
              value="0"
            ></v-radio>
            <v-radio
              v-if="unitGrid === '0'"
              :label="$t('assets-st-grid-scale-1/4x1/4')"
              value="1"
            ></v-radio>
            <v-radio
              v-if="unitGrid === '1'"
              :label="$t('assets-st-grid-scale-3x3')"
              value="2"
            ></v-radio>
            <v-radio
              v-if="unitGrid === '1'"
              :label="$t('assets-st-grid-scale-1x1')"
              value="3"
            ></v-radio>
          </v-radio-group>
        </div>
        <div></div>
        <div>
          <v-row>
            <v-col class="my-0 py-0">
              <v-checkbox
                v-model="measuringTool"
                id="measuringTool"
                :hide-details="true"
                color="primary"
                :label="$t('assets-st-grid-measure-tool')"
                class="float-left"
              ></v-checkbox>
              <span v-show="measuringTool" @click="clearMeasuringTool" class="clear-measuring-tool float-left">({{$t('clear').toLowerCase()}})</span>
            </v-col>
          </v-row>
          <v-checkbox
              v-if="showHideLocationsTool"
              v-model="showLocations"
              id="showHideLocations"
              :hide-details="true"
              color="primary"
              :label="$t('assets-st-grid-show-locations')"
          ></v-checkbox>
          <!-- <v-checkbox
              v-if="showHideBoundedErrorTool"
              v-model="showBoundedError"
              id="showHideBoundedError"
              :hide-details="true"
              color="primary"
              :label="$t('assets-st-grid-show-bounded-error')"
          ></v-checkbox> -->
        </div>
      </div>
      <div class="mt-8" v-show="small">
        <hr class="icons-divider">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" :color="overlayGrid ? 'primary': ''" icon text @click="overlayGrid = !overlayGrid">
              <v-icon v-text="overlayGrid ? 'mdi-grid-off' : 'mdi-grid'"></v-icon>
            </v-btn>
          </template>
          <span>
            <span v-if="overlayGrid">{{$t('assets-st-grid-check-on')}}</span>
            <span v-else>{{$t('assets-st-grid-check-off')}}</span>
          </span>
        </v-tooltip>
        <hr v-if="overlayGrid" class="icons-divider">
        <v-tooltip v-if="unitGrid === '0' && gridScale === '0' && overlayGrid" top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" color="primary" icon text @click="gridScale = '1'">
              <v-icon>mdi-grid</v-icon>
            </v-btn>
          </template>
          <span >1/4 X 1/4</span>
        </v-tooltip>
        <v-tooltip v-if="unitGrid === '0' && gridScale === '1' && overlayGrid" top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" color="primary" icon text @click="gridScale = '0'">
              <v-icon>mdi-grid-large</v-icon>
            </v-btn>
          </template>
          <span >1 X 1</span>
        </v-tooltip>
        <v-tooltip v-if="unitGrid === '1' && gridScale === '2' && overlayGrid" top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" color="primary" icon text @click="gridScale = '3'">
              <v-icon>mdi-grid</v-icon>
            </v-btn>
          </template>
          <span >1 X 1</span>
        </v-tooltip>
        <v-tooltip v-if="unitGrid === '1' && gridScale === '3' && overlayGrid" top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" color="primary" icon text @click="gridScale = '2'">
              <v-icon>mdi-grid-large</v-icon>
            </v-btn>
          </template>
          <span >3 X 3</span>
        </v-tooltip>
        <hr class="icons-divider">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" color="primary" icon text @click="unitGrid = '0'">
              <v-icon v-text="unitGrid === '0' ? 'mdi-alpha-m-box' : 'mdi-alpha-m-box-outline'"></v-icon>
            </v-btn>
          </template>
          <span>{{$t('assets-st-grid-meters')}}</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" color="primary" icon text @click="unitGrid = '1'">
              <v-icon v-text="unitGrid === '1' ? 'mdi-alpha-f-box' : 'mdi-alpha-f-box-outline'"></v-icon>
            </v-btn>
          </template>
          <span>{{$t('assets-st-grid-feet')}}</span>
        </v-tooltip>
        <hr class="icons-divider">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <div>
              <v-btn v-on="on" :color="measuringTool ? 'primary': ''" icon text @click="measuringTool = !measuringTool">
                <v-icon>mdi-ruler</v-icon>
              </v-btn>
              <span v-show="measuringTool" @click="clearMeasuringTool" class="clear-measuring-tool-small clear-measuring-tool">({{$t('clear').toLowerCase()}})</span>
            </div>
          </template>
          <span >{{$t('assets-st-grid-measure-tool')}}</span>
        </v-tooltip>
        <hr class="icons-divider">
        <v-tooltip v-if="showHideLocationsTool" top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" :color="showLocations ? 'primary': ''" icon text @click="showLocations = !showLocations">
              <v-icon>mdi-lighthouse</v-icon>
            </v-btn>
          </template>
          <span >{{$t('location-beacons')}}</span>
        </v-tooltip>
        <hr v-if="showHideLocationsTool" class="icons-divider">
        <!-- <v-tooltip v-if="showHideBoundedErrorTool" top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" :color="showBoundedError ? 'primary': ''" icon text @click="showBoundedError = !showBoundedError">
              <v-icon>mdi-chart-bell-curve</v-icon>
            </v-btn>
          </template>
          <span>{{$t('assets-st-grid-show-bounded-error')}}</span>
        </v-tooltip>
        <hr v-if="showHideBoundedErrorTool" class="icons-divider"> -->
      </div>
    </div>
  </vue-draggable-resizable>
</template>

<script>
import { mapActions } from 'vuex';
  import {
    drawIndoorSquareGrid,
    drawLineBetweenPoints,
    editLineBetweenTwoPoints,
    removeLineBetweenTwoPoints,
    mapCoordinates,
    setAf3MapZoom,
    createMarker,
    removeSquareGrid
  } from '../../../utils/map';
  export default {
    props: ['areaFileMapping', 'map', 'mapLoaded', 'selectedFloor', 'draggable', 'showHideLocationsTool', 'showHideBoundedErrorTool', 'createMode'],
    data() {
      return {
        overlayGrid: false,
        unitGrid: "0",
        gridScale: "0",
        selectedPointToMeasureA: null,
        selectedPointToMeasureB: null,
        measuringTool: false,
        lineStarted: false, 
        lineCompleted: false,
        showLocations: false,
        showBoundedError: false,
        floorData: null,
        small: true
      }
    },
    watch: {
      selectedFloor() {
        //after changing the indoor map, reset the grid option 
        this.resetTools();
      },
      overlayGrid(drawGrid){
        if (this.mapLoaded) {
          if(!drawGrid){
              removeSquareGrid(this.map);
          }else{
            drawIndoorSquareGrid(this.map, this.floorData, this.areaFileMapping, this.gridScale);
          }
          editLineBetweenTwoPoints(this.map, this.selectedPointToMeasureA, this.selectedPointToMeasureB, this.floorData, this.unitGrid);
        }
      },
      gridScale(value){
        this.overlayGrid && drawIndoorSquareGrid(this.map, this.floorData, this.areaFileMapping, value);
      },
      unitGrid(value){
        this.$emit('onMeasurementChange', value);
        if(value === "0"){//meters
          if(this.gridScale !== 0 && this.gridScale !== 1){
            this.gridScale = "0";
          }
        }else{//feet
          if(this.gridScale !== 2 && this.gridScale !== 3){
            this.gridScale = "3";
          }
        }
        editLineBetweenTwoPoints(this.map, this.selectedPointToMeasureA, this.selectedPointToMeasureB, this.floorData, this.unitGrid);
      },
      measuringTool() {
        this.$emit('onMeasuringToolChange', this.measuringTool);
        if (!this.measuringTool) {
          this.clearMeasuringTool();
          this.map.getCanvas().style.cursor = 'inherit';
        } else {
          this.map.getCanvas().style.cursor = 'crosshair';
        }
      },
      showLocations(value){
        this.$emit('onShowHideLocationsChange', value);
      },
      showBoundedError(value){
        this.$emit('onShowHideBoundedErrorChange', value);
      },
      map() {
        if (this.map) {
          this.initMap();
        }
      },
      mapLoaded() {
        if (this.mapLoaded) {
          if (!this.createMode) {
            this.addMapDetails();
          }
        }
      }
    },
    mounted() {
      this.initMap();
    },
    beforeDestroy() {
      let coords = document.getElementById('mapXYCoords');
      if (coords) {
        coords.parentElement.removeChild(coords)
      }
    },
    methods: {
      ...mapActions('area', ['getAF3Points']),
      initMap() {
        this.showLocations = false;
        let coords;
        if (!document.getElementById('mapXYCoords')) {
          coords = this.addCoods();
        }
        if (this.map) {
          if (this.measuringTool) {
            this.map.getCanvas().style.cursor = 'crosshair';
          } else {
            this.map.getCanvas().style.cursor = 'inherit';
          }
          this.map.on('click', (p) => {
            this.handleClick(p);
          });
          this.map.on('mousemove', (p) => {
            if (this.selectedPointToMeasureA && this.measuringTool) {
              this.handleMove(p);
            }
            if (coords && this.floorData) {
              coords.innerHTML = mapCoordinates(p, this.floorData, this.unitGrid);
            }else{
              coords = document.getElementById('mapXYCoords');
              if (!coords) {
                this.addCoods();
              }
            }
          });
        }
      },
      async setupFloorData(floorId) {
        this.floorData = await this.getAF3Points(floorId);
        this.$emit('onFloorDataChange', this.floorData)
        if (
          this.floorData &&
          (this.floorData.originPointLat || !isNaN (this.floorData.originPointLat)) &&
          this.floorData.distance &&
          this.floorData.mapDistance
        ) {
          return;
        }
        if(this.createMode === undefined){
          this.$toasted.show(this.$t('af3-missing-details'), {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });
        }
      },
      async addMapDetails() {
        this.resetTools();
        await this.setupFloorData(this.selectedFloor);
        if (this.floorData) {
          setAf3MapZoom(this.map, this.floorData, this.areaFileMapping);
          if((this.createMode === undefined) || (this.createMode !== undefined && this.createMode)){
            createMarker([this.floorData.originPointLat, this.floorData.originPointLng], this.map, '#fe0000', '#fe0000', 0, 0, [0, 0], 6, 'reference-point-airfinder');
          }
        }
      },
      addCoods() {
        if (this.map) {
          let coords = document.createElement('div');
          coords.style.bottom = 0;
          coords.style.zIndex = 1;
          coords.id = 'mapXYCoords';
          coords.style.fontSize = '15px';
          coords.style.position = 'absolute';
          coords.style.fontFamily = 'Montserrat';
          coords.style.backgroundColor ='#fff';
          coords.style.padding = '5px';
          coords.style.borderRadius = '5px';
          this.map._container.appendChild(coords);
          return coords;
        }
      },
      handleClick(p) {
        if (this.measuringTool) {
          if (!this.selectedPointToMeasureA) {
            //first click set point a & start drawing
            this.selectedPointToMeasureA = p;
          } else {
            //second click draw line and stop drawing
            if (!this.lineCompleted) {
              this.selectedPointToMeasureB = p;
              editLineBetweenTwoPoints(this.map, this.selectedPointToMeasureA, this.selectedPointToMeasureB, this.floorData, this.unitGrid)
              this.lineCompleted = true
            } else {
              //third click reset point a and star drawing again
              this.selectedPointToMeasureA = p;
              this.selectedPointToMeasureB = null;
              this.lineCompleted = false;
            }
          }
        }
      },
      handleMove(p) {
        if (this.selectedPointToMeasureA) {
          if (!this.lineStarted) {
            this.lineStarted = true;
            drawLineBetweenPoints(this.map, this.selectedPointToMeasureA, p, this.$vuetify.theme.themes.light.primary);
          } else if(!this.lineCompleted) {
            this.selectedPointToMeasureB = p
            editLineBetweenTwoPoints(this.map, this.selectedPointToMeasureA, this.selectedPointToMeasureB, this.floorData, this.unitGrid)
          }
        }
      },
      clearMeasuringTool(e) {
        if (e) {
          e.stopPropagation();
        }
        if (this.mapLoaded) {
          removeLineBetweenTwoPoints(this.map);
        }
        this.selectedPointToMeasureA = null;
        this.selectedPointToMeasureB = null;
        this.lineStarted = false;
        this.lineCompleted = false;
      },
      resetTools() {
        this.measuringTool = false;
        this.clearMeasuringTool();
        this.overlayGrid = false;
        this.showLocations = false;
        this.showBoundedError = false;
      }
    }
  }
</script>
<style lang="scss" scoped>
  .sg-container{
    border: 1px solid #625b5a;
    border-radius: 3px;
    background-color: #fff;
    cursor: move;
    position: absolute;
    z-index: 5 !important;
    user-select: none;
  }
  .clear-measuring-tool{
    font-size: 0.7rem;
    position: relative;
    top: 21px;
    left: 8px;
    color: var(--v-primary-base);
    cursor: pointer;
  }
  .clear-measuring-tool-small {
    top: 0px;
    left: 3px;
  }
  .collapse-icon{
    right: 14px;
    position: absolute;
    top: 6px;
  }
  .icons-divider {
    width: 36px;
    margin-top: 7px;
    margin-bottom: 5px;
    border-bottom: none;
    border-right: none;
  }
</style>