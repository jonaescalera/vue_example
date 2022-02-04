<template>
  <div class="progress-container">
    <div
      :id="progressBarId"
      v-bind:class="{ 'progress-cricle-height': !semiCircle }"
    ></div>
    <div
      class="progress-icon d-inline-flex justify-center"
      v-bind:class="{ 'progress-icon-semi-circle': semiCircle }"
    >
      <v-icon class="mini-link-icon" x-large>{{ iconName }}</v-icon>
    </div>
  </div>
</template>
<script>
import ProgressBar from 'progressbar.js';

let idSuffix = 0;
const idPrefix = 'loader-progress-bar';

export default {
  name: 'LoaderCircle',
  props: {
    semiCircle: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0.625,
    },
    iconName: {
      type: String,
      default: 'mdi-battery-80',
    },
  },
  data: function () {
    return {
      progressBarRef: null,
    };
  },
  beforeMount: function () {
    this.progressBarId = `${idPrefix}${++idSuffix}`;
  },
  mounted: function () {
    const progressBarConfig = {
      strokeWidth: 5,
      easing: 'easeInOut',
      duration: 1400,
      color: '#717171',
      trailColor: '#e8e8e8',
      trailWidth: 5,
      svgStyle: null,
    };
    if (this.semiCircle) {
      this.progressBarRef = new ProgressBar.SemiCircle(
        `#${this.progressBarId}`,
        progressBarConfig
      );
    } else {
      this.progressBarRef = new ProgressBar.Circle(
        `#${this.progressBarId}`,
        progressBarConfig
      );
    }
    this.progressBarRef.animate(this.progress);
  },
  watch: {
    progress: function (newVal) {
      if (this.progressBarRef) {
        this.progressBarRef.animate(newVal);
      }
    },
  },
};
</script>
<style scoped>
.progress-container {
  position: relative;
  width: 150px;
}

.progress-cricle-height {
  height: 150px;
}

.progress-icon {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  position: absolute;
}

.progress-icon-semi-circle {
  margin-top: 5px;
}
</style>
