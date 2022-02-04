<template>
  <div id="search-devices">
    <v-row>
      <v-col class="custom-card card-no-footer-height install-card p-relative">
        <v-row class="ml-1 mt-3 custom-label">
          {{ $t('install-title')}}
        </v-row>
        <v-row class="ml-2 mt-7 mb-2">
          <v-btn @click="addTag" id="add-asset" :depressed="true" class="primary--text font-weight-bold" color="primaryLight">
            <span>Tag or Supertag</span>
          </v-btn>
        </v-row>
        <span @click="showDeviceListing(deviceTypes.tag)" class="info-device ml-2 mt-3">Tags or Supertags installed: {{ totalTags }}</span>
        <v-row class="ml-2 mt-4 mb-2">
          <v-btn id="add-asset" @click="addLocation" :depressed="true" class="primary--text font-weight-bold" color="primaryLight">
            <span>Location Beacon</span>
          </v-btn>
        </v-row>
        <span @click="showDeviceListing(deviceTypes.locationBeacon)" class="info-device ml-2 mt-3">Location Beacons installed: {{ totalLocationBeacons }}</span>
        <v-row class="ml-2 mt-4 mb-2">
          <v-btn id="add-asset" @click="addAccessPoint" :depressed="true" class="primary--text font-weight-bold" color="primaryLight">
            <span>Access Point</span>
          </v-btn>
        </v-row>
        <span @click="showDeviceListing(deviceTypes.accessPoint)" class="info-device ml-2 mt-3">Access Points installed: {{ totalAccessPoints }}</span>
        <v-row class="ml-2 mt-4 mb-2">
          <v-btn id="add-gateway" @click="addGateway" :depressed="true" class="primary--text font-weight-bold" color="primaryLight">
            <span>Gateway</span>
          </v-btn>
        </v-row>
        <span @click="showDeviceListing(deviceTypes.gateway)" class="info-device ml-2 mt-3">Gateways installed: {{ totalGateways }}</span>
        <v-row class="ml-2 p-absolute search-device">
          <v-btn @click="searchDialog = true" id="searchDevicesBtn" :depressed="true" class="primary--text font-weight-bold" color="primaryLight">
            <span>Search Devices</span>
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
    <v-dialog
      v-model="listingDialogView"
      v-if="listingDialogView"
      width="413"
    >
      <v-card id="viewDeviceModal"> 
        <v-card-title style="color: var(--primary);">{{ listingDevicesTitle }}</v-card-title>
        <SearchBar :cols="11" class="searchbar" :placeholder="'Search by Name or ID'" @searchText="onSearchText" notEncodedText="true" />
        <v-btn color="primary" text fab outlined x-small dark class="float-right mt-1 mr-1 closeBtn" title="close" @click="listingDialogView = false">
            <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-text class="px-1">
          <v-expansion-panels>
            <v-expansion-panel v-for="device in filteredListingDevices" :key="device.id">
              <v-expansion-panel-header expand-icon="mdi-menu-down" :class="device.properties.health">
                <div class="accordion-title">
                  {{ device && device.properties && device.properties.name }}
                  <ActionsPopUp :closeDelay="'150'" class="actions-popup" :actions="deviceActions" :row="device" :isMobile="getIsMobile"/>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content v-if="deviceColumns">
                <div 
                  v-for="(col, index) in deviceColumns"
                  :key="index"
                >
                  <label><b>{{ col.headerName }}:</b></label>
                  {{ getCellValue(device, col.field) }}
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-dialog>
    <LocationNewEdit
      @changeOnLocations="refreshLocations"
      ref="locationNewEdit"
      :modalMode="listingDialogView ? 'edit' : 'create'" 
      :area="area"
      :areas="siteAreasIndoor"
    />
    <GatewayNewEdit
      @changeOnGateways="refreshGateways"
      ref="gatewayNewEdit"
      :modalMode="listingDialogView ? 'edit' : 'create'" 
      :area="area"
    />
    <TagNewEdit 
      @finished="refreshTags" 
      :modalMode="listingDialogView ? 'edit' : 'create'" 
      ref="newEditDeviceModal"
    />
    <AccessPointNewEdit
      @changeOnAccessPoints="refreshAccessPoints"
      ref="accessPointNewEdit"
      :modalMode="listingDialogView ? 'edit' : 'create'" 
      :area="area"
    />
    <ConfirmModal
      @confirm="confirmDeleteDevice"
      @cancel="confirmationDeleteDeviceDialog = false"
      :dialogModel="confirmationDeleteDeviceDialog"
      :dialogBody="$t('delete-are-you-sure', { name: deviceToDelete && deviceToDelete.properties && deviceToDelete.properties.name || '' })"
      :dialogTitle="$t('delete')"
    />
    <v-dialog class="search-device-modal" width="413" v-model="searchDialog">
      <v-card id="searchDeviceModal"> 
        <v-card-title class="primary-color">{{ $t('search-devices')}}</v-card-title>
        <v-btn color="primary" text fab outlined x-small dark class="float-right mt-1 mr-1 closeBtn" title="close" @click="searchDialog = false">
            <v-icon>mdi-close</v-icon>
        </v-btn>
          <SearchDevices :mobileView="true" :searchBarPlaceHolder="$t('search-devices-install')" :searchBarSize="12"/>
        </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import LocationNewEdit from '../components/locations/location-new-edit';
