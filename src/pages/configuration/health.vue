<template>
  <div class="status-page">
    <div v-if="accessDenied">
      <h3>{{ $t('access-denied') }}</h3>
      <p>{{ $t('missing-permissions-msg') }}</p>
    </div>
    <SiteStatus
      v-if="!accessDenied"
      :siteid="currentSiteId"
      :showActions="true"
      :inputservice="testSiteService"
    ></SiteStatus>
    <ConfirmationModal
      @confirm="confirmRestartDevice"
      @cancel="cancelRestartDevice"
      :dialogModel="confirmRestartDeviceDialog"
      :dialogBody="$t('restart-message-confirm', { name: deviceToRestart.name })"
      :dialogTitle="$t('restart-message')"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import StatusService from '../../services/status';
import SiteStatus from '../../external/airfinder-status-component/site-status.vue';
import ConfirmationModal from '../../components/shared/modals/confirmModal';
import { ROLES } from '../../constants/roles';

export default {
  name: "Health",
  components: {
    SiteStatus,
    ConfirmationModal
  },
  data: function() {
    return {
      accessDenied: false,
      confirmRestartDeviceDialog: false,
      deviceToRestart: {
        name: null
      }
    };
  },
  computed: {
    ...mapGetters('site', ['currentSiteId']),
    ...mapGetters('organization', ['userRole']),
    testSiteService: function() {
      return {
        getSite: this.getSiteWrapper,
        getDeviceStatus: this.getDeviceStatusWrapper,
        getUnprovisionedLocationBeaconStatus: this.getUnprovisionedLocationBeaconStatusWrapper,
        getUnprovisionedAccessPointStatus: this.getUnprovisionedAccessPointStatusWrapper,
        getGatewayStatus: this.getGatewayStatusWrapper,
        getAccessPointStatus: this.getAccessPointStatusWrapper,
        getLocationBeaconStatus: this.getLocationBeaconStatusWrapper,
        getTagStatus: this.getTagStatusWrapper,
        restartAccessPoint: this.restartAccessPointWrapper,
        restartGateway: this.restartGatewayWrapper
      }
    },
    isOrgAdmin() {
      const userRole = this.userRole?.assetInfo?.metadata?.props?.role;
      return (
        userRole &&
        [ROLES.SUPER_ADMIN.toLowerCase(), ROLES.ADMIN.toLowerCase()].indexOf(
          userRole.toLowerCase()
        ) > -1
      );
    },
  },
  methods: {
    ...mapActions('site', ['getSite']),
    getSiteWrapper: function(siteId) {
      return this.getSite(siteId);
    },
    getDeviceStatusWrapper: async function(siteId) {
      try {
        return await StatusService.getDeviceStatus(siteId);
      } catch (error) {
        if (error.status === 403) {
          this.accessDenied = true;
        }
        throw error;
      }
    },
    getUnprovisionedLocationBeaconStatusWrapper: function(
      siteId,
      page,
      size,
      orderBy,
      sortBy,
    ) {
      return StatusService.getUnprovisionedLocationBeaconStatus(
        siteId,
        page,
        size,
        orderBy,
        sortBy,
      );
    },
    getUnprovisionedAccessPointStatusWrapper: function(
      siteId,
      page,
      size,
      orderBy,
      sortBy,
    ) {
      return StatusService.getUnprovisionedAccessPointStatus(
        siteId,
        page,
        size,
        orderBy,
        sortBy,
      );
    },
    getGatewayStatusWrapper: function(
      siteId,
      page,
      size,
      orderBy,
      sortBy,
    ) {
      return StatusService.getGatewayStatus(
        siteId,
        page,
        size,
        orderBy,
        sortBy,
      );
    },
    getAccessPointStatusWrapper: function(
      siteId,
      page,
      size,
      orderBy,
      sortBy,
    ) {
      return StatusService.getAccessPointStatus(
        siteId,
        page,
        size,
        orderBy,
        sortBy,
      );
    },
    getLocationBeaconStatusWrapper: function(
      siteId,
      page,
      size,
      orderBy,
      sortBy,
    ) {
      return StatusService.getLocationBeaconStatus(
        siteId,
        page,
        size,
        orderBy,
        sortBy,
      );
    },
    getTagStatusWrapper: function(
      siteId,
      page,
      size,
      orderBy,
      sortBy,
    ) {
      return StatusService.getTagStatus(
        siteId,
        page,
        size,
        orderBy,
        sortBy,
      );
    },
    restartAccessPointWrapper: function (ap) {
      this.deviceToRestart = {
        name: ap.properties.name,
        nodeAddress: ap.properties.macAddress,
        deviceType: 'ACCESS_POINT'
      };
      this.confirmRestartDeviceDialog = true;
    },
    restartGatewayWrapper: function (gateway) {

      this.deviceToRestart = {
        name: gateway.properties.name,
        nodeAddress: gateway.properties.macAddress,
        deviceType: 'GATEWAY'
      };
      this.confirmRestartDeviceDialog = true;
    },
    async confirmRestartDevice() {
      this.confirmRestartDeviceDialog = false;
      try {
        const response = await StatusService.restartDevice(
          this.deviceToRestart.deviceType,
          this.deviceToRestart.nodeAddress
        );
        this.$toasted.show(this.$t('restart-message-success'), {
          position: 'bottom-right',
          className: ['toast-success'],
          duration: 2000,
        });
        return response;
      } catch (e) {
        this.$toasted.show(this.$t('restart-message-failed'), {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
      } finally {
        this.deviceToRestart = {
          name: null,
        };
      }
    },
    cancelRestartDevice() {
      this.confirmRestartDeviceDialog = false;
      this.deviceToRestart = {
        name: null,
      };
    },
  },
  watch:{
    currentSiteId(){
      this.accessDenied = false;
    }
  },
};
</script>

<style lang="scss" scoped>
.status-page {
  height: calc(100vh - 96px);
  overflow: auto;
  padding: 0 10px;
}
</style>

<style lang="scss">
.status-page {
  button {
    min-width: 64px;
    padding: 0 16px;
    background-color: #FFFFFF;
    height: 38px !important;
    border-radius: 4px;
    border: thin solid;
    border-color: #949494;
  }
  select {
    font-size: 16px;
    font-family: sans-serif;
    font-weight: 700;
    color: #444;
    line-height: 1.3;
    padding: .2em 1.4em .2em .8em;
    max-width: 100%;
    box-sizing: border-box;
    margin: 0;
    border: 1px solid #aaa;
    box-shadow: 0 1px 0 1px rgba(0,0,0,.04);
    border-radius: .5em;
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    background-color: #fff;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20id%3D%22svg_1%22%20d%3D%22m287%2C68.4a17.6%2C17.6%200%200%200%20-13%2C-5.4l-255.6%2C0c-5%2C0%20-9.3%2C1.8%20-12.9%2C5.4a17.6%2C17.6%200%200%200%20-5.5%2C12.8c0%2C5%201.8%2C9.3%205.4%2C12.9l128%2C127.9c3.6%2C3.6%207.8%2C5.4%2012.8%2C5.4s9.2%2C-1.8%2012.8%2C-5.4l128%2C-128c3.5%2C-3.5%205.4%2C-7.8%205.4%2C-12.8c0%2C-5%20-1.9%2C-9.2%20-5.5%2C-12.8l0.1%2C0z%22%20fill%3D%22%23000000%22%2F%3E%3C%2Fsvg%3E'),
      linear-gradient(to bottom, #ffffff 0%,#e5e5e5 100%);
    background-repeat: no-repeat, repeat;
    background-position: right .7em top 50%, 0 0;
    background-size: .65em auto, 100%;
  }
  select::-ms-expand {
    display: none;
  }
  select:hover {
    border-color: #888;
  }
  select:focus {
    border-color: #aaa;
    box-shadow: 0 0 1px 3px rgba(59, 153, 252, .7);
    box-shadow: 0 0 0 3px -moz-mac-focusring;
    color: #222;
    outline: none;
  }
  select option {
    font-weight:normal;
  }
}
</style>
