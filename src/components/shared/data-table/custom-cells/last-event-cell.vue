<template>
  <div class="d-inline">
    <v-icon
      v-if="icon"
      v-bind:class="[{ 'mr-2': !showBatteryOnly },{ 'mr-1': showBatteryOnly }]"
      :title="$t('not-seen-in-days', {days : params.notSeenInDays})"
      :color="icon === 'mdi-close-circle' ? 'error' : icon === 'mdi-alert' ? 'warning' : 'none'"
      small
      >{{ icon }}
    </v-icon>
    <div v-else class="no-icon-container"></div>
    <span  class="last-seen-text text-ellipsis" v-if="params.lastEventTime && !showBatteryOnly">{{params.lastEventTime | moment('MM/DD/YYYY hh:mm A')}}</span>
  </div>
</template>

<script>
import { WARNING_DAYS } from '../../../../constants/warning-days'
export default {
  props: ['params', 'showBatteryOnly'],
  computed: {
    icon() {
      let tagDate = new Date(this.params.lastEventTime);
      if (this.params.notSeenInDays > WARNING_DAYS.MAX) {
        return 'mdi-close-circle';
      }else if (this.params.notSeenInDays >= WARNING_DAYS.MIN) {
        return 'mdi-alert';
      }else {
        return ''
      }
    }
  }
};
</script>
<style lang="scss" scoped>
  .last-seen-text {
    min-width: 140px;
  }
  .no-icon-container {
    width: 24px;
    display: inline-block;
  }
</style>