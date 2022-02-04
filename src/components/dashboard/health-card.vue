<template>
  <v-card outlined class="mx-auto fill-height">
    <v-container class="fill-height">
      <v-row class="fill-height flex-column" justify="space-between">
        <v-card-title class="font-weight-bold">
          {{ $t('overall-health') }}
        </v-card-title>
        <v-col cols="auto" class="d-inline-flex justify-center align-center">
          <loader-circle
            :semiCircle="true"
            iconName="mdi-cogs"
            :progress="progress"
          />
        </v-col>
        <v-col>
          <div class="text-center subtitle-1 font-weight-bold">
            {{ $t('very-good') }}
          </div>
          <v-card-subtitle>
            {{ $t('dashboard-health-status-good-msg') }}
          </v-card-subtitle>
        </v-col>
      </v-row>
      <v-row> </v-row>
      <v-overlay
        absolute
        color="rgb(236, 236, 236)"
        opacity="0.6"
        :value="disabled"
      >
      </v-overlay>
    </v-container>
  </v-card>
</template>
<script>
import LoaderCircle from '../shared/loaders/loader-circle.vue';

export default {
  name: 'HealthCard',
  components: {
    LoaderCircle,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0.625,
    },
  },
  data: function () {
    return {
      totalSteps: 10,
      completedSteps: 5,
      progressBarId: 'status-card-progress-bar',
      progressBarRef: null,
    };
  },
};
</script>
