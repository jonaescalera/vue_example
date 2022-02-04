<template>
  <div>
    <v-dialog @click:outside="closeModal" @keydown.esc="closeModal" v-model="dialog" fullscreen scrollable>
      <v-card id="manageLocationAccessPointGateway">
        <div class="search-container">
          <Search cols="12" v-if="mapLoaded" @onSearchBarKeyUp="searchChange($event)" @searchText="searchChange($event)" :placeholder="$t('setup-placeholder')"/>
        </div>
        <v-card-title class="secondary card-title">
          <div v-if="area">
            <v-autocomplete
              dark
              class="area-selector"
              id="selectArea"
              :items="siteAreasIndoor"
              item-text="name"
              v-model="selectedAreaId"
              @change="selectArea"
              item-value="id"
              :label="$t('indoor-area')"
              outlined
              dense
            >
            </v-autocomplete>
          </div>
          <div class="ml-2" v-if="area && area.site">
            | {{$t('site')}}:
            <b>{{area.site.value}}</b>
          </div>
        </v-card-title>
        <v-row>
          <div class="map-panel">
            <MapGrid
              class="grid-control"
              v-if="indoorMap && currentSite && currentSite.isAf3"
              :areaFileMapping="indoorMap"
              :draggable="true"
              :map="map"
              :mapLoaded="mapLoaded"
              :selectedFloor="selectedAreaId"
            />
            <v-card-text
              v-bind:class="{ 'map-loaded': mapLoaded }"
              @drop="handleDrop"
              class="map-container"
            >
              <div class="w-100 h-100" ref="locationMapboxMap">
              </div>
            </v-card-text>
          </div>
          <div v-if="mapLoaded" class="actions-panel text-ellipsis">
            <v-tabs :vertical="true" v-model="tab">
              <v-tab key="locations">{{$t('locations')}}</v-tab>
              <v-tab key="accessPoints">{{$t('access-points')}}</v-tab>
              <v-tab key="gateways">{{$t('gateways')}}</v-tab>
            </v-tabs>
            <v-card-actions>
              <v-btn
                id="manageAccessPointsGatewaysLocationsAdd"
                color="secondary" 
                @click="addDevice"
                class="p-1 float-right"
              >{{$t('add')}}</v-btn>
              <v-btn
                id="manageAccessPointsGatewaysLocationsAddMultiple"
                color="secondary"
                @click="handleBulkUploadClick"
                class="p-1 float-right"
              >{{$t('bulk-upload')}}</v-btn>
              <v-btn
                id="manageAccessPointsGatewaysLocationsExportCSV"
                color="secondary"
                :disabled="disableIfNoneChecked"
                @click="handleExportClick"
                class="p-1 float-right"
              >{{$t('export')}}</v-btn>
            </v-card-actions>
            <v-divider></v-divider>
            <v-checkbox
              id="manageAccessPointsGatewaysLocationsshowNotPlaced"
              class="ml-2 d-inline-block"
              v-model="showNotPlaced"
              color="primary"
              :label="$t('show-not-placed')"
            ></v-checkbox>
            <v-checkbox
              id="manageAccessPointsGatewaysLocationsshowNotInZone"
              class="ml-2 d-inline-block"
              v-model="notInZone"
              @change="drawDevices"
              color="primary"
              :label="$t('setup-not-in-zone')"
            ></v-checkbox>
            <br>
            <v-checkbox
              class="d-inline-block check-all"
              id="manageAccessPointsGatewaysLocationsCheckAll"
              @change="onCheckAllChange"
              v-model="checkAll"
              color="primary"
              :label="$t('check-all')"
            ></v-checkbox>
            <v-tabs-items v-model="tab">
              <v-tab-item key="locations">
                <v-list-item-group ref="locationScroll" class="custom-list default-scroll-bar" multiple>
                  <v-list-item
                    v-for="(location, i) in filteredLocations"
                    :key="i"
                    :draggable="location.point.length === 0 && !location.isAf3"
                    @dragstart="startDrag($event, location)"
                    @click="handleDeviceClick(location)"
                    class="custom-list-item"
                    v-bind:class="{ 'item-area-placed': location.point.length > 0 }"
                  >
                    <template v-slot:default="{  }">
                      <v-list-item-action @click="preventDefaultClick">
                        <v-checkbox @change="removeSelection" v-model="location.checked" color="primary"></v-checkbox>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>{{location.name}}</v-list-item-title>
                        <v-list-item-subtitle>{{location.macAddress}}</v-list-item-subtitle>
                        <v-list-item-subtitle> {{location.areaName}}</v-list-item-subtitle>
                        <v-icon class="custom-icon edit-icon" v-text="'mdi-pen'" @click="editDevice(location)"></v-icon>
                        <v-icon class="custom-icon view-icon" v-text="'mdi-eye-outline'" @click="viewDevice(location, $event)"></v-icon>
                      </v-list-item-content>
                    </template>
                  </v-list-item>
                </v-list-item-group>
              </v-tab-item>
              <v-tab-item key="accessPoints">
                <v-list-item-group ref="accessPointScroll" class="custom-list default-scroll-bar" multiple>
                  <v-list-item
                    v-for="(accessPoint, i) in filteredAccessPoints"
                    :key="i"
                    :draggable="accessPoint.point.length === 0"
                    @click="handleDeviceClick(accessPoint)"
                    @dragstart="startDrag($event, accessPoint)"
                    class="custom-list-item"
                    v-bind:class="{ 'item-area-placed': accessPoint.point.length > 0 }"
                  >
                    <template v-slot:default="{  }">
                      <v-list-item-action @click="preventDefaultClick">
                        <v-checkbox @change="removeSelection" v-model="accessPoint.checked" color="primary"></v-checkbox>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>{{accessPoint.name}}</v-list-item-title>
                        <v-list-item-subtitle>{{accessPoint.macAddress}}</v-list-item-subtitle>
                        <v-list-item-subtitle>{{accessPoint.areaName}}</v-list-item-subtitle>
                        <v-icon
                          class="edit-icon custom-icon"
                          v-text="'mdi-pen'"
                          @click="editDevice(accessPoint)"
                        ></v-icon>
                        <v-icon class="custom-icon view-icon" v-text="'mdi-eye-outline'" @click="viewDevice(accessPoint, $event)"></v-icon>
                      </v-list-item-content>
                    </template>
                  </v-list-item>
                </v-list-item-group>
              </v-tab-item>
              <v-tab-item key="gateways">
                <v-list-item-group ref="gatewayScroll" class="custom-list default-scroll-bar" multiple>
                  <v-list-item
                    v-for="(gateway, i) in filteredGateways"
                    :key="i"
                    :draggable="gateway.point.length === 0"
                    @click="handleDeviceClick(gateway)"
                    @dragstart="startDrag($event, gateway)"
                    class="custom-list-item"
                    v-bind:class="{ 'item-area-placed': gateway.point.length > 0 }"
                  >
                    <template v-slot:default="{  }">
                      <v-list-item-action @click="preventDefaultClick">
                        <v-checkbox @change="removeSelection" v-model="gateway.checked" color="primary"></v-checkbox>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>{{gateway.name}}</v-list-item-title>
                        <v-list-item-subtitle>{{gateway.id}}</v-list-item-subtitle>
                        <v-list-item-subtitle>{{gateway.areaName}}</v-list-item-subtitle>
                        <v-icon class="edit-icon custom-icon" v-text="'mdi-pen'" @click="editDevice(gateway)"></v-icon>
                        <v-icon class="custom-icon view-icon" v-text="'mdi-eye-outline'" @click="viewDevice(gateway, $event)"></v-icon>
                      </v-list-item-content>
                    </template>
                  </v-list-item>
                </v-list-item-group>
              </v-tab-item>
            </v-tabs-items>
            <v-card-actions class="fixed-actions">
              <v-btn
                id="manageAccessPointsGatewaysLocationsWipe"
                color="secondary"
                :disabled="disableIfNoneChecked"
                @click="wipeDevices"
                class="p-1 float-left"
              >{{$t('wipe')}}</v-btn>
              <v-btn
                id="manageAccessPointsGatewaysLocationsDelete"
                color="error"
                :disabled="disableIfNoneChecked"
                @click="deleteDevices"
                class="p-1 float-left"
              >{{$t('delete')}}</v-btn>
            </v-card-actions>
            <v-btn
              text
              id="manageAccessPointsGatewaysLocationsCancel"
              color="secondary"
              @click="closeModal"
              class="px-8 close-btn"
            >{{$t('close')}}</v-btn>
          </div>
        </v-row>
      </v-card>
    </v-dialog>
    <location-new-edit
      @changeOnLocations="refreshLocations"
      ref="locationNewEdit"
      :modalMode="modalMode"
      :area="area"
      :areas="siteAreasIndoor"
    />
    <access-point-new-edit
      @changeOnAccessPoints="refreshAccessPoints"
      ref="accessPointNewEdit"
      :modalMode="modalMode"
      :area="area"
    />
    <gateway-new-edit
      @changeOnGateways="refreshGateways"
      ref="gatewayNewEdit"
      :modalMode="modalMode"
      :area="area"
    />
    <confirm-modal
      @confirm="confirmDeleteLocation"
      @cancel="confirmationDeleteDialogLocation = false"
      :dialogModel="confirmationDeleteDialogLocation"
      :dialogBody="$t('delete-locations-are-you-sure', { amount: amountChecked })"
      :dialogTitle="$t('delete-locations')"
    />
    <confirm-modal
      @confirm="confirmDeleteGateway"
      @cancel="confirmationDeleteDialogGateway = false"
      :dialogModel="confirmationDeleteDialogGateway"
      :dialogBody="$t('delete-gateways-are-you-sure', { amount: amountChecked })"
      :dialogTitle="$t('delete-gateways')"
    />
    <confirm-modal
      @confirm="confirmDeleteAccessPoint"
      @cancel="confirmationDeleteDialogAccessPoint = false"
      :dialogModel="confirmationDeleteDialogAccessPoint"
      :dialogBody="$t('delete-access-points-are-you-sure', { amount: amountChecked })"
      :dialogTitle="$t('delete-access-points')"
    />
    <confirm-modal
      @confirm="confirmWipeLocations"
      @cancel="confirmationWipeDialogLocation = false"
      :dialogModel="confirmationWipeDialogLocation"
      :dialogBody="$t('wipe-locations-are-you-sure', { amount: amountChecked })"
      :dialogTitle="$t('wipe-locations')"
    />
    <confirm-modal
      @confirm="confirmWipeGateways"
      @cancel="confirmationWipeDialogGateway = false"
      :dialogModel="confirmationWipeDialogGateway"
      :dialogBody="$t('wipe-gateways-are-you-sure', { amount: amountChecked })"
      :dialogTitle="$t('wipe-gateways')"
    />
    <confirm-modal
      @confirm="confirmWipeAccessPoints"
      @cancel="confirmationWipeDialogAccessPoint = false"
      :dialogModel="confirmationWipeDialogAccessPoint"
      :dialogBody="$t('wipe-access-points-are-you-sure', { amount: amountChecked })"
      :dialogTitle="$t('wipe-access-points')"
    />
    <ImportDevices ref="bulkUploadModal" @finished="importCompleted" :siteId="selectedSiteId" :uploadFn="deviceUploadFn" :modalTitle="modalTitle" :idType="idType"/>
    <ViewDevice ref="viewDeviceRef"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import MapGrid from '../shared/af3-map-tools/af3-map-tools';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';
