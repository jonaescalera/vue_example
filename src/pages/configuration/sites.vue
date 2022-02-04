<template>
  <div id="sites">
    <v-row>
      <v-col class="custom-card card-no-footer-height">
        <v-row class="mb-5" style="height: 40px;">
          <!-- search bar -->
          <search-bar @searchText="search" :placeholder="$t('search-by-name')" />
          <v-col cols="8">
            <div class="mr-3 right-btn-container">
              <v-btn
                v-if="isAdmin"
                id="add-site"
                height="32"
                :depressed="true"
                @click="createSite"
                class="primary--text font-weight-bold"
                color="primaryLight"
              >{{$t('add-site')}}</v-btn>
            </div>
          </v-col>
        </v-row>
        <!-- accodions -->
        <div class="accordion-container">
          <!-- sites -->
          <v-expansion-panels>
            <v-expansion-panel
              v-for="(site,i) in filterByTerm"
              :key="i"
              @click="handleOnSiteClick(site)"
            >
              <v-expansion-panel-header class="accordion-header" expand-icon="mdi-menu-down">
                <div class="accordion-title">
                  {{ site.value }}
                </div>
              </v-expansion-panel-header>
              <actions-popup :closeDelay="'150'" class="actions-popup" :actions="siteSettings" :row="site" />
              <v-expansion-panel-content>
                <!-- areas -->
                <v-expansion-panels v-model="areasOpened">
                  <v-expansion-panel
                    v-for="(area,i) in site.areas"
                    :key="i"
                    :disabled="area.zoneCount == 0"
                    @click="handleGetZoneByArea(area)"
                  >
                    <v-expansion-panel-header class="accordion-header" expand-icon="mdi-menu-down">
                      <div>
                        <div class="area-column">
                          <div class="area-header">{{$t('area')}}</div>
                          <div class="area-value">{{ area.name }}</div>
                        </div>
                        <div class="area-column">
                          <div class="area-header">{{$t('indoor-outdoor')}}</div>
                          <div class="area-value">{{ area.areaLocation }}</div>
                        </div>
                        <div class="area-column">
                          <div class="area-header">{{$t('zones')}}</div>
                          <div class="area-value">{{ area.zoneCount }}</div>
                        </div>
                        <div class="area-column">
                          <div class="area-header">{{$t('locations')}}</div>
                          <div class="area-value">{{ area.locationCount }}</div>
                        </div>
                      </div>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <div class="zones-cont">
                        <span class="zones-title">Zones & Locations</span>
                        <!-- Zones -->
                        <v-expansion-panels v-model="zonesOpened" light>
                          <v-expansion-panel
                            v-for="(zone,i) in area.zones"
                            :key="i"
                            :disabled="area.locationCount == 0"
                            @click="handleOnZoneClick(zone)"
                          >
                            <v-expansion-panel-header expand-icon="mdi-menu-down">
                              <div>
                                <div class="location-column">
                                  <div class="area-header">{{ zone.name }}</div>
                                </div>
                                <div class="location-column">
                                  <div class="area-header">{{$t('mac-address')}}</div>
                                </div>
                              </div>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                              <div class="locations-cont">
                                <div v-for="(loc,i) in zone.locations" :key="i">
                                  <div class="location-column">
                                    <div>{{loc.name}}</div>
                                  </div>
                                  <div class="location-column">
                                    <div>{{ loc.macAddress }}</div>
                                  </div>
                                  <div class="location-actions">
                                    <actions-popup :closeDelay="'150'" :actions="locationSettings" :row="loc" />
                                  </div>
                                </div>
                              </div>
                            </v-expansion-panel-content>
                            <actions-popup
                            v-if="zone.area && zone.area.areaLocation === 'indoor'"
                              class="actions-popup"
                              :closeDelay="'150'"
                              :actions="zoneSettings"
                              :row="zone"
                            />
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </div>
                    </v-expansion-panel-content>
                    <actions-popup class="actions-popup" :closeDelay="'150'" :actions="areaSettings" :row="area" />
                  </v-expansion-panel>
                </v-expansion-panels>
                <div
                  class="accordion-info"
                  v-if="site.areas === undefined"
                >{{$t('fetching-sites-for-area')}}</div>
                <div
                  class="accordion-info"
                  v-if="site.areas && site.areas.length === 0"
                >{{$t('site-no-areas')}}</div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-col>
    </v-row>
    <new-edit-modal
      ref="siteNewEditModal"
      :modalMode="createEdit"
      @finishedEdit="finished"
      @finishedCreate="finished"
    />
    <label-edit-modal ref="siteLabelEditModal" />
    <area-new-edit-modal
      @areaCreatedEdited="handleAreaCreatedEdited"
      :modalMode="createEdit"
      ref="areaNewEditModal"
    />
    <zone-polygon-upload @hasChanges="handleZoneHasChanges" ref="mapZonePolygonUpload"/>
    <location-access-gateway ref="locationAccessGateway" @locationAccessPointGatewayHasChanges="refreshAreasFromSite"/>
    <LocationNewEditModal @changeOnLocations="handleLocationHasChanges" modalMode="edit" ref="locationNewEditModal"/>
    <OffsiteLocations ref="offsiteLocations"/>
    <DuplicateArea @areaCreatedEdited="handleAreaCreatedEdited" ref="duplicateAreaModal"/>
    <confirm-modal
      @confirm="confirmDeleteSite"
      @cancel="confirmationDeleteDialogSite = false"
      :dialogModel="confirmationDeleteDialogSite"
      :dialogBody="$t('delete-are-you-sure', { name: nameToDelete })"
      :dialogTitle="$t('delete-site')"
    />
    <confirm-modal
      @confirm="confirmDeleteArea"
      @cancel="confirmationDeleteDialogArea = false"
      :dialogModel="confirmationDeleteDialogArea"
      :dialogBody="$t('delete-are-you-sure', { name: nameToDelete })"
      :dialogTitle="$t('delete-area')"
    />
    <confirm-modal
      @confirm="confirmDeleteZone"
      @cancel="confirmationDeleteDialogZone = false"
      :dialogModel="confirmationDeleteDialogZone"
      :dialogBody="$t('delete-are-you-sure', { name: nameToDelete })"
      :dialogTitle="$t('delete-zone')"
    />
    <confirm-modal
      @confirm="confirmDeleteLocation"
      @cancel="confirmationDeleteDialogLocation = false"
      :dialogModel="confirmationDeleteDialogLocation"
      :dialogBody="$t('delete-are-you-sure', { name: nameToDelete })"
      :dialogTitle="$t('delete-location')"
    />

  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import AreaModel from '../../models/area';
