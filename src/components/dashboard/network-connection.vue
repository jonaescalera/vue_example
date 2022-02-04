<template>
  <status-card
    :title="$t('network-connection')"
    :sub-title="$t('disconnected')"
    :list-items="listItems"
    iconName="mdi-access-point"
    :mainItemText="$t('dashboard-network-connection-main-text')"
    :statusValue="goodDevicesPercentage"
    :errorMessage="errorMessage"
  />
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import { ROLES } from '../../constants/roles';
import StatusCard from './status-card.vue';
import { DEVICES_TYPE } from '../../constants/status';

export default {
  name: 'NetworkConnection',
  components: {
    StatusCard,
  },
  props: {},
  data: function () {
    return {
      listItems: [
        { value: 2, text: this.$t('location-beacons') },
        { value: 10, text: this.$t('access-points') },
        { value: 1, text: this.$t('gateways') },
      ],
      totalDevices: 0,
      goodDevicesPercentage: 0,
      errorMessage: null,
    };
  },
  computed: {
    ...mapGetters('dashboard', ['networkConnectionStatus']),
    ...mapGetters('organization', {
      orgUserRole: 'userRole',
    }),
    ...mapGetters('site', {
      currentSite: 'currentSite',
      siteUserRole: 'userRole',
    }),
  },
  methods: {
    ...mapActions('dashboard', ['getNetworkConnectionStatus']),
    ...mapActions('site', ['getSiteUserRole']),
    getData: async function (inputSiteId) {
      const siteId = inputSiteId || this.currentSite?.id;
      const orgId = localStorage.getItem('orgId');
      let accessGranted = false;
      if (orgId) {
        try {
          // Get User's Role in Organization
          const userRole = this.orgUserRole?.assetInfo?.metadata?.props?.role;
          accessGranted =
            userRole &&
            [
              ROLES.SUPER_ADMIN.toLowerCase(),
              ROLES.ADMIN.toLowerCase(),
            ].indexOf(userRole.toLowerCase()) > -1;
        } catch (e) {
          e;
        }
      } else if (siteId) {
        try {
          // Get User's Role in Site
          await this.getSiteUserRole(siteId);
          accessGranted = !!this.siteUserRole?.assetInfo?.metadata?.props
            ?.Admin;
        } catch (e) {
          e;
        }
      }
      if (!this.orgUserRole && !this.siteUserRole) {
        this.errorMessage = this.$t(
          'dashboard-network-connection-get-permission-error-msg'
        );
        return;
      }
      if (!accessGranted) {
        this.errorMessage = this.$t(
          'dashboard-network-connection-permission-error-msg'
        );
        return;
      }

      if (siteId) {
        try {
          await this.getNetworkConnectionStatus(siteId);
        } catch (e) {
          e;
        }
      }
    },
  },
  mounted: function () {
    this.getData();
  },
  watch: {
    currentSite: {
      handler: function (newValue) {
        this.getData(newValue && newValue.id);
      },
    },
    networkConnectionStatus: {
      handler: function (newValue) {
        let totalDevices = 0;
        let totalGreenDevices = 0;
        const listItems = [];

        const gatewayData = newValue.find(
          (item) => item.assetType === DEVICES_TYPE.gateway
        );
        if (gatewayData) {
          totalDevices += gatewayData.totalCount;
          const redCount = gatewayData.healthStatusCount.RED;
          const greenCount = gatewayData.healthStatusCount.GREEN;
          totalGreenDevices += greenCount;
          listItems.push({
            value: redCount,
            text: this.$t('gateways'),
          });
        }

        const accessPointData = newValue.find(
          (item) => item.assetType === DEVICES_TYPE.accessPoint
        );
        if (accessPointData) {
          totalDevices += accessPointData.totalCount;
          const redCount = accessPointData.healthStatusCount.RED;
          const greenCount = accessPointData.healthStatusCount.GREEN;
          totalGreenDevices += greenCount;
          listItems.push({
            value: redCount,
            text: this.$t('access-points'),
          });
        }

        const locationBeaconData = newValue.find(
          (item) => item.assetType === DEVICES_TYPE.locationBeacon
        );
        if (locationBeaconData) {
          totalDevices += locationBeaconData.totalCount;
          const redCount = locationBeaconData.healthStatusCount.RED;
          const greenCount = locationBeaconData.healthStatusCount.GREEN;
          totalGreenDevices += greenCount;
          listItems.push({
            value: redCount,
            text: this.$t('location-beacons'),
          });
        }

        if (!listItems.length) {
          listItems.push({ value: 0, text: this.$t('devices') });
          this.goodDevicesPercentage = 0;
        } else {
          this.goodDevicesPercentage =
            Math.round((totalGreenDevices / totalDevices) * 100) || 0;
        }
        this.listItems = listItems;
      },
      immediate: true,
    },
  },
};
</script>