import idConstants from '../../constants/id-types';
import Search from '../../components/search-bar/search-bar'
import { orderBy } from 'natural-orderby';
import {
  getIndoorMapInitOptions,
  getMapStyles,
  addPolygonToMap,
  addFillLayerToMap,
  addLayerNameToMap,
  addLayerNameToMapPoint,
  pointsInsidePolygon,
  addPointToMap,
  drawAreaIndoorPlan,
  addPointTodraw,
  createMarker,
  removeMarker,
  checkExistingPointInDraw
} from '../../utils/map';
import LocationNewEdit from './location-new-edit';
import AccessPointNewEdit from './access-point-new-edit';
import GatewayNewEdit from './gateway-new-edit';
import ConfirmModal from '../../components/shared/modals/confirmModal';
import ImportDevices from '../assets/import-device';
import ViewDevice from './more-info-device';
import { csvMixin } from '../../mixins/csvExport';

const LOCATION_TAB = 0;
const ACCESS_POINT_TAB = 1;
const GATEWAY_TAB = 2;
//if HTML list item is edited this value must be adjusted
const LIST_ITEM_HEIGHT = 81;
export default {
  components: {
    LocationNewEdit,
    AccessPointNewEdit,
    GatewayNewEdit,
    ConfirmModal,
    Search,
    MapGrid,
    ImportDevices,
    ViewDevice
  },
  data() {
    return {
      dialog: false,
      map: null,
      mapBoxDraw: null,
      modalMode: 'create',
      indoorMap: null,
      mapLoaded: false,
      area: null,
      selectedAreaId: '',
      siteAreasIndoor: [],
      tab: null,
      showNotPlaced: false,
      checkAll: false,
      notInZone: false,
      amountChecked: 0,
      confirmationDeleteDialogLocation: false,
      confirmationDeleteDialogGateway: false,
      confirmationDeleteDialogAccessPoint: false,
      confirmationWipeDialogLocation: false,
      confirmationWipeDialogGateway: false,
      confirmationWipeDialogAccessPoint: false,
      siteLocations: [],
      siteAccessPoints: [],
      siteGateways: [],
      dirty: false,
      deviceUploadFn: null,
      selectedSiteId: '',
      modalTitle: '',
      idType: idConstants.MAC_ADDRESS,
      highlightedPoint: null,
      searchWord: '',
      viewingDevice: null
    };
  },
  computed: {
    ...mapGetters('site', ['currentSite']),
    disableIfNoneChecked() {
      return (
        (this.checkedLocations().length === 0 && this.tab === LOCATION_TAB) ||
        (this.checkedAccessPoints().length === 0 &&
          this.tab === ACCESS_POINT_TAB) ||
        (this.checkedGateways().length === 0 && this.tab === GATEWAY_TAB)
      );
    },
    filteredLocations() {
      return this.filterDevices(this.siteLocations);
    },
    filteredAccessPoints() {
      return this.filterDevices(this.siteAccessPoints);
    },
    filteredGateways() {
      return this.filterDevices(this.siteGateways);
    },
    notPlacedLocations() {
      return this.siteLocations.filter(
        (loc) => !loc.point || loc.point.length === 0
      );
    },
    notPlacedAccessPoints() {
      return this.siteAccessPoints.filter(
        (acc) => !acc.point || acc.point.length === 0
      );
    },
    notPlacedGateways() {
      return this.siteGateways.filter(
        (gat) => !gat.point || gat.point.length === 0
      );
    },
  },
  watch: {
    tab(tab) {
      if (this.dialog && this.mapBoxDraw) {
        this.uncheckAll();
        removeMarker(this.map);
        this.highlightedPoint = null;
        this.checkAll = false;
        switch (tab) {
          case LOCATION_TAB:
            this.drawPointsInArea(this.siteLocations);
            break;
          case ACCESS_POINT_TAB:
            this.drawPointsInArea(this.siteAccessPoints);
            break;
          case GATEWAY_TAB:
            this.drawPointsInArea(this.siteGateways);
            break;
          default:
            break;
        }
      }
    }
  },
  methods: {
    ...mapActions('area', ['getAreaIndoorFile', 'getAF3Points']),
    ...mapActions('location', ['getLocationsBySite', 'importLocations', 'deleteLocations', 'editLocation']),
    ...mapActions('zone', ['getZoneByArea']),
    ...mapActions('site', ['setCurrentSiteId']),
    ...mapActions('accessPoint', [
      'getAccessPointsBySite',
      'deleteAccessPoints',
      'editAccessPoint', 'importAccessPoints'
    ]),
    ...mapActions('gateway', ['getGatewaysBySite', 'deleteGateways', 'editGateway', 'importGateways']),
    async openModal(area) {
      this.area = area;
      area.site.areas.map((area)=>{
        if (area.areaLocation.toLowerCase() === 'indoor') {
          this.siteAreasIndoor.push(area)
        }
      })
      this.selectedAreaId = this.area.id;
      this.setCurrentSiteId({siteId: area.site.id});
      this.dialog = true;
      await this.fetchAllData();
      this.initMap();
    },
    async selectArea(selectedAreaId) {
      let selectedArea = this.siteAreasIndoor.find( a => a.id === selectedAreaId)
      if (selectedArea && selectedArea.id !== this.area.id) {
        this.area = selectedArea;
        this.mapLoaded = false;
        this.notInZone = false;
        this.showNotPlaced = false;
        await this.fetchAllData();
        this.initMap();
      }
    },
    handleBulkUploadClick() {
      this.selectedSiteId = this.area.site.id;
      this.idType = idConstants.MAC_ADDRESS;
      switch (this.tab) {
        case LOCATION_TAB:
          this.modalTitle = this.$i18n.t('import-locations');
          this.deviceUploadFn = this.importLocations
          break;
        case ACCESS_POINT_TAB:
          this.modalTitle = this.$i18n.t('import-accessPoints');
          this.deviceUploadFn = this.importAccessPoints
          break;
        case GATEWAY_TAB:
         this.idType = idConstants.NODE_ADDRESS;
         this.modalTitle = this.$i18n.t('import-gateways');
         this.deviceUploadFn = this.importGateways
          break;
        default:
          break;
      }
      this.$refs.bulkUploadModal.openModal();
    },
    initMap() {
      mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN || '';
      this.map = new mapboxgl.Map(
        getIndoorMapInitOptions(this.$refs.locationMapboxMap)
      );
      this.map.on(
        'load',
        function () {
          this.onLoad();
        }.bind(this)
      );
    },
    async onLoad() {
      this.mapLoaded = true;
      drawAreaIndoorPlan(this.map, this.indoorMap);
      this.drawZonesInArea();
      this.mapBoxDraw = new MapboxDraw({
        displayControlsDefault: false,
        points: '',
        controls: {},
        styles: getMapStyles(this.area.id, this),
      });
      this.map.addControl(this.mapBoxDraw, 'top-left');
      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.on('draw.create', this.handleUpdatePoint);
      this.map.on('draw.update', this.handleUpdatePoint);
      this.map.on('draw.selectionchange', this.handleSelectionChange);
      this.mapBoxDraw.changeMode('simple_select');
      switch (this.tab) {
        case LOCATION_TAB:
          this.drawPointsInArea(this.siteLocations);
          break;
        case ACCESS_POINT_TAB:
          this.drawPointsInArea(this.siteAccessPoints);
          break;
        case GATEWAY_TAB:
          this.drawPointsInArea(this.siteGateways);
          break;
        default:
          break;
      }
    },
    handleDeviceClick(device) {
      if (device.point && device.point.length && device.point != this.highlightedPoint && this.area.id === device.areaId) {
        this.highlightedPoint = device.point;
        createMarker(device.point, this.map, this.$vuetify.theme.themes.light.primaryLight, this.$vuetify.theme.themes.light.primary, .7, 3, [0,0]);
      } else {
        this.removeSelection();
      }
    },
    removeSelection() {
      this.highlightedPoint = null;
      removeMarker(this.map);
    },
    preventDefaultClick(ev) {
      ev.stopPropagation();
    },
    searchChange(value) {
      this.searchWord = value?.toLowerCase();
      switch (this.tab) {
        case LOCATION_TAB:
          this.drawPointsInArea(this.siteLocations);
          break;
        case ACCESS_POINT_TAB:
          this.drawPointsInArea(this.siteAccessPoints);
          break;
        case GATEWAY_TAB:
          this.drawPointsInArea(this.siteGateways);
          break;
        default:
          break;
      }
    },
    handleSelectionChange(ev) {
      if (ev && ev.features && ev.features[0]) {
        this.highlightedPoint = ev.features[0].geometry.coordinates;
        createMarker(this.highlightedPoint, this.map, this.$vuetify.theme.themes.light.primaryLight, this.$vuetify.theme.themes.light.primary, .7, 3, [0,0]);
        this.uncheckAll();
        let feature = ev.features[0];
        let selectedFeature = null;
        let index = null;
        let el = null;
        switch (this.tab) {
          case LOCATION_TAB:
            selectedFeature = this.siteLocations.find((loc) => feature.id === loc.id)
            index = this.filteredLocations.indexOf(selectedFeature);
            el = this.$refs.locationScroll.$el;
            break;
          case ACCESS_POINT_TAB:
            selectedFeature = this.siteAccessPoints.find((loc) => feature.id === loc.id)
            index = this.filteredAccessPoints.indexOf(selectedFeature);
            el = this.$refs.accessPointScroll.$el;
            break;
          case GATEWAY_TAB:
            selectedFeature = this.siteGateways.find((loc) => feature.id === loc.id)
            index = this.filteredGateways.indexOf(selectedFeature);
            el = this.$refs.gatewayScroll.$el;
            break;
          default:
            break;
        }
        if (selectedFeature) {
          if (el && index >= 0 && !this.showNotPlaced) {
            el.scrollTo(0, LIST_ITEM_HEIGHT*index)
          }
          selectedFeature.checked = !selectedFeature.checked;
        }
      } else {
        this.removeSelection();
        this.uncheckAll();
      }
    },
    handleUpdatePoint(ev) {
      if (ev && ev.features && ev.features[0] && !ev.features[0].properties.isAf3) {
        this.removeSelection();
        let feature = ev.features[0];
        if (this.map.getLayer(`${feature.id}-labels`)) {
          this.map.removeLayer(`${feature.id}-labels`);
          this.map.removeSource(`readonly-${feature.id}`);
        }        
        addPointToMap(this.map, feature.geometry.coordinates, feature.id, feature.properties.name);
        addLayerNameToMapPoint(this.map, feature.id);
        this.saveDevice(feature);
      }else if (ev.features[0].properties.isAf3) {
        switch (this.tab) {
          case LOCATION_TAB:
            this.drawPointsInArea(this.siteLocations);
            this.$toasted.show(this.$t('af3-locations-cant-be-moved-error'), {
              position: 'bottom-right',
              className: ['toast-error'],
              duration: 5000,
            });
            break;
          case ACCESS_POINT_TAB:
            this.drawPointsInArea(this.siteAccessPoints);
            break;
          case GATEWAY_TAB:
            this.drawPointsInArea(this.siteGateways);
            break;
          default:
          break;
      }
      }
    },
    startDrag(ev, item) {
      if (item && item.point && item.point.length === 0 && !item.isAf3) {
        ev.dataTransfer.setData('text/plain', item.id);
        ev.dataTransfer.setData('application/json', JSON.stringify(item));
        let canvas = document.getElementById("dragging");
        if (!canvas) {
          canvas = document.createElementNS(
            "http://www.w3.org/1999/xhtml",
            "canvas"
          );
          canvas.id = "dragging";
          canvas.width = canvas.height = 20;

          var ctx = canvas.getContext("2d");
          ctx.lineWidth = 4;
          ctx.fillStyle = this.$vuetify.theme.themes.light.primary;
          ctx.strokeStyle = this.$vuetify.theme.themes.light.primary;
          ctx.beginPath();
          ctx.arc(10, 10, 5, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.stroke();          
          document.body.append(canvas); 
        }
        ev.dataTransfer.setDragImage(canvas, 10, 10);
      }
    },
    handleDrop(ev) {
      if (ev && ev.dataTransfer && ev.dataTransfer.getData('application/json')) {
        ev.preventDefault();
        let data = JSON.parse(ev.dataTransfer.getData('application/json'));
        if (checkExistingPointInDraw(this.mapBoxDraw, data)) {
          return;
        }
        let p = new mapboxgl.Point(ev.layerX, ev.layerY);
        let latlng = this.map.unproject(p);
        let props = {
          name: data.name,
          isAf3: data.isAf3
        }
        addPointTodraw(this.mapBoxDraw, data.id, props, latlng.toArray());
        addPointToMap(this.map, latlng.toArray(), data.id, data.name);
        addLayerNameToMapPoint(this.map, data.id);
        data.point = latlng.toArray();
        data.name = data.name;
        this.saveDevice(data);
      }
    },
    onCheckAllChange(checked) {
      switch (this.tab) {
        case LOCATION_TAB:
          !this.showNotPlaced
            ? this.siteLocations.map((loc) =>
                this.$set(loc, 'checked', checked)
              )
            : this.notPlacedLocations.map((loc) =>
                this.$set(loc, 'checked', checked)
              );
          break;
        case ACCESS_POINT_TAB:
          !this.showNotPlaced
            ? this.siteAccessPoints.map((acc) =>
                this.$set(acc, 'checked', checked)
              )
            : this.notPlacedAccessPoints.map((acc) =>
                this.$set(acc, 'checked', checked)
              );

          break;
        case GATEWAY_TAB:
          !this.showNotPlaced
            ? this.siteGateways.map((gat) => this.$set(gat, 'checked', checked))
            : this.notPlacedGateways.map((gat) =>
                this.$set(gat, 'checked', checked)
              );
          break;
        default:
          break;
      }
    },
    drawZonesInArea() {
      if (!this.area.zones) {
        this.fetchZonesFromArea(this.area);
      } else {
        this.area.zones.map((z) => {
          let feature = {
            id: z.id,
            type: 'Feature',
            properties: {
              name: z.name,
            },
            geometry: { type: 'Polygon', coordinates: [z.polygon] },
          };
          addPolygonToMap(this.map, z.polygon, z.id, z.name);
          addFillLayerToMap(
            this.map,
            z.id,
            this.$vuetify.theme.themes.light.secondary
          );
          addLayerNameToMap(this.map, z.id);
        });
      }
    },
    drawPointsInArea(devicesArray) {
      this.removeLayers();
      this.removeSelection();
      this.filterDevicesForMap(devicesArray).map((device) => {        
        let props = {
          name: device.name,
          isAf3: device.isAf3
        }
        if (device.areaId === this.area.id && device.point && device.point.length > 0) {
          addPointTodraw(this.mapBoxDraw, device.id, props, device.point);
          addPointToMap(this.map, device.point, device.id, device.name);
          addLayerNameToMapPoint(this.map, device.id);
        }
      });
    },
    removeLayers() {
      this.mapBoxDraw.deleteAll();
      this.siteLocations.map((loc)=>{
        if (this.map.getLayer(`${loc.id}-labels`)) {
            this.map.removeLayer(`${loc.id}-labels`);
            this.map.removeSource(`readonly-${loc.id}`);
          }
      })
      this.siteAccessPoints.map((acc)=>{
        if (this.map.getLayer(`${acc.id}-labels`)) {
            this.map.removeLayer(`${acc.id}-labels`);
            this.map.removeSource(`readonly-${acc.id}`);
          }
      })
      this.siteGateways.map((gat)=>{
        if (this.map.getLayer(`${gat.id}-labels`)) {
            this.map.removeLayer(`${gat.id}-labels`);
            this.map.removeSource(`readonly-${gat.id}`);
          }
      })
    },
    viewDevice(device, ev) {
      ev.stopPropagation();
      this.$refs.viewDeviceRef.openModal(device);
    },
    addDevice() {
      this.modalMode = 'create';
      switch (this.tab) {
        case LOCATION_TAB:
          this.$refs.locationNewEdit.openModal();
          break;
        case ACCESS_POINT_TAB:
          this.$refs.accessPointNewEdit.openModal();
          break;
        case GATEWAY_TAB:
          this.$refs.gatewayNewEdit.openModal();
          break;
        default:
          break;
      }
    },
    editDevice(device) {
      this.modalMode = 'edit';
      switch (this.tab) {
        case LOCATION_TAB:
          this.$refs.locationNewEdit.openModal(device);
          break;
        case ACCESS_POINT_TAB:
          this.$refs.accessPointNewEdit.openModal(device);
          break;
        case GATEWAY_TAB:
          this.$refs.gatewayNewEdit.openModal(device);
          break;
        default:
          break;
      }
    },
    deleteDevices() {
      switch (this.tab) {
        case LOCATION_TAB:
          this.amountChecked = this.checkedLocations().length;
          this.confirmationDeleteDialogLocation = true;
          break;
        case ACCESS_POINT_TAB:
          this.amountChecked = this.checkedAccessPoints().length;
          this.confirmationDeleteDialogAccessPoint = true;
          break;
        case GATEWAY_TAB:
          this.amountChecked = this.checkedGateways().length;
          this.confirmationDeleteDialogGateway = true;
          break;
        default:
          break;
      }
    },
    wipeDevices() {
      switch (this.tab) {
        case LOCATION_TAB:
          this.amountChecked = this.checkedLocations().length;
          this.confirmationWipeDialogLocation = true;
          break;
        case ACCESS_POINT_TAB:
          this.amountChecked = this.checkedAccessPoints().length;
          this.confirmationWipeDialogAccessPoint = true;
          break;
        case GATEWAY_TAB:
          this.amountChecked = this.checkedGateways().length;
          this.confirmationWipeDialogGateway = true;
          break;
        default:
          break;
      }
    },
    async confirmDeleteLocation() {
      let locations = [];
      this.checkedLocations().map((checkedLoc) => {
        locations.push(checkedLoc.id);
      });
      let payload = {
        nodeAddresses: locations,
        siteId: this.area.site.id,
      };
      try {
        let resp = await this.deleteLocations(payload);
        this.$toasted.show(
          this.checkedLocations().length + ' ' + this.$t('locations-deleted'),
          {
            position: 'bottom-right',
            className: ['toast-success'],
            action: {
              text: this.$t('devices-page-ok'),
              onClick: (e, toastObject) => {
                toastObject.goAway(0);
              },
            },
          }
        );
        this.confirmationDeleteDialogLocation = false;
        this.dirty = true;
        this.removeLayers();
        this.refreshLocations();
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
        this.confirmationDeleteDialogLocation = false;
      }
    },
    async confirmDeleteGateway() {
      let gateways = [];
      this.checkedGateways().map((checkedGat) => {
        gateways.push(checkedGat.id);
      });
      let payload = {
        nodeAddresses: gateways,
        siteId: this.area.site.id,
      };
      try {
        let resp = await this.deleteGateways(payload);
        this.$toasted.show(
          this.checkedGateways().length + ' ' + this.$t('gateways-deleted'),
          {
            position: 'bottom-right',
            className: ['toast-success'],
            action: {
              text: this.$t('devices-page-ok'),
              onClick: (e, toastObject) => {
                toastObject.goAway(0);
              },
            },
          }
        );
        this.confirmationDeleteDialogGateway = false;
        this.dirty = true;
        this.removeLayers();
        this.refreshGateways();
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
        this.confirmationDeleteDialogGateway = false;
      }
    },
    async confirmDeleteAccessPoint() {
      let accessPoints = [];
      this.checkedAccessPoints().map((checkedAcc) => {
        accessPoints.push(checkedAcc.id);
      });
      let payload = {
        nodeAddresses: accessPoints,
        siteId: this.area.site.id,
      };
      try {
        let resp = await this.deleteAccessPoints(payload);
        this.$toasted.show(
          this.checkedAccessPoints().length +
            ' ' +
            this.$t('access-points-deleted'),
          {
            position: 'bottom-right',
            className: ['toast-success'],
            action: {
              text: this.$t('devices-page-ok'),
              onClick: (e, toastObject) => {
                toastObject.goAway(0);
              },
            },
          }
        );
        this.confirmationDeleteDialogAccessPoint = false;
        this.dirty = true;
        this.removeLayers();
        this.refreshAccessPoints();
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
        this.confirmationDeleteDialogAccessPoint = false;
      }
    },
    async confirmWipeLocations() {
      let promises = [];
      try {
        this.checkedLocations().map((loc) => {
        let location = {
          areaId: null,
          mapPoint: "",
          name: loc.name,
          siteId: this.area.site.id,
          zoneId: null
        }
        let locationId = loc.id;
        promises.push(this.editLocation({locationId, location}));
      })
      let resp = await Promise.all(promises);
      this.confirmationWipeDialogLocation = false;
      this.dirty = true;
      this.refreshLocations();
      this.$toasted.show(resp.length + ' ' + this.$t('locations-wiped'), { 
          position: "bottom-right",
          className: ['toast-success'], 
          duration : 2000
        });
      } catch (error) {
        this.$toasted.show(error, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
      }
    },
    async confirmWipeAccessPoints() {
      let promises = [];
      try {
        this.checkedAccessPoints().map((acc) => {
        let accessPoint = {
          areaId: null,
          mapPoint: "",
          name: acc.name,
          siteId: this.area.site.id,
          zoneId: null
        }
        let accessPointId = acc.id;
        promises.push(this.editAccessPoint({accessPointId, accessPoint}));
      })
      let resp = await Promise.all(promises);
      this.confirmationWipeDialogAccessPoint = false;
      this.dirty = true;
      this.refreshAccessPoints();
      this.$toasted.show(resp.length + ' ' + this.$t('access-points-wiped'), { 
          position: "bottom-right",
          className: ['toast-success'], 
          duration : 2000
        });
      } catch (error) {
        this.$toasted.show(error, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
      }
    },
    async confirmWipeGateways() {
      let promises = [];
      try {
        this.checkedGateways().map((gat) => {
        let gateway = {
          areaId: null,
          mapPoint: "",
          name: gat.name,
          siteId: this.area.site.id,
          zoneId: null
        }
        let gatewayId = gat.id;
        promises.push(this.editGateway({gatewayId, gateway}));
      })
      let resp = await Promise.all(promises);
      this.confirmationWipeDialogGateway = false;
      this.dirty = true;
      this.refreshGateways();
      this.$toasted.show(resp.length + ' ' + this.$t('gateways-wiped'), { 
          position: "bottom-right",
          className: ['toast-success'], 
          duration : 2000
        });
      } catch (error) {
        this.$toasted.show(error, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
      }
    },
    async saveDevice(device) {
      this.dirty = true;
      let devicePoint = device.geometry && device.geometry.coordinates || device.point;
      let hasZone = false;
      this.area.zones?.map((zone) => {
        if (pointsInsidePolygon([devicePoint], zone.polygon)) {
          device.zone = zone;
          hasZone = true;
          return;
        }
      })
      if (!hasZone) {
        device.zone = null;
      }
      let deviceToSave = {
        zoneId: device.zone?.id || '',
        areaId: this.area.id,
        siteId: this.area.site.id,
        name: device.properties && device.properties.name || device.name,
        mapPoint: devicePoint.toString()
      }
      switch (this.tab) {
        case LOCATION_TAB:
          this.handleEditLocation(device.id, deviceToSave);
          break;
        case ACCESS_POINT_TAB:
          this.handleEditAccessPoint(device.id, deviceToSave);
          break;
        case GATEWAY_TAB:
          this.handleEditGateway(device.id, deviceToSave);
          break;
        default:
          break;
      }
    },
    async handleEditLocation(locationId, location) {
      try {
          let resp = await this.editLocation({locationId, location})
          this.$toasted.show(this.$t('location-edited'), {
              position: 'bottom-right',
              className: ['toast-success'],
              duration: 2000,
            });
            this.refreshLocations();
        } catch (error) {
            this.$toasted.show(error, {
              position: 'bottom-right',
              className: ['toast-error'],
              duration: 5000,
            });
        }
    },
    async handleEditAccessPoint(accessPointId, accessPoint) {
      try {
          let resp = await this.editAccessPoint({accessPointId, accessPoint})
          this.$toasted.show(this.$t('access-point-edited'), {
              position: 'bottom-right',
              className: ['toast-success'],
              duration: 2000,
            });
            this.refreshAccessPoints();
        } catch (error) {
            this.$toasted.show(error, {
              position: 'bottom-right',
              className: ['toast-error'],
              duration: 5000,
            });
        }
    },
    async handleEditGateway(gatewayId, gateway) {
      try {
          let resp = await this.editGateway({gatewayId, gateway})
          this.$toasted.show(this.$t('gateway-edited'), {
              position: 'bottom-right',
              className: ['toast-success'],
              duration: 2000,
            });
            this.refreshGateways();
        } catch (error) {
            this.$toasted.show(error, {
              position: 'bottom-right',
              className: ['toast-error'],
              duration: 5000,
            });
        }
    },
    async fetchAllData() {
      try {
        const indoorMapImage = this.getAreaIndoorFile({ areaId: this.area.id });
        const locReq = this.getLocationsBySite({ siteId: this.area.site.id });
        const gatReq = this.getGatewaysBySite({ siteId: this.area.site.id });
        const accReq = this.getAccessPointsBySite({
          siteId: this.area.site.id,
        });
        this.indoorMap = await indoorMapImage;
        this.siteLocations = await locReq;
        if (this.currentSite.isAf3) {
          this.setAf3LatLng(this.siteLocations, this.area.id);
        }
        this.siteAccessPoints = await accReq;
        this.siteGateways = await gatReq;
      } catch (error) {
        throw error;
      }
    },
    setAf3LatLng(locations, floorId) {
      locations.map((location)=>{
        location.isAf3 = true;
        if (location.areaId === floorId && location.latitude) {
          location.point = [location.latitude, location.longitude];
        }
      })
    },
    async fetchZonesFromArea(area) {
      try {
        let zones = await this.getZoneByArea(area.id);
        this.$set(
          area,
          'zones',
          zones
        );
        area.zones.forEach(zone => {
          this.$set(zone, 'area', area);
        });
        this.drawZonesInArea();
      } catch (e) {
        throw new Error(this.$t('something-went-wrong'), e);
      }
    },
    async refreshLocations() {
      try {
        this.siteLocations = await this.getLocationsBySite({
          siteId: this.area.site.id,
        });
        this.drawPointsInArea(this.siteLocations);
        this.checkAll = false;
      } catch (error) {
        throw error;
      }
    },
    async refreshAccessPoints() {
      try {
        this.siteAccessPoints = await this.getAccessPointsBySite({
          siteId: this.area.site.id,
        });
        this.checkAll = false;
        this.drawPointsInArea(this.siteAccessPoints);
      } catch (error) {
        throw error;
      }
    },
    async refreshGateways() {
      try {
        this.siteGateways = await this.getGatewaysBySite({
          siteId: this.area.site.id,
        });
        this.checkAll = false;
        this.drawPointsInArea(this.siteGateways);
      } catch (error) {
        throw error;
      }
    },
    drawDevices(value) {
      if (!value || this.notInZone) {
          switch (this.tab) {
            case LOCATION_TAB:
            this.drawPointsInArea(this.siteLocations);
            break;
          case ACCESS_POINT_TAB:
            this.drawPointsInArea(this.siteAccessPoints);
            break;
          case GATEWAY_TAB:
            this.drawPointsInArea(this.siteGateways);
            break;
          default:
            break;
        }
      }
    },
    filterDevices(devices) {
        return orderBy(devices.filter((l) => {
          return (
            l.name?.toLowerCase().includes(this.searchWord) || l.areaId?.includes(this.searchWord) || 
            l.areaName?.toLowerCase().includes(this.searchWord) || l.macAddress?.replace(/\:/g,'').includes(this.searchWord.replace(/\:/g,'')) || 
            l.id?.includes(this.searchWord) || l.zoneId?.includes(this.searchWord) || l.zoneName?.toLowerCase().includes(this.searchWord)) 
            && (!this.showNotPlaced || (!l.point || l.point.length === 0)) && (!this.notInZone || !l.zoneId)
      }), [v=>v.name], ["asc"]);
    },
    filterDevicesForMap(devices) {
        return orderBy(devices.filter((l) => {
          return (
            l.name?.toLowerCase().includes(this.searchWord) || l.areaId?.includes(this.searchWord) || 
            l.areaName?.toLowerCase().includes(this.searchWord) || l.macAddress?.replace(/\:/g,'').includes(this.searchWord.replace(/\:/g,'')) || 
            l.id?.includes(this.searchWord) || l.zoneId?.includes(this.searchWord) || l.zoneName?.toLowerCase().includes(this.searchWord)) 
            && (!this.notInZone || !l.zoneId)
      }), [v=>v.name], ["asc"]);
    },
    importCompleted() {
      switch (this.tab) {
        case LOCATION_TAB:
          this.refreshLocations();
          break;
        case ACCESS_POINT_TAB:
          this.refreshAccessPoints();
          break;
        case GATEWAY_TAB:
         this.refreshGateways();
          break;
        default:
          break;
      }
    },
    checkedLocations() {
      return this.siteLocations.filter((loc) => loc.checked);
    },
    checkedAccessPoints() {
      return this.siteAccessPoints.filter((acc) => acc.checked);
    },
    checkedGateways() {
      return this.siteGateways.filter((gat) => gat.checked);
    },
    uncheckAll() {
      this.siteLocations.map((loc) => loc.checked = false);
      this.siteGateways.map((loc) => loc.checked = false);
      this.siteAccessPoints.map((loc) => loc.checked = false);
    },
    handleExportClick() {
      let exportArray = [];
      let fileName = this.area.site.value + ' - ';
      switch (this.tab) {
        case LOCATION_TAB:
          fileName += 'Locations';
          this.checkedLocations().map((loc)=>{
            exportArray.push({
              name: loc.name,
              mac_address: loc.macAddress
            })
          });
          break;
        case ACCESS_POINT_TAB:
          fileName += 'Access Points';
          this.checkedAccessPoints().map((acc)=>{
            exportArray.push({
              name: acc.name,
              mac_address: acc.macAddress
            })
          });
          break;
        case GATEWAY_TAB:
          fileName += 'Gateways';
          this.checkedGateways().map((gat)=>{
            exportArray.push({
              name: gat.name,
              id: gat.id
            })
          });
          break;
        default:
          break;
      }
      csvMixin.methods.csvExport(
        exportArray,
        fileName
      );
    },
    closeModal() {
      this.dialog = false;
      this.mapLoaded = false;
      this.indoorMap = null;
      this.tab = 0;
      this.searchWord = '';
      this.notInZone = false;
      this.siteAreasIndoor = [];
      if (this.dirty) {
        this.$emit('locationAccessPointGatewayHasChanges', this.area.site);
      }
      this.dirty = false;
    }
  },
};
</script>

<style lang="scss" scoped>
.map-container {
  height: 100%;
  width: 100%;
  padding: 0 !important;
  opacity: 0;
}
.search-container {
  width: 100%;
  position: absolute;
  top: 70px;
  z-index: 1;
  max-width: 434px;
}
.or-divider {
  z-index: 1;
  left: 25px;
  position: relative;
}
.actions-panel {
  width: 25%;
  border-left: 1px solid;
  color: rgba(0, 0, 0, 0.12);
}
.check-all {
  margin-top: 0px;
  margin-bottom: -14px;
  margin-left: 16px;
}
.map-panel {
  width: 75%;
  height: 100%;
  padding: 0px 0px 0px 10px !important;
}
.v-tabs.v-tabs--vertical {
  height: 130px;
}
.v-tabs--vertical > .v-tabs-bar .v-tab {
  max-width: inherit;
}
.v-list-item--link:before {
  background-color: inherit;
}
.v-list-item--link:hover {
  background-color: var(--v-primaryLight-base);
}
.v-list-item__title {
  color: black;
}
.v-list-item__action {
  margin-right: 15px !important;
}
.fixed-actions {
  position: absolute;
  bottom: 10px;
}
.close-btn {
  position: absolute;
  right: 10px;
  bottom: 18px;
}
.custom-list {
  height: calc(100vh - 421px);
  overflow-y: auto;
  scroll-behavior: smooth;
  max-width: 95%;
}
.custom-list-item {
  min-height: 81px;
}
.custom-icon {
  position: absolute;
  right: 3%;
  cursor: pointer;
  max-width: 25px;
  &:hover {
    color: var(--v-secondary-base);
  }
}
.view-icon {
  top: 10px !important;
}
.edit-icon {
  top: 40px !important;
}
.card-title {
  height: 70px;
  padding-top: 5px !important;
}
.area-selector {
  display: inline-block;
  width: 300px;
  margin-bottom: -35px;
}
.item-area-placed {
  background-color: rgba(0, 0, 0, 0.06);
}
.grid-control {
  top: 135px;
  left: 15px;
}
</style>