import GatewayNewEdit from '../components/locations/gateway-new-edit';
import AccessPointNewEdit from '../components/locations/access-point-new-edit';
import TagNewEdit from '../components/assets/device-new-edit'
import SearchDevices from '../pages/configuration/search'
import SearchBar from '../components/search-bar/search-bar'
import ActionsPopUp from '../components/shared/data-table/custom-cells/actions-popup';
import ConfirmModal from '../components/shared/modals/confirmModal';
import { DEVICES_TYPE } from '../constants/status';
import { 
  TagColumns, 
  LocationBeaconColumns, 
  AccessPointColumns, 
  GatewayColumns,
  defaultSortDirection,
  defaultSortBy,
  defaultGatewaySortBy,
  defaultTagSortBy
} from '../external/airfinder-status-component/constants/site-status';

export default {
  name: 'Search',
  data() {
    return {
      listingDialogView: false,
      searchDialog: false,
      listingDevices: [],
      totalGateways: 0,
      totalAccessPoints: 0,
      totalLocationBeacons: 0,
      totalTags: 0,
      listingDevicesTitle: '',
      searchTextValue: null,
      area: {
        site: {
          id: this.currentSiteId
        }
      },
      deviceActions: [
        {
          name: this.$t('edit'),
          fn: this.editDevice,
          icon: 'pen',
        },
        {
          name: this.$t('delete'),
          fn: this.deleteDevice,
          icon: 'delete',
        }
      ],
      listingDeviceType: null,
      deviceTypes: DEVICES_TYPE,
      deviceToDelete: null,
      confirmationDeleteDeviceDialog: false,
      deviceColumns: null
    };
  },
  watch: {
    currentSiteId(siteId) {
      if (siteId) {
        this.getDevices();
        this.getGroups({ siteId: this.currentSiteId });
        this.getCategories({ siteId: this.currentSiteId });
        this.getAreas({ siteId: this.currentSiteId });
      }
    }
  },
  components: {
    LocationNewEdit,
    GatewayNewEdit,
    AccessPointNewEdit,
    TagNewEdit,
    SearchDevices,
    SearchBar,
    ActionsPopUp,
    ConfirmModal
  },
  computed: {
    ...mapGetters('layout', ['getIsMobile']),
    ...mapGetters('site', ['sites', 'currentSiteId']),
    ...mapGetters('area', ['areas']),
    filteredListingDevices() {
      if (this.searchTextValue) {
        const nameToSearch = this.searchTextValue.toLowerCase();
        const nodeToSearch = this.searchTextValue.replace(/:|-/gi, '').toLowerCase();
        let filteredDevices = this.listingDevices.filter(
          (device) =>
            device.properties.nameSearchField.includes(nameToSearch) ||
            device.properties.nodeSearchField.includes(nodeToSearch)
        );
        return filteredDevices;
      }
      return this.listingDevices;
    },
    siteAreasIndoor(){
      return this.areas ? 
        this.areas.filter(area => 
          area.assetInfo.metadata.props.areaLocation.toLowerCase() === 'indoor'
        )
        : [];
    }
  },
  mounted() {
    if(this.currentSiteId){
      this.getGroups({ siteId: this.currentSiteId });
      this.getCategories({ siteId: this.currentSiteId });
      this.getDevices();
    }
  },
  methods: {
    ...mapActions('accessPoint', ['getAccessPointById', 'deleteAccessPoints']),
    ...mapActions('gateway', ['getGatewayById', 'deleteGateways']),
    ...mapActions('location', ['getLocationById', 'deleteLocations']),
    ...mapActions('group', ['getGroups']),
    ...mapActions('category', ['getCategories']),
    ...mapActions('area', ['getAreas']),
    ...mapActions('tag', ['getTag', 'deleteTag']),
    ...mapMutations('site', ['clearSite']),
    ...mapActions(
      'status', [
        'getDevicesCount',
        'getGatewayStatus',
        'getAccessPointStatus',
        'getLocationBeaconStatus',
        'getTagStatus',
      ],
    ),
    getCellValue(row, index) {
      if (index.includes(".")) {
        return row[index.split(".", 2)[0]][index.split(".", 2)[1]];
      } else return row[index];
    },
    async getDevices() {
      try {
        await this.getAllDevicesInfo();
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
      }
    },
    async getAllDevicesInfo() {
      const devicesCount = await this.getDevicesCount(this.currentSiteId);
      devicesCount.forEach(device => {
        switch (device.assetType) {
          case DEVICES_TYPE.gateway:
            this.totalGateways = device.totalCount;
            break;

          case DEVICES_TYPE.accessPoint:
            this.totalAccessPoints = device.totalCount;
            break;

          case DEVICES_TYPE.locationBeacon:
            this.totalLocationBeacons = device.totalCount;
            break;

          case DEVICES_TYPE.tag:
            this.totalTags = device.totalCount;
            break;

          default:
            break;
        }
      });
    },
    //TAGS
    async refreshTags() {
      try {
        await this.getDevices();
        if(this.listingDialogView && this.listingDeviceType === DEVICES_TYPE.tag){
          this.showDeviceListing(DEVICES_TYPE.tag);
        }
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
      }
    },
    //LOCATIONS
    async refreshLocations() {
      try {
        await this.getDevices();
        if(this.listingDialogView && this.listingDeviceType === DEVICES_TYPE.locationBeacon){
          this.showDeviceListing(DEVICES_TYPE.locationBeacon);
        }
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
      }
    },
    addTag() {
      this.$refs.newEditDeviceModal.openModal();
    },
    addLocation() {
      this.$refs.locationNewEdit.openModal();
    },
    //GATEWAYS
    async refreshGateways() {
      try {
        await this.getDevices();
        if(this.listingDialogView && this.listingDeviceType === DEVICES_TYPE.gateway){
          this.showDeviceListing(DEVICES_TYPE.gateway);
        }
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
      }
    },
    addGateway(){
      this.$refs.gatewayNewEdit.openModal();
    },
    //ACCESSPOINTS
    async refreshAccessPoints() {
      try {
        await this.getDevices();
        if(this.listingDialogView && this.listingDeviceType === DEVICES_TYPE.accessPoint){
          this.showDeviceListing(DEVICES_TYPE.accessPoint);
        }
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
      }
    },
    addAccessPoint(){
      this.$refs.accessPointNewEdit.openModal();
    },
    async showDeviceListing(deviceType) {
      let data;
      let payload;
      switch (deviceType) {
        case DEVICES_TYPE.gateway:
          this.listingDevicesTitle = 'Gateways';
          this.deviceColumns = GatewayColumns;
          payload = {
            siteId: this.currentSiteId,
            sortOrder: defaultSortDirection,
            sortBy: defaultGatewaySortBy
          }
          data = await this.getGatewayStatus(payload);
          break;

        case DEVICES_TYPE.accessPoint:
          this.listingDevicesTitle = 'Access Points';
          this.deviceColumns = AccessPointColumns;
          payload = {
            siteId: this.currentSiteId,
            sortOrder: defaultSortDirection,
            sortBy: defaultSortBy
          }
          data = await this.getAccessPointStatus(payload);
          break;

        case DEVICES_TYPE.locationBeacon:
          this.listingDevicesTitle = 'Location Beacons';
          this.deviceColumns = LocationBeaconColumns;
          payload = {
            siteId: this.currentSiteId,
            sortOrder: defaultSortDirection,
            sortBy: defaultSortBy
          }
          data = await this.getLocationBeaconStatus(payload);
          break;

        case DEVICES_TYPE.tag:
          this.listingDevicesTitle = 'Tags';
          this.deviceColumns = TagColumns;
          payload = {
            siteId: this.currentSiteId,
            sortOrder: defaultSortDirection,
            sortBy: defaultTagSortBy
          }
          data = await this.getTagStatus(payload);
          break;

        default:
          break;
      }
      this.listingDevices = data.rows;

      this.listingDeviceType = deviceType;

      this.searchTextValue = null;
      this.listingDialogView = true;
    },
    async editDevice(device) {
      let editDeviceData;
      switch (this.listingDeviceType) {
        case DEVICES_TYPE.tag:
          editDeviceData = await this.getTag(device.properties.macAddress);
          this.$refs.newEditDeviceModal.openModal(editDeviceData);
          break;
        case DEVICES_TYPE.locationBeacon:
          editDeviceData = await this.getLocationById(device.properties.macAddress);
          this.$refs.locationNewEdit.openModal(editDeviceData);
          break;
        case DEVICES_TYPE.accessPoint:
          editDeviceData = await this.getAccessPointById(device.properties.macAddress);
          this.$refs.accessPointNewEdit.openModal(editDeviceData);
          break;
        case DEVICES_TYPE.gateway:
          editDeviceData = await this.getGatewayById(device.properties.macAddress);
          this.$refs.gatewayNewEdit.openModal(editDeviceData);
          break;
        default:
          break;
      }
    },
    deleteDevice(device) {
      this.deviceToDelete = device;
      this.confirmationDeleteDeviceDialog = true;
    },
    async confirmDeleteDevice() {
      this.confirmationDeleteDeviceDialog = false;
      const siteId = this.currentSiteId;
      let deleteDetails;
      switch (this.listingDeviceType) {
        case DEVICES_TYPE.tag:
          deleteDetails = {
            nodeAddress: this.deviceToDelete.properties.macAddress,
            siteId,
          };
          await this.deleteTag({ device: deleteDetails });
          this.$toasted.show(this.$t('asset-deleted'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          this.refreshTags();
          break;
        case DEVICES_TYPE.locationBeacon:
          deleteDetails = {
            nodeAddresses: [this.deviceToDelete.properties.macAddress],
            siteId,
          };
          await this.deleteLocations(deleteDetails);
          this.$toasted.show(this.$t('location-deleted'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          this.refreshLocations();
          break;
        case DEVICES_TYPE.accessPoint:
          deleteDetails = {
            nodeAddresses: [this.deviceToDelete.properties.macAddress],
            siteId,
          };
          await this.deleteAccessPoints(deleteDetails);
          this.$toasted.show(this.$t('access-point-deleted'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          this.refreshAccessPoints();
          break;
        case DEVICES_TYPE.gateway:
          deleteDetails = {
            nodeAddresses: [this.deviceToDelete.properties.macAddress],
            siteId,
          };
          await this.deleteGateways(deleteDetails);
          this.$toasted.show(this.$t('gateway-deleted'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          this.refreshGateways();
          break;
        default:
          break;
      }
      this.deviceToDelete = null;
    },
    onSearchText(text) {
      this.searchTextValue = text;
    }
  },
};
</script>

<style lang="scss" scoped>
.install-card {
  height: 85vh;
  min-height: 550px;  
}
.info-device {
  font-size: .8rem;
  text-decoration: underline;
  cursor: pointer;
}
#viewDeviceModal {
  min-height: 100px;
}
.closeBtn {
  top: 0px;
  right: 0px;
  position: absolute;
}
.item {
  .text {
    font-weight: bold;
  }
}
.actions-butttons{
  position: absolute;
  right: 10px;
  margin-top: 5px;
}
.searchbar {
  min-width: calc(100% - 10px);
  padding-left: 10px !important;
}
.search-device {
  bottom: 15px;
}
.search-device-modal {
  max-height: fit-content;
}
.primary-color {
  color: var(--primary);
}

.accordion-title {
  font-size: 1rem;
  text-align: left;
  width: 100%;
  margin: 0px 25px 0px 25px;
  font-weight: 600;
  color: var(--v-primary-base);
}
.actions-popup {
  position: absolute;
  right: 30px;
  top: 6px;
}
.RED {
  background-color: #ffcccc;
}
.GREEN {
  background-color: #d6f5d6;
}
.GRAY {
  background-color: #dcdcdc;
}
.BLUE {
  background-color: #d1f2ff;
}
</style>