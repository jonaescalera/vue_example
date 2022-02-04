<template>
  <div>
    <v-dialog v-model="dialog" width="92vw" scrollable persistent>
      <v-card id="mapPolygonZoneCreate">
        <v-card-title class="secondary">
          <div v-if="area">
            {{$t('area')}}:
            <b>{{area.name}}</b>
          </div>
          <div class="ml-2" v-if="area && area.site">
            | {{$t('site')}}:
            <b>{{area.site.value}}</b>
          </div>
        </v-card-title>
        <v-card-text v-bind:class="{ 'map-loaded': mapLoaded }" class="map-container">
          <MapGrid
            class="grid-control"
            v-if="area && indoorMap && area.site && area.site.isAf3"
            :areaFileMapping="indoorMap"
            :draggable="true"
            :map="map"
            :mapLoaded="mapLoaded"
            :selectedFloor="area.id"
          />
          <div class="w-100 h-100" ref="zoneMapboxMap"></div>
        </v-card-text>
        <v-card-text class="invalid-polygon" v-if="invalidPolygon">{{$t('invalid-zone')}}</v-card-text>
        <v-card-actions class="card-actions">
          <v-col cols="10">
            <v-form class="zone-form" @submit.stop.prevent="handleSave(null)" id="zoneNameEditForm">
              <v-text-field
                ref="zoneNameInput"
                :label="$t('name')"
                tabindex="1"
                :dense="true"
                v-model="form.name"
                outlined
                class="zone-name"
                :error-messages="nameErrors"
                @input="$v.form.name.$touch()"
                @blur="$v.form.name.$touch()"
                color="secondary"
              ></v-text-field>
              <v-btn
                depressed
                id="saveZoneBtn"
                color="secondary"
                tabindex="2"
                @click="handleSave(null)"
                :disabled="!currentZone || invalidPolygon"
                class="px-8 save-zone-btn"
              >{{$t('save')}}</v-btn>
              <v-btn
                depressed
                id="deleteZoneBtn"
                color="error"
                tabindex="3"
                @click="handleDeleteZone"
                :disabled="!currentZone || invalidPolygon || isCreating"
                class="px-8 ml-2 delete-zone-btn"
              >{{$t('delete')}}</v-btn>
            </v-form>
          </v-col>
          <v-col cols="2">
            <v-btn
              text
              id="zoneUploadMapPolygonBtnCancel"
              color="secondary"
              tabindex="4"
              @click="closeModal"
              class="px-8 float-right"
            >{{$t('close')}}</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <warn-modal
      @save="handleSave"
      @undo="handleUndo"
      :invalidPolygon="invalidPolygon"
      :zoneName="form.name"
      ref="warnModal"
    />
    <confirm-modal
      @confirm="confirmDeleteZone"
      @cancel="confirmationDeleteDialogZone = false"
      :dialogModel="confirmationDeleteDialogZone"
      :dialogBody="$t('delete-are-you-sure', { name: form.name })"
      :dialogTitle="$t('delete-zone')"
    />
    <confirm-modal
      @confirm="confirmCloseModal"
      @cancel="confirmationCloseDialog = false"
      :dialogModel="confirmationCloseDialog"
      :dialogBody="$t('unsaved-changes-are-you-sure')"
      :dialogTitle="$t('unsaved-changes')"
    />
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import ZoneConfirmChanges from './zone-polygon-warn-dialog';
import ConfirmDialog from '../shared/modals/confirmModal';
import MapGrid from '../shared/af3-map-tools/af3-map-tools';
import { validationMixin } from 'vuelidate';
import {
  fitPolygon,
  getMapStyles,
  getMapInitOptions,
  getIndoorMapInitOptions,
  pointsToString,
  addPolygonToMap,
  addFillLayerToMap,
  addLayerNameToMap,
  pointsInsidePolygon,
  drawAreaIndoorPlan,
} from '../../utils/map';
import { mapActions, mapGetters } from 'vuex';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
export default {
  data() {
    return {
      map: null,
      mapBoxDraw: null,
      dialog: false,
      mapLoaded: false,
      dirty: false,
      area: null,
      isCreating: false,
      zoneHasChanges: false,
      indoorMap: null,
      currentZone: null,
      originalZones: {},
      invalidPolygon: false,
      confirmationDeleteDialogZone: false,
      confirmationCloseDialog: false,
      form: {
        name: '',
      },
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      name: {
        required,
      },
    },
  },
  components: {
    MapGrid,
    'warn-modal': ZoneConfirmChanges,
    'confirm-modal': ConfirmDialog,
  },
  computed: {
    ...mapGetters('site', ['currentSite']),
    nameErrors() {
      const errors = [];
      if (!this.$v.form.name.$dirty) return errors;
      !this.$v.form.name.required &&
        errors.push(this.$t('error-name-required'));
      return errors;
    },
  },
  methods: {
    ...mapActions('zone', ['createZone', 'editZone', 'deleteZone']),
    ...mapActions('area', ['getAreaIndoorFile', 'getAF3Points']),
    ...mapActions('location', ['editLocations']),
    ...mapActions('gateway', ['editGateways']),
    ...mapActions('accessPoint', ['editAccessPoints']),
    openModal(area) {
      this.invalidPolygon = false;
      this.dialog = true;
      this.area = area;
      this.resetForm();
      this.originalZones = this.createZonesDuplicates();
      if (area && area.areaLocation === 'outdoor') {
        //because of the map being inside a vuetify dialog, the map init needs to be wrapped by a timeout
        setTimeout(() => {
          this.initMap();
        }, 0);
      } else if (area && area.areaLocation === 'indoor') {
        if (area.indoorMapping) {
          this.initIndoorMap(area);
        }
      }
    },
    async initIndoorMap(area) {
      try {
        const indoorMapImage = await this.getAreaIndoorFile({
          areaId: area.id,
        });
        this.indoorMap = indoorMapImage;
        this.initMap();
      } catch (error) {
        throw error;
      }
    },
    initMap() {
      mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN || '';
      if (this.area && this.area.areaLocation === 'indoor') {
        this.map = new mapboxgl.Map(getIndoorMapInitOptions(this.$refs.zoneMapboxMap));
      } else {
        this.map = new mapboxgl.Map(getMapInitOptions(this.$refs.zoneMapboxMap));
      }
      this.map.on(
        'load',
        function() {
          this.onLoad();
        }.bind(this)
      );
    },
    onLoad() {
      if (this.area.areaLocation === 'indoor') {
        drawAreaIndoorPlan(this.map, this.indoorMap);
      }
      this.mapBoxDraw = new MapboxDraw({
        displayControlsDefault: false,
        points: '',
        controls: {
          polygon: true,
        },
        styles: getMapStyles(this.area.id, this),
      });
      this.map.addControl(this.mapBoxDraw, 'top-left');
      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.on('draw.create', this.handleUpdateZone);
      this.map.on('draw.update', this.handleUpdateZone);
      this.map.on('draw.selectionchange', this.handleMapClick);
      if (this.area.areaLocation === 'outdoor') {
        let scaleControl = new mapboxgl.ScaleControl({
          maxWidth: 80,
          unit: 'metric',
        });
        this.map.addControl(scaleControl);
        this.loadOutdoorArea(this.area.id, this.area.polygon);
      }
      this.loadZones(this.area.zones);
    },
    loadOutdoorArea(id, polygon) {
      addPolygonToMap(this.map, polygon, id);
      addFillLayerToMap(
        this.map,
        id,
        this.$vuetify.theme.themes.light.secondary
      );
      fitPolygon(this.map, polygon);
    },
    loadZones(zones) {
      if (zones) {
        zones.map(z => {
          let feature = {
            id: z.id,
            type: 'Feature',
            properties: {
              name: z.name,
            },
            geometry: { type: 'Polygon', coordinates: [z.polygon] },
          };
          this.mapBoxDraw.add(feature);
          addPolygonToMap(this.map, z.polygon, z.id, z.name);
          addLayerNameToMap(this.map, z.id);
        });
      }
      this.mapLoaded = true;
    },
    handleMapClick(ev) {
      let zone = ev?.features[0];
      if (zone) {
        if (this.currentZone) {
          if (this.currentZone.id !== zone.id && this.zoneHasChanges) {
            this.$refs.warnModal.openModal();
          } else {
            this.currentZone = zone;
            this.setZoneName(zone);
          }
        } else {
          this.currentZone = zone;
          this.setZoneName(zone);
        }
      } else {
        if (this.zoneHasChanges) {
          this.$refs.warnModal.openModal();
        } else {
          this.currentZone = null;
          this.resetForm();
        }
      }
    },
    setZoneName(zone) {
      let name = zone?.name || zone?.properties?.name;
      if (name) {
        this.form.name = name;
      }
    },
    handleUpdateZone(ev) {
      this.zoneHasChanges = true;
      this.invalidPolygon = false;
      this.currentZone = ev.features[0];
      if (this.currentZone) {
        let polygon = this.currentZone.geometry.coordinates[0];
        if (ev.type === 'draw.update') {
          this.form.name =
            this.currentZone.name || this.currentZone.properties?.name;
          this.refreshZones(this.currentZone);
        } else if (ev.type === 'draw.create') {
          this.isCreating = true;
          this.resetForm();
        }
        if (this.area && this.area.areaLocation === 'outdoor') {
          pointsInsidePolygon(polygon, this.area.polygon)
            ? (this.invalidPolygon = false)
            : (this.invalidPolygon = true);
        }
        this.$refs.zoneNameInput.focus();
      }
    },
    handleDeleteZone() {
      this.confirmationDeleteDialogZone = true;
    },
    refreshZones(updatedZone) {
      let editedZone = this.getZone(updatedZone, this.area.zones);
      if (editedZone && editedZone.name) {
        Object.assign(editedZone, updatedZone);
        this.$set(editedZone, 'polygon', updatedZone.geometry.coordinates[0]);
        this.map.removeLayer(`${editedZone.id}-labels`);
        this.map.removeSource(`readonly-${editedZone.id}`);
        addPolygonToMap(
          this.map,
          editedZone.polygon,
          editedZone.id,
          editedZone.name
        );
        addLayerNameToMap(this.map, editedZone.id);
        this.form.name = editedZone.name;
      } else if (
        !this.getZone(updatedZone, this.area.zones) &&
        updatedZone.creationId
      ) {
        let newZone = {
          id: updatedZone.id,
          creationId: updatedZone.creationId,
          name: this.form.name,
          polygon: updatedZone.geometry.coordinates[0],
        };
        this.area.zones.push(newZone);
        addPolygonToMap(this.map, newZone.polygon, newZone.id, newZone.name);
        addLayerNameToMap(this.map, newZone.id);
        this.originalZones = this.createZonesDuplicates();
      }
    },
    handleSave(name) {
      if (name) {
        this.form.name = name;
      }
      if (this.currentZone) {
        let zoneToEdit = this.getZone(this.currentZone, this.area.zones);
        if (zoneToEdit && !this.isCreating) {
          this.handleEditZone(zoneToEdit);
        } else {
          this.handleAddZone();
        }
      }
    },
    handleUndo() {
      let originalZone = this.getZone(this.currentZone, this.originalZones);
      if (this.currentZone && originalZone) {
        this.mapBoxDraw.delete(this.currentZone.id);
        if (this.map.getLayer(`${this.currentZone.id}-labels`)) {
          this.map.removeLayer(`${this.currentZone.id}-labels`);
          this.map.removeSource(`readonly-${this.currentZone.id}`);
          addPolygonToMap(
            this.map,
            originalZone.polygon,
            originalZone.id,
            originalZone.name
          );
          addLayerNameToMap(this.map, originalZone.id);
          let feature = {
            id: originalZone.id,
            type: 'Feature',
            properties: {
              name: originalZone.name,
            },
            geometry: { type: 'Polygon', coordinates: [originalZone.polygon] },
          };
          this.mapBoxDraw.add(feature);
        }
      } else if (!originalZone) {
        this.mapBoxDraw.delete(this.currentZone.id);
      }
      this.zoneHasChanges = false;
      this.invalidPolygon = false;
      this.$v.form.$reset();
      this.currentZone = null;
    },
    createZonesDuplicates() {
      let dups = [];
      if (this.area.zones) {
        this.area.zones.map(z => {
          let zone = {
            polygon: JSON.parse(JSON.stringify(z.polygon)),
            name: z.name,
            id: z.id,
          };
          dups.push(zone);
        });
      }
      return dups;
    },
    async handleAddZone() {
      this.$v.$touch();
      if (this.$v.form.$anyError) {
        return;
      }
      if (!this.invalidPolygon) {
        let payload = {
          configValue: this.form.name,
          properties: {
            points: pointsToString(this.currentZone.geometry.coordinates[0]),
            areaId: this.area.id,
            siteId: this.area.site.id,
          },
        };
        try {
          const newZone = await this.createZone(payload);
          if (this.area.locations || (this.area.site.gateways && this.area.site.gateways.length > 0) || (this.area.site.accessPoints && this.area.site.accessPoints.length > 0)) {
            await this.updateDevices(
              newZone.data.id,
              this.currentZone
            );
          }
          this.$toasted.show(this.$t('zone-created'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          this.currentZone.creationId = newZone.data.id;
          this.refreshZones(this.currentZone);
          this.currentZone = null;
          this.zoneHasChanges = false;
          this.isCreating = false;
          this.dirty = true;
          this.resetForm();
        } catch (error) {
          this.$toasted.show(error, {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });
        }
      }
    },
    async handleEditZone(zone) {
      if (this.$v.form.$anyError) {
        return;
      }
      if (!this.invalidPolygon) {
        let payload = {
          data: {
            configValue: this.form.name,
            name: this.form.name,
            points: pointsToString(zone.polygon),
          },
          id: zone.creationId || zone.id,
        };
        try {
          const zoneEdited = await this.editZone(payload);
          if (this.area.locations || (this.area.site.gateways && this.area.site.gateways.length > 0) || (this.area.site.accessPoints && this.area.site.accessPoints.length > 0)) {
            await this.updateDevices(
              payload.id,
              this.currentZone
            );
          }
          this.$toasted.show(this.$t('zone-edited'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          this.currentZone.name = zoneEdited?.value;
          this.currentZone.properties.name = zoneEdited?.value;
          this.refreshZones(this.currentZone);
          this.currentZone = null;
          this.zoneHasChanges = false;
          this.originalZones = this.createZonesDuplicates();
          this.dirty = true;
          this.resetForm();
        } catch (error) {
          this.$toasted.show(error, {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });
        }
      }
    },
    async confirmDeleteZone() {
      let zoneToDelete = this.getZone(this.currentZone, this.area.zones);
      try {
        const zoneId = zoneToDelete.creationId || zoneToDelete.id;
        const resp = await this.deleteZone(zoneId);
        this.$toasted.show(this.$t('zone-deleted'), {
          position: 'bottom-right',
          className: ['toast-success'],
          duration: 1500,
        });
        this.map.removeLayer(`${this.currentZone.id}-labels`);
        this.map.removeSource(`readonly-${this.currentZone.id}`);
        this.mapBoxDraw.delete(this.currentZone.id);
        let index = this.area.zones.indexOf(zoneToDelete);
        this.area.zones.splice(index, 1);
        this.currentZone = null;
        this.zoneHasChanges = false;
        this.originalZones = this.createZonesDuplicates();
        this.confirmationDeleteDialogZone = false;
        this.dirty = true;
        this.resetForm();
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 1500,
        });
      }
    },
    getZone(zone, zones) {
      let zoneFound = zones.find(z => z.id === zone.id);
      return zoneFound;
    },
    async updateDevices(zoneId, polygon) {
      const locationsToUpdateWithZone = [];
      const locationsOutOfZone = [];

      const gatewaysToUpdateWithZone = [];
      const gatewaysOutOfZone = [];

      const accessPointsToUpdateWithZone = [];
      const accessPointsOutOfZone = [];
      let assignedLocations = [];
      if (this.area && this.area.locations) {
        assignedLocations = this.area.locations.filter(
          (location) => location.point.length
        );
      }
      let assignedGateways = [];
      if (this.area && this.area.site && this.area.site.gateways) {
        assignedGateways = this.area.site.gateways.filter(
          (gateway) => gateway.point.length && gateway.areaId === this.area.id
        );
      }
      let assignedAccessPoints = [];
      if (this.area && this.area.site && this.area.site.accessPoints) {
        assignedAccessPoints = this.area.site.accessPoints?.filter(
          (accessPoint) => accessPoint.point.length && accessPoint.areaId === this.area.id
        );
      }
      assignedLocations.forEach((location) => {
        // To check if LB has moved in/out of the zone
        if (location.zoneId === zoneId) {
          if (!booleanPointInPolygon(location.point, polygon)) {
            location.zoneId = null;
            locationsOutOfZone.push({
              id: location.id,
              name: location.name,
              zoneId: null,
            });
          }
        } else if (booleanPointInPolygon(location.point, polygon)) {
          location.zoneId = zoneId;
          locationsToUpdateWithZone.push({
            id: location.id,
            name: location.name,
            zoneId: zoneId,
          });
        }
      });

      assignedGateways.forEach((gateway) => {
        if (gateway.zoneId === zoneId) {
          if (!booleanPointInPolygon(gateway.point, polygon)) {
            gateway.zoneId = null;
            gatewaysOutOfZone.push({
              id: gateway.id,
              name: gateway.name,
              zoneId: null,
            });
          }
        } else if (booleanPointInPolygon(gateway.point, polygon)) {
          gateway.zoneId = zoneId;
          gatewaysToUpdateWithZone.push({
            id: gateway.id,
            name: gateway.name,
            zoneId: zoneId,
          });
        }
      });

      assignedAccessPoints.forEach((accessPoint) => {
        if (accessPoint.zoneId === zoneId) {
          if (!booleanPointInPolygon(accessPoint.point, polygon)) {
            accessPoint.zoneId = null;
            accessPointsOutOfZone.push({
              id: accessPoint.id,
              name: accessPoint.name,
              zoneId: null,
            });
          }
        } else if (booleanPointInPolygon(accessPoint.point, polygon)) {
          accessPoint.zoneId = zoneId;
          accessPointsToUpdateWithZone.push({
            id: accessPoint.id,
            name: accessPoint.name,
            zoneId: zoneId,
          });
        }
      });

      const locationsToUpdate = [
        ...locationsToUpdateWithZone,
        ...locationsOutOfZone,
      ];
      if (locationsToUpdate.length) {
        await this.editLocations(locationsToUpdate);
      }
      const gatewaysToUpdate = [
        ...gatewaysToUpdateWithZone,
        ...gatewaysOutOfZone,
      ];
      if (gatewaysToUpdate.length) {
        await this.editGateways(gatewaysToUpdate);
      }
      const accessPointsToUpdate = [
        ...accessPointsToUpdateWithZone,
        ...accessPointsOutOfZone,
      ];
      if (accessPointsToUpdate.length) {
        await this.editAccessPoints(accessPointsToUpdate);
      }
    },
    resetForm() {
      this.$v.form.$reset();
      this.form.name = '';
    },
    confirmCloseModal() {
      this.dialog = false;
      this.mapLoaded = false;
      this.currentZone = null;
      this.zoneHasChanges = false;
      this.confirmationCloseDialog = false;
      if (this.dirty) {
        this.$emit('hasChanges', this.area);
      }
      Object.assign(this.area.zones, this.originalZones);
      if (this.map) {
        this.map.remove();
      }
    },
    closeModal() {
      if (this.zoneHasChanges) {
        this.confirmationCloseDialog = true;
      } else {
        this.confirmCloseModal();
      }
    },
  },
};
</script>

<style scoped lang="scss">
.map-container {
  height: 80vh;
  width: 100%;
  padding: 0 !important;
  opacity: 0;
}
.card-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
.grid-control {
  top: 104px;
  left: 8px;
}
.zone-name {
  margin-bottom: -20px;
  width: 68%;
  margin-right: 2%;
  display: inline-block;
}
.save-zone-btn {
  width: 14%;
  display: inline-block;
}
.delete-zone-btn {
  width: 14%;
  display: inline-block;
}
.zone-form {
  max-width: 500px;
}
</style>