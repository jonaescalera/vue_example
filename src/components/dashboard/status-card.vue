<template>
  <v-card outlined class="mx-auto fill-height">
    <v-container>
      <v-row>
        <v-card-title class="font-weight-bold">{{ title }}</v-card-title>
      </v-row>
      <v-row v-if="errorMessage" class="flex-row justify-center">
        <v-col cols="auto">
          {{ errorMessage }}
        </v-col>
      </v-row>
      <template v-else>
        <v-row>
          <v-col cols="6" class="d-inline-flex justify-center align-center">
            <loader-circle
              :semiCircle="semiCircle"
              :iconName="iconName"
              :progress="progress"
            />
          </v-col>
          <v-col cols="6">
            <v-row>
              <!-- Using v-layout here as v-divider vertical does not render without it -->
              <!-- Need to find a better way for this -->
              <v-layout>
                <v-divider vertical></v-divider>
                <div>
                  <span v-if="subTitle">{{ subTitle }}</span>
                  <v-list>
                    <v-list-item v-for="item in listItems" :key="item.text">
                      <span class="font-weight-bold">{{ item.value }}</span>
                      {{ item.text }}
                    </v-list-item>
                  </v-list>
                </div>
              </v-layout>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="auto" class="font-weight-bold">
            {{ statusValue }}%
          </v-col>
          <v-col>
            {{ mainItemText }}
          </v-col>
        </v-row>
      </template>
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
  name: 'StatusCard',
  components: {
    LoaderCircle,
  },
  props: {
    errorMessage: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: function () {
        return this.$t('status');
      },
    },
    subTitle: {
      type: String,
      default: '',
    },
    listItems: {
      type: Array,
      default: function () {
        return [
          { value: 38, text: this.$t('tags') },
          { value: 7, text: this.$t('location-beacons') },
          { value: 33, text: this.$t('gateways') },
        ];
      },
    },
    mainItemText: {
      type: String,
      default: function () {
        return this.$t('dashboard-status-card-main-text');
      },
    },
    semiCircle: {
      type: Boolean,
      default: false,
    },
    statusValue: {
      type: Number,
      default: 62.5,
    },
    iconName: {
      type: String,
      default: 'mdi-battery-80',
    },
  },
  data: function () {
    return {
      totalSteps: 10,
      completedSteps: 5,
      progressBarId: 'status-card-progress-bar',
      progressBarRef: null,
      progress: 0,
      overlay: true,
    };
  },
  watch: {
    statusValue: {
      handler: function (newValue) {
        this.progress = newValue / 100;
      },
      immediate: true,
    },
  },
};
</script>
