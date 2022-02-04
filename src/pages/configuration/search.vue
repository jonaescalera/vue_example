<template>
  <div id="search-devices">
    <v-row>
      <v-col v-bind:class="{ 'max-card-height-mobile': mobileView }" class="custom-card card-no-footer-height">
        <v-row v-bind:class="{ 'small-text': mobileView }" class="ml-1 mt-3 custom-label">
          {{ $t('search-devices-title')}}
        </v-row>
        <v-row class="mb-5">
          <SearchBar class="search-bar-devices" :placeholder="searchBarPlaceHolder ? searchBarPlaceHolder : $t('device-search-placeholder')" notEncodedText="true" @searchText="onEnter" :cols="searchBarSize ? searchBarSize: 6"/>
        </v-row>
        <v-row v-bind:class="{ 'no-padding': mobileView }">
          <v-col class="ma-3" v-if="searchedDevice.name">
            <div class="item">
              <label>{{ $t('name') }}</label>
              <div class="text">{{ searchedDevice.name }}</div>
            </div>
            <div class="item">
              <label>{{ $t('id') }}</label>
              <div class="text">{{ searchedDevice.id }}</div>
            </div>
            <div class="item" v-if="deviceType">
              <label>{{ $t('type') }}</label>
              <div class="text">{{ deviceType }}</div>
            </div>
            <div class="item" :title="$t('visit-site')" @click="goToSite">
              <label>{{ $t('site') }}</label>
              <div class="text site-name" v-if="searchedDevice.siteName"><v-icon>mdi-open-in-app</v-icon>&nbsp;{{ searchedDevice.siteName }}</div>
              <div class="site-name" v-else><v-icon>mdi-open-in-app</v-icon>&nbsp;{{ $t('na') }}</div>
            </div>
            <div class="item">
              <label>{{ $t('provisioned') }}</label>
              <div class="text">{{ isProvisioned }}</div>
            </div>
            <div class="item">
              <label>{{ $t('lastProvisioned') }}</label>
              <div class="text">{{ searchedDevice.lastProvisioned }}</div>
            </div>
            <div v-if="searchedDevice && searchedDevice.unprovisionedTime" class="item">
              <label>{{ $t('lastUnprovisioned') }}</label>
              <div class="text">{{ searchedDevice.unprovisionedTime }}</div>
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import ConfirmModal from '../../components/shared/modals/confirmModal';
import { DEVICES_TYPE } from '../../constants/status';
import { NODE_ADDRESS_PATTERN, MAC_ADDRESS_PATTERN }  from '../../constants/regex';
import SearchBar from '../../components/search-bar/search-bar'

export default {
  name: 'Search',
  components: {
    ConfirmModal,
    SearchBar
  },
  data() {
    return {
      searchText: '',
      searchedDevice: {},
      deviceType: null,
      macAddressRegex:  new RegExp(MAC_ADDRESS_PATTERN),
      nodeAddressRegex: new RegExp(NODE_ADDRESS_PATTERN),
    };
  },
  props: ['searchBarSize', 'searchBarPlaceHolder', 'mobileView'],
  computed: {
    ...mapGetters('site', ['sites']),
    ...mapGetters('organization', ['organizations']),
    ...mapGetters('layout', ['getTheme']),
    isProvisioned() {
      return (
        this.searchedDevice &&
        (!this.searchedDevice.unprovisionedTime ||
          this.searchedDevice.lastProvisioned >
            this.searchedDevice.unprovisionedTime)
      );
    }
  },
  methods: {
    ...mapActions('accessPoint', ['getAccessPointById']),
    ...mapActions('gateway', ['getGatewayById']),
    ...mapActions('location', ['getLocationById']),
    ...mapActions('site', ['setCurrentSiteId', 'getSite', 'getSites']),
    ...mapActions('organization', ['setSelectedOrganizationId', 'getOrgUserRole']),
    ...mapActions('layout', ['getCustomTheme']),
    ...mapMutations('site', ['clearSite']),
    ...mapMutations('tag', ['clearTags']),
    ...mapMutations('area', ['clearArea']),
    ...mapMutations('header', ['setMapVisible']),
    ...mapMutations('organization', ['setSelectedOrganizationName']),

    async goToSite() {
      let siteId = this.searchedDevice.siteId;
      if (this.sites.find(s => s.id === siteId)) {
        //if the site belongs to the current organization
        this.setCurrentSiteId({ siteId })
        this.$router.push('assets');
      } else {
        try {
          let site = await this.getSite(siteId);
          let orgId = site?.assetInfo?.metadata?.props?.organizationId;
          let orgName = site?.assetInfo?.metadata?.props?.organizationName;
          if (orgId && this.organizations.find(o => o.id === orgId)) {
            // the site belongs to an organization for which the user has access
            await this.clearSite();
            await this.clearTags();
            this.setSelectedOrganizationId({id: orgId});
            this.setSelectedOrganizationName(orgName);
            await this.clearArea();
            await this.setMapVisible(false);
            localStorage.setItem('orgId', orgId);
            await this.getSites();
            await this.getOrgUserRole(orgId);
            await this.getCustomTheme({organizationUuid: orgId});
            const theme = this.getTheme;
            this.$vuetify.theme.themes.light.primary = theme.colorSettings.primary;
            this.$vuetify.theme.themes.light.secondary = theme.colorSettings.secondary;
            this.$vuetify.theme.themes.light.primaryLight = theme.colorSettings.primaryLight;
            this.$vuetify.theme.themes.light.info = theme.colorSettings.info || '#3b5762';
            this.setCurrentSiteId({ siteId: siteId });
            this.$router.push('assets');
          }
          } catch (error) {
            this.$toasted.show(this.$t('search-devices-error-redirect'), {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });       
        }
      }
    },
    async onEnter(value) {
      this.searchText = value;
      if (this.searchText === '') {
        this.searchedDevice = {};
        this.deviceType = null;
        return;
      }
      if (!this.macAddressRegex.test(this.searchText) && !this.nodeAddressRegex.test(this.searchText)) {
        this.$toasted.show(this.$t('search-devices-error'), {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
        return;
      }
      const rawId = this.searchText.replace(/:/g, '');
      try {
        this.searchedDevice = {};
        if (rawId.indexOf('$101') > -1) {
          this.deviceType = DEVICES_TYPE.gateway;
          const gateway = await this.getGatewayById(rawId);
          this.searchedDevice = gateway;
        } else if (rawId.indexOf('$301') > -1 || rawId.indexOf('c00') > -1) {
          this.deviceType = DEVICES_TYPE.accessPoint;
          const ap = await this.getAccessPointById(rawId);
          this.searchedDevice = ap;
        } else {
          this.deviceType = null;
          const location = await this.getLocationById(rawId);
          this.searchedDevice = location;
        }
      } catch (e) {
        this.$toasted.show(e, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.custom-card {
  overflow-y: auto;
  min-height: 200px;
}
.search-bar-devices {
  margin-left: -10px !important;
}
.search-title {
  font-weight: bold;
}
.site-name {
  cursor: pointer;
  max-width: fit-content;
  &:hover {
    color: var(--v-primary-base);
    i {
      color: var(--v-primary-base);
    }
  }
  i {
    top: -2px;
  }
}
.item {
  margin: 15px 0;
  .text {
    font-weight: bold;
  }
}
.small-text {
  font-size: .86rem;
}
.no-padding {
  margin-top: -40px;
}
.max-card-height-mobile {
  max-height: 79vh;
  margin-bottom: 15px;
}
</style>