import actionsPopUp from '../../components/shared/data-table/custom-cells/actions-popup';
import SearchBar from '../../components/search-bar/search-bar';
import SiteNewEdit from '../../components/sites/site-new-edit';
import SiteLabelEdit from '../../components/sites/site-label-edit';
import AreaNewEdit from '../../components/areas/areas-new-edit';
import ManageLocationAccessPointGateway from '../../components/locations/manage-location-access-point-gateway';
import UploadMapPolygonZone from '../../components/zones/zone-polygon-upload';
import ConfirmationModal from '../../components/shared/modals/confirmModal';
import LocationNewEditModal from '../../components/locations/location-new-edit';
import OffsiteLocations from '../../components/locations/offsite-locations';
import DuplicateArea from '../../components/sites/duplicate-area';
import { ROLES } from '../../constants/roles';

export default {
  name: "Sites",
  components: {
    'new-edit-modal': SiteNewEdit,
    'area-new-edit-modal': AreaNewEdit,
    'zone-polygon-upload' : UploadMapPolygonZone,
    'location-access-gateway': ManageLocationAccessPointGateway,
    'label-edit-modal': SiteLabelEdit,
    'search-bar': SearchBar,
    'confirm-modal': ConfirmationModal,
    'actions-popup': actionsPopUp,
    LocationNewEditModal,
    OffsiteLocations,
    DuplicateArea
  },
  data() {
    return {
      createEdit: 'create',
      confirmationDeleteDialogSite: false,
      confirmationDeleteDialogArea: false,
      confirmationDeleteDialogZone: false,
      confirmationDeleteDialogLocation: false,
      objToDelete: null,
      nameToDelete: '',
      searchValue: '',
      areasOpened: false,
      zonesOpened: false,
      siteSettings: [
        {
          name: this.$t('add-area'),
          fn: this.addArea,
          icon: 'layers-plus',
        },
        {
          name: this.$t('offsite-lb'),
          fn: this.listOffsiteLB,
          icon: 'map-marker',
        }
      ],
      areaSettings: [
        {
          name: this.$t('edit-area'),
          fn: this.handleEditArea,
          icon: 'pen',
        },
        {
          name: this.$t('manage-zones'),
          fn: this.handleAddZones,
          icon: 'map-plus',
        },
        {
          name: this.$t('manage-location-access-point-gateways'),
          fn: this.manageLocations,
          condition: { 
            field: 'areaLocation',
            operator: '===',
            value: 'indoor' 
          },
          visible: true,
          icon: 'flag-plus',
        },
        {
          name: this.$t('duplicate-area'),
          fn: this.duplicateArea,
          condition: { 
            field: 'areaLocation',
            operator: '===',
            value: 'indoor' 
          },
          visible: true,
          icon: 'content-copy',
        },
        {
          name: this.$t('delete-area'),
          fn: this.handleDeleteArea,
          icon: 'delete',
        },
      ],
      zoneSettings: [
        {
          name: this.$t('delete-zone'),
          fn: this.handleDeleteZone,
          icon: 'delete',
        },
      ],
      locationSettings: [
        {
          name: this.$t('edit-location'),
          fn: this.handleEditLocation,
          icon: 'pen',
        },
        {
          name: this.$t('delete-location'),
          fn: this.handleDeleteLocation,
          icon: 'delete',
        },
      ],
    };
  },
  computed: {
    ...mapGetters('site', ['sites', 'currentSiteId']),
    ...mapGetters('site', { siteUserRole: 'userRole' }),
    ...mapGetters('organization', ['userRole']),
    ...mapGetters('organization', { orgUserRole: 'userRole' }),
    filterByTerm() {
      if (this.searchValue) {
        return this.sites.filter(s => {
          return s.value
          .toLowerCase()
          .replaceAll(' ', '')
          .includes(this.searchValue.toLowerCase().replaceAll(/%20/g, ''));
        });
      } else {
        return this.sites
      }
    },
    isAdmin(){
      //check the organization user role (Admin OrgUser or SuperAdmin)
      if(this.orgUserRole && (this.orgUserRole.assetInfo.metadata.props.role === ROLES.ADMIN || this.orgUserRole.assetInfo.metadata.props.role === ROLES.SUPER_ADMIN)){
         return true;
      } else {
        return false;
      }
    }
  },
  mounted() {
    if(this.isAdmin){
      this.siteSettings.unshift({
        name: this.$t('edit-site-labels'),
        fn: this.editLabels,
        icon: 'label',
      });
      this.siteSettings.unshift({
        name: this.$t('edit-site'),
        fn: this.editSite,
        icon: 'pen',
      });
      this.siteSettings.push({
        name: this.$t('delete-site'),
        fn: this.handleDeleteSite,
        icon: 'delete',
      });
    }
  },
  methods: {
    ...mapActions('site', ['getSites', 'deleteSite', 'setCurrentSiteId']),
    ...mapActions('area', ['getAreas', 'deleteArea']),
    ...mapActions('zone', ['getZones', 'deleteZone', 'getZoneByArea']),
    ...mapActions('location', ['getLocationByZone', 'deleteLocations', 'getLocationsByArea']),
    ...mapActions('gateway', ['getGatewaysBySite']),
    ...mapActions('accessPoint', ['getAccessPointsBySite']),
    ...mapMutations('site', ['setCurrentSite']),
    async fetchSites(reloadCurrentSite) {
      await this.getSites();
      if(!this.currentSiteId){
        this.setCurrentSiteId({siteId: this.sites[0].id})
      }else{
        if(reloadCurrentSite){
          this.setCurrentSiteId({siteId: this.currentSiteId})
        }
      }
    },
    editSite(row) {
      this.createEdit = 'edit';
      this.editedRow = row;
      this.$refs.siteNewEditModal.openModal(row);
    },
    createSite() {
      this.createEdit = 'create';
      this.$refs.siteNewEditModal.openModal();
    },
    handleDeleteSite(site) {
      this.nameToDelete = site.value;
      this.confirmationDeleteDialogSite = true;
      this.objToDelete = site;
    },
    editLabels(site) {
      this.$refs.siteLabelEditModal.openModal(site);
    },
    addArea(site) {
      this.createEdit = 'create';
      this.$refs.areaNewEditModal.openModal(null, site);
    },
    listOffsiteLB(site){
      this.$refs.offsiteLocations.openModal(site);
    },
    async handleEditArea(area) {
      this.createEdit = 'edit';
      if (area.zoneCount > 0) {
        await this.handleGetZoneByArea(area);        
      }
      this.$refs.areaNewEditModal.openModal(area, area.site);
    },
    handleDeleteZone(zone) {
      this.nameToDelete = zone.name;
      this.confirmationDeleteDialogZone = true;
      this.objToDelete = zone;
    },
    async confirmDeleteZone() {
      const zoneId = this.objToDelete.id;
      try {
      const resp = await this.deleteZone(zoneId);
        this.$toasted.show(this.$t('zone-deleted'), {
          position: 'bottom-right',
          className: ['toast-success'],
          duration: 1500,
        });
        const site = this.sites.find(s => s.id === this.objToDelete.site.id);
        this.refreshAreasFromSite(site);
        this.confirmationDeleteDialogZone = false;
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 1500,
        });
      }
    },
    async confirmDeleteSite() {
      const site = this.objToDelete;
      try {
        await this.deleteSite({ site });
        this.$toasted.show(this.$t('site-deleted'), {
          position: 'bottom-right',
          className: ['toast-success'],
          duration: 1500,
        });
        //if the deleted site is the selected one
        if(site.id === this.currentSiteId){
          this.setCurrentSite({});
        }
        this.fetchSites();
        this.confirmationDeleteDialogSite = false;
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 1500,
        });
      }
    },
    finished(reloadCurrentSite) {
      this.fetchSites(reloadCurrentSite);
    },
    handleOnSiteClick(site) {
      if (!site.areas) {
        this.refreshAreasFromSite(site);
      }
    },
    //areas
    handleAreaCreatedEdited(area) {
      let areaEditedSiteId = area?.assetInfo?.metadata?.props?.siteId;
      const site = this.sites.find(s => s.id === areaEditedSiteId);
      if (site) {
        this.refreshAreasFromSite(site);
      }
    },
    async handleGetZoneByArea(area) {
      if (!area.zones) {
        await this.refresZonesFromArea(area);
      }
    },
    async handleGetLocationByArea(area) {
      try {
        const locations = await this.getLocationsByArea(area.id);
        this.$set(
          area,
          'locations',
          locations
        );
      } catch (e) {
        throw new Error(this.$t('something-went-wrong'), e);
      }
    },
    async handleGetAccessPointsBySite(area) {
      try {
        const accessPoints = await this.getAccessPointsBySite({siteId: area.site.id});
        this.$set(
          area.site,
          'accessPoints',
          accessPoints
        );
      } catch (e) {
        throw new Error(this.$t('something-went-wrong'), e);
      }
    },
    async handleGetGatewaysBySite(area) {
      try {
        const gateways = await this.getGatewaysBySite({siteId: area.site.id});
        this.$set(
          area.site,
          'gateways',
          gateways
        );
      } catch (e) {
        throw new Error(this.$t('something-went-wrong'), e);
      }
    },
    handleDeleteArea(area) {
      this.objToDelete = area;
      this.confirmationDeleteDialogArea = true;
      this.nameToDelete = area.name;
    },
    async confirmDeleteArea() {
      const areaId = this.objToDelete.id;
      try {
        const resp = await this.deleteArea(areaId);
        this.$toasted.show(this.$t('area-deleted'), {
          position: 'bottom-right',
          className: ['toast-success'],
          duration: 1500,
        });
        this.refreshAreasFromSite(this.objToDelete.site);
        this.confirmationDeleteDialogArea = false;
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 1500,
        });
      }
    },
    async refreshAreasFromSite(site) {
      this.areasOpened = false;
      this.zonesOpened = false;
      try {
        let areas = await this.getAreas({ siteId: site.id });
        areas.forEach(area => {
          this.$set(area, 'site', site);
        });
        this.$set(
          site,
          'areas',
          areas.map(area => new AreaModel().normalizeInfo(area))
        );
      } catch (e) {
        throw new Error(this.$t('something-went-wrong'), e);
      }
    },
    duplicateArea(area) {
      if (area.locationName !== 'outdoor') {
        this.$refs.duplicateAreaModal.openModal(area);
      }
    },
    //zones
    async handleAddZones(area) {
      let zonesPromise = this.handleGetZoneByArea(area);
      if (area.areaLocation === 'indoor') {
        let gatewaysPromise = this.handleGetGatewaysBySite(area);
        let accessPointsPromise = this.handleGetAccessPointsBySite(area);
        if (parseInt(area.locationCount) > 0) {
          let locationPromise = this.handleGetLocationByArea(area);
          await locationPromise;
        }
        await accessPointsPromise, gatewaysPromise, zonesPromise;
      }
      this.$refs.mapZonePolygonUpload.openModal(area);
    },
    handleEditZones(zone) {
      this.$refs.mapZonePolygonUpload.openModal(zone.area);
    },
    async handleOnZoneClick(zone) {
      if (!zone.locations) {
        try {
          let locations = await this.getLocationByZone(zone.id);
          this.$set(
            zone,
            'locations',
            locations
          );
          locations.map((loc)=>{
              this.$set(
              loc,
              'zone',
              zone
            );
          })
        } catch (e) {
          throw new Error(this.$t('something-went-wrong'), e);
        }
      }
    },
    handleZoneHasChanges(editedArea) {
      let editedAreaSiteId = editedArea?.site?.id;
      const site = this.sites.find(s => s.id === editedAreaSiteId);
      if (site) {
        this.refreshAreasFromSite(site);
      }
    },
    async refresZonesFromArea(area) {
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
      } catch (e) {
        throw new Error(this.$t('something-went-wrong'), e);
      }
      
    },
    // locations, access points, gateways
    async manageLocations(area) {
      await this.handleGetZoneByArea(area);
      this.$refs.locationAccessGateway.openModal(area);
    },
    handleEditLocation(loc) {
      this.$refs.locationNewEditModal.openModal(loc);
    },
    handleDeleteLocation(location) {
      this.objToDelete = location;
      this.confirmationDeleteDialogLocation = true;
      this.nameToDelete = location.name;
    },
    async confirmDeleteLocation() {
      let payload = {
        nodeAddresses: [this.objToDelete.id],
        siteId: this.objToDelete.siteId,
      };
      try {
        let resp = await this.deleteLocations(payload);
        this.$toasted.show(this.$t('location-deleted'),
          {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 1500,
          }
        );
        const site = this.sites.find(s => s.id === this.objToDelete.siteId);
        this.refreshAreasFromSite(site);
        this.confirmationDeleteDialogLocation = false;
        } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
        this.confirmationDeleteDialogLocation = false;
      }
    },
    async refreshLocationsFromZone(zone) {
      try {
        let locations = await this.getLocationByZone(zone.id);
        this.$set(
            zone,
            'locations',
            locations
          );
          locations.map((loc)=>{
              this.$set(
              loc,
              'zone',
              zone
            );
          })
      } catch (e) {
        throw new Error(this.$t('something-went-wrong'), e);
      }
    },
    handleLocationHasChanges(editedLoc) {
      const site = this.sites.find(s => s.id === editedLoc.siteId);
      const area = site.areas.find(a => a.id === editedLoc.areaId);
      const zone = area.zones.find(z => z.id === editedLoc.zone.id);
      if (zone) {
        this.refreshLocationsFromZone(zone);
      }
    },
    search(str) {
      this.searchValue = str;
    },
  },
};
</script>

