<template>
  <div>
    <v-dialog
      @click:outside="closeModal"
      @keydown.esc="closeModal"
      v-model="dialog"
      width="413"
    >
      <v-card id="viewDeviceModal"> 
        <v-btn color="primary" text fab outlined x-small dark class="float-right mt-1 mr-1 closeBtn" title="close" @click="dialog = false">
            <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-text>
          <v-row>
          <v-col class="ma-3">
            <div class="item" v-if="device.name">
              <label>{{ $t('name') }}</label>
              <div class="text">{{ device.name }}</div>
            </div>
            <div class="item">
              <label>{{ $t('id') }}</label>
              <div class="text">{{ device.id }}</div>
            </div>
            <div class="item" v-if="device.macAddress">
              <label>{{ $t('mac-address') }}</label>
              <div class="text">{{ device.macAddress }}</div>
            </div>
            <div class="item" v-if="device.areaName">
              <label>{{ $t('area') }}</label>
              <div class="text">{{ device.areaName }}</div>
            </div>
            <div class="item" v-if="device.areaId">
              <label>{{ $t('area') }} &nbsp; {{ $t('id') }}</label>
              <div class="text">{{ device.areaId }}</div>
            </div>
            <div class="item" v-if="device.zoneName">
              <label>{{ $t('zone') }}</label>
              <div class="text">{{ device.zoneName }}</div>
            </div>
            <div class="item" v-if="device.zoneId">
              <label>{{ $t('zone') }} &nbsp; {{ $t('id') }}</label>
              <div class="text">{{ device.zoneId }}</div>
            </div>
            <div class="item" v-if="device.siteName">
              <label>{{ $t('site') }}</label>
              <div class="text">{{ device.siteName }}</div>
            </div>
            <div class="item">
              <label>{{ $t('provisioned') }}</label>
              <div class="text">{{ isProvisioned }}</div>
            </div>
            <div class="item" v-if="device.lastProvisioned">
              <label>{{ $t('lastProvisioned') }}</label>
              <div class="text">{{ device.lastProvisioned }}</div>
            </div>
            <div class="item" v-if="device.unprovisionedTime">
              <label>{{ $t('lastUnprovisioned') }}</label>
              <div class="text">{{ device.unprovisionedTime }}</div>
            </div>
          </v-col>
        </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      device: {}
    };
  },
  computed: {
    isProvisioned() {
      return (
        this.device &&
        (!this.device.unprovisionedTime ||
          this.device.lastProvisioned >
            this.device.unprovisionedTime)
      );
    },
  },
  methods: {
    openModal(device) {
      this.dialog = true;
      this.device = device;
    },
    closeModal() {
      this.dialog = false;
    }
  },
};
</script>

<style lang="scss" scoped>
#viewDeviceModal {
  min-height: 100px;
}
.closeBtn {
    top: 0px;
    right: 0px;
    position: absolute;
}
.item {
  margin: 15px 0;
  .text {
    font-weight: bold;
  }
}
</style>