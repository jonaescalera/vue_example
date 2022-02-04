<template>
  <v-card outlined class="mx-auto fill-height">
    <v-container class="fill-height">
      <v-row class="flex-column">
        <v-card-title class="font-weight-bold">
          {{ $t('last-viewed-map') }}
        </v-card-title>
        <v-card-subtitle
          v-if="mapArea && mapArea.value"
          class="font-weight-bold"
        >
          {{ mapArea.value }}
        </v-card-subtitle>
      </v-row>
      <v-row>
        <v-col
          class="flex-grow-1"
          v-if="mapArea && mapArea.id"
          @click="onMapClick"
        >
          <assets-map-view
            class="d-block"
            styles= "max-height: 380px"
            :inputArea="mapArea"
            :onlyMap="true"
            :readOnly="true"
          >
          </assets-map-view>
        </v-col>
        <v-col cols="auto" class="ma-auto">
          {{ errorMessage }}
        </v-col>
      </v-row>
      <v-row v-if="errorMessage" class="flex-row justify-center"> </v-row>
    </v-container>
    <v-overlay
      absolute
      color="rgb(236, 236, 236)"
      opacity="0.6"
      :value="disabled"
    >
    </v-overlay>
  </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import AssetsMapView from '../assets-map-view/assets-map-view.vue';

export default {
  name: 'LastViewedMap',
  components: {
    AssetsMapView,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      errorMessage: null,
      mapArea: null,
    };
  },
  computed: {
    ...mapGetters('site', ['currentSite']),
  },
  methods: {
    ...mapActions('area', ['getAreas', 'setCurrentAreaId']),
    onMapClick: function () {
      const areaId = this.mapArea && this.mapArea.id;
      if (areaId) {
        this.setCurrentAreaId({ areaId });
        this.$router.push('assets');
      }
    },
  },
  watch: {
    currentSite: {
      handler: async function (newValue) {
        this.errorMessage = null;
        if (newValue && newValue.id) {
          try {
            const areas = await this.getAreas({ siteId: newValue.id });
            if (areas && areas.length) {
              this.mapArea = areas[0];
              return;
            }
            this.mapArea = {};
            this.errorMessage = this.$t(
              'dashboard-last-viewed-map-no-outdoor-area-msg'
            );
          } catch {
            this.errorMessage = this.$t('something-went-wrong');
          }
        } else {
          this.errorMessage = this.$t('dashboard-no-site-error-msg');
        }
      },
      immediate: true,
    },
  },
};
</script>
