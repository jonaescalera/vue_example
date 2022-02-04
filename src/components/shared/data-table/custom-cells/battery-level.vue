<template>
  <div>
    <img v-if="params[field] !== null" class="battery" v-bind:src="icon"/>
    <span v-else >-- --</span>
  </div>
</template>

<script>
import { WARNING_DAYS } from '../../../../constants/warning-days'
export default {
  data() {
    return {
      icon: null,
      batteryFull: require('../../../../assets/img/aggrid/battery-full.png'),
      batteryLow: require('../../../../assets/img/aggrid/battery-low.png'),
      batteryHalf: require('../../../../assets/img/aggrid/battery-half.png'),
      batteryFullQuestion: require('../../../../assets/img/aggrid/battery-full-question.png'),
      batteryLowQuestion: require('../../../../assets/img/aggrid/battery-low-question.png'),
      batteryHalfQuestion: require('../../../../assets/img/aggrid/battery-half-question.png')
    }
  },
  props: ['params', 'field'],
  watch:{
    params(){
      this.getBatteryIcon(this.params[this.field]);
    }
  },
  created() { 
    this.getBatteryIcon(this.params[this.field]);
  },
  methods: {
    getBatteryIcon(id) {
      let tagDate = new Date(this.params.lastEventTime);
      let useQuestionMark = false;
      if (this.params.notSeenInDays >= WARNING_DAYS.MIN) {
        useQuestionMark = true;
      }
      switch (id) {
        case 0:
          this.icon = useQuestionMark ? this.batteryLowQuestion : this.batteryLow;
          break;
        case 1:
          this.icon = useQuestionMark ? this.batteryFullQuestion : this.batteryFull;
          break;  
        case 2:
          this.icon = useQuestionMark ? this.batteryHalfQuestion : this.batteryHalf;
          break;
      }
    }
  }
};
</script>