<style lang="scss" scoped>
.accordion-container {
  position: static;
}
.accordion-header {
  width: 90%;
}
.actions-popup {
  position: absolute;
  right: 30px;
  top: 6px;
}
.right-btn-container {
  height: 100%;
  float: right;
}

.v-expansion-panel-header {
  padding-left: 50px;
}
.v-expansion-panels {
  overflow: auto;
  position: static;
  max-height: calc(100vh - 190px);
}
.accordion-info {
  font-size: 0.8rem;
}
.accordion-title {
  font-size: 1rem;
  text-align: left;
  width: 100%;
  font-weight: 600;
  color: var(--v-primary-base);
}

.area-column {
  width: 25%;
  display: inline-block;
}
.area-header {
  color: var(--v-primary-base);
  border-radius: 5px;
  text-align: left;
  font-weight: 600;
  margin-bottom: 5px;
}
.zones-cont {
  background-color: var(--v-primaryLight-base);
  padding: 5px 10px 5px 10px;
  border-radius: 3px;
  .v-item-group.theme--light.v-expansion-panels::-webkit-scrollbar-track {
    background-color: var(--v-primaryLight-base);
  }
  .v-item-group.theme--light.v-expansion-panels::-webkit-scrollbar {
    background-color: var(--v-primaryLight-base);
  }
  .v-expansion-panel-header {
    background-color: var(--v-primaryLight-base);
  }
  .v-expansion-panel-content {
    background-color: var(--v-primaryLight-base);
    color: var(--v-primary-base);
  }
}
.theme--light.v-expansion-panels .v-expansion-panel  {
  &:hover {
    background-color: var(--v-primaryLight-base);
  }
}
.zones-title {
  color: var(--v-primary-base);
  font-weight: bold;
}
.location-column {
  width: 33%;
  display: inline-block;
  padding: 2px 0px 2px 0px;
}
.location-actions {
  display: inline-block;
  width: 8%;
  margin-left: 25%;
  .mdi:before {
    float: right;
  }
}
//media queries
@media (max-width: 812px) {
  .right-btn-container {
    float: none !important;
    margin-left: 13px;
  }
}

// IE styles
@media all and (-ms-high-contrast: none) {
  .right-btn-container {
    padding-top: 2px;
  }
}
</style>