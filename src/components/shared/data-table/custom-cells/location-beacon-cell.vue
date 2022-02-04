<template>
  <div>
    <v-menu
      top
      :value="menuShown"
      :close-on-content-click="false"
      max-width="400"
      nudge-left="190"
      nudge-top="10"
      :offset-y="true"
      v-if="locationBeaconOnWithNoArea"
    >
      <template v-slot:activator="{ on }">
        <v-icon
          v-on="on"
          @click="menuShown = true"
          class="warningIcon"
          v-text="'mdi-information'"
        ></v-icon>
      </template>
      <v-card>
        <v-btn color="primary" text fab outlined x-small dark class="float-right mt-1 mr-1" title="close" @click="menuShown = false">
            <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-text class="pt-8">
          {{$t('location-beacon-on-siab-alert', { tagName: params.name, tagMac: tagMacAddress, lbName: params.locationName, lbMac: lbMacAddress })}}
          <br>
          <br>
          {{$t('location-beacon-on-siab-alert2')}}
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-col>
            <v-btn
              small
              color="secondary"
              tabindex="3"
              @click="dialog = true"
              class="ml-3 float-right"
            >{{$t('play')}}</v-btn>
            <v-btn
              small
              depressed
              dark
              class="float-right"
              @click="submitTicket"
            >{{$t('contact-support')}}</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-menu>
    <span v-else>{{ params.locationName }}</span>
    <v-dialog @click:outside="closeModalVideo" scrollable v-model="dialog">
      <v-card>
        <v-card-title class="secondary">{{ params.name }}</v-card-title>
        <v-card-text>
          <video
            class="video-player mt-5"
            ref="video"
            autoplay
            controls
            height="700"
          >
            <source
              src="http://mediaupload-us-east1.s3.amazonaws.com/videos/Adding_Locations_720p.mp4"
              type="video/mp4"
            />
          </video>
          <v-row>
            <v-col>
              <v-btn
                @click="closeModalVideo"
                depressed
                color="secondary float-right"
                >{{ $t('close') }}</v-btn
              >
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
      menuShown: false,
      hideAlertForMacAddress: 'c0:00'
    };
  },
  props: ['params', 'field'],
  openModal() {
    this.dialog = true;
  },
  computed: {
    lbMacAddress() {
      return this.params.location.macAddress.toUpperCase();
    },
    tagMacAddress() {
      return this.params.macAddress.toUpperCase();
    },
    locationBeaconOnWithNoArea() {
      let isIndoor = false;
      if (this.params.locationTime && !this.params.latitudeTime) {
        isIndoor = true;
      } else if (this.params.locationTime && this.params.latitudeTime) {
        const locationTime = this.$moment(this.params.locationTime);
        const latitudeTime = this.$moment(this.params.latitudeTime);
        const eventTimeDiff = locationTime.diff(latitudeTime, 'seconds');
        isIndoor = eventTimeDiff > 0; //Last event by LB
      }
      let macAddressFirstFiveDigits = '';
      if (this.params.location.macAddress) {
        macAddressFirstFiveDigits = this.params.location.macAddress.slice(0,5).toLowerCase();
      }
      return (
        this.params.location &&
        this.params.location.macAddress &&
        macAddressFirstFiveDigits !== this.hideAlertForMacAddress &&
        this.params.area &&
        !this.params.area.id &&
        isIndoor
      );
    }
  },
  methods: {
    closeModalVideo() {
      this.$refs.video.pause();
      this.dialog = false;
    },
    submitTicket() {
      window.open(
        'https://link-labs.zendesk.com/hc/en-us/requests/new?ticket_form_id=360000334931',
        '_blank'
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.warningIcon {
  color: var(--v-info-lighten1);
  height: 20px;
  width: 20px;
}
</style>