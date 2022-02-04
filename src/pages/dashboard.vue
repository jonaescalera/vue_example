<template>
  <div id="dashboard" class="dashboard">
    <v-row>
      <div class="item small-widget">
        <health-card disabled />
      </div>
      <div class="item small-widget">
        <status-card
          :title="$t('battery-status')"
          iconName="mdi-battery-80"
          disabled
        />
      </div>
      <div class="item small-widget">
        <network-connection />
      </div>
      <div class="item small-widget">
        <status-card
          :title="$t('heartbeat-status')"
          iconName="mdi-heart-pulse"
          disabled
        />
      </div>
      <div class="item big-widget">
        <last-viewed-map />
      </div>
    </v-row>
  </div>
</template>
<script>
import HealthCard from '../components/dashboard/health-card.vue';
import StatusCard from '../components/dashboard/status-card.vue';
import NetworkConnection from '../components/dashboard/network-connection.vue';
import LastViewedMap from '../components/dashboard/last-viewed-map.vue';

export default {
  name: "Dashboard",
  components: {
    HealthCard,
    StatusCard,
    NetworkConnection,
    LastViewedMap,
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 0 30px;
  height: calc(100vh - 96px);
  overflow: auto;
  .item {
    padding: 5px;
  }
  .small-widget {
    width: 350px;
    height: 350px;
  }
  .big-widget {
    width: 700px;
    height: 510px;
  }
}
</style>
