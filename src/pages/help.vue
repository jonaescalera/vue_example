<template>
  <div>
    <v-row>
      <v-col class="custom-card px-0 pa-0 card-no-footer-height">
        <v-row class="h-100 pb-3 pt-3">
          <v-col
            cols="12"
            sm="6"
            class="vertical-divider help-card default-scroll-bar"
          >
            <h3 class="ml-3 mb-5">{{ $t('help-page-videos-tours') }}</h3>
            <v-row @click="launchGettingStartedTour" id="introTour" class="mx-5 mb-5 media-row">
              <v-col md="3" cols="12" class="primary white--text py-6 px-1 text-ellipsis">
                <v-icon color="#fff" right>mdi-school-outline</v-icon>
                {{ $t('help-page-how-to') }}
              </v-col>
              <v-col md="9" cols="12" class="primaryLight pt-6">
                {{ $t('help-page-intro', { name: host }) }}
              </v-col>
            </v-row>
            <v-row
              @click="openMapUpgradeVideo"
              id="mapUpgrade"
              class="mx-5 mb-5 media-row"
            >
              <v-col md="3" cols="12" class="primary white--text py-6 px-1 text-ellipsis">
                <v-icon color="#fff" right>mdi-video</v-icon>
                {{ $t('video') }}
              </v-col>
              <v-col md="9" cols="12" class="primaryLight pt-6">
                {{ $t('help-map-upgrades') }}
              </v-col>
            </v-row>
            <v-row
              @click="openSuperTagActivationsVideo"
              id="activatingSupertagPro"
              class="mx-5 mb-5 media-row"
            >
              <v-col md="3" cols="12" class="primary white--text py-6 px-1 text-ellipsis">
                <v-icon color="#fff" right>mdi-video</v-icon>
                {{ $t('video') }}
              </v-col>
              <v-col md="9" cols="12" class="primaryLight pt-6">
                {{ $t('activating-airFinder-superTag-pro') }}
              </v-col>
            </v-row>
            <v-row
              @click="openAddingLocationsVideo"
              id="addingIndoorLoc"
              class="mx-5 mb-5 media-row"
            >
              <v-col md="3" cols="12" class="primary white--text py-6 px-1 text-ellipsis">
                <v-icon color="#fff" right>mdi-video</v-icon>
                {{ $t('video') }}
              </v-col>
              <v-col md="9" cols="12" class="primaryLight pt-6">
                {{ $t('adding-indoor-locations') }}
              </v-col>
            </v-row>
            <v-row
              @click="openCloudSyncVideo"
              id="cloudSync"
              class="mx-5 mb-5 media-row"
            >
              <v-col md="3" cols="12" class="primary white--text py-6 px-1 text-ellipsis">
                <v-icon color="#fff" right>mdi-video</v-icon>
                {{ $t('video') }}
              </v-col>
              <v-col md="9" cols="12" class="primaryLight pt-6">
                {{ $t('cloudSync-superTag') }}
              </v-col>
            </v-row>
            <v-row
              id="helpCreating"
              @click="
                openFile(
                  'http://mediaupload-us-east1.s3.amazonaws.com/pdf/AirFinder%20SuperTag%20ATK02%20Mounting%20Guide.pdf'
                )
              "
              class="mx-5 mb-5 media-row"
            >
              <v-col md="3" cols="12" class="primary white--text py-6 px-1 text-ellipsis">
                <v-icon color="#fff" right>mdi-file-pdf</v-icon>
                {{ $t('download') }}
              </v-col>
              <v-col md="9" cols="12" class="primaryLight pt-6">
                {{ $t('help-page-mounting') }}
              </v-col>
            </v-row>
            <v-row
              id="resFloorPlan"
              @click="
                openFile(
                  'http://mediaupload-us-east1.s3.amazonaws.com/images/sample_floorplan_residential.png'
                )
              "
              class="mx-5 mb-5 media-row"
            >
              <v-col md="3" cols="12" class="primary white--text py-6 px-1 text-ellipsis">
                <v-icon color="#fff" right>mdi-file-image</v-icon>
                {{ $t('download') }}
              </v-col>
              <v-col md="9" cols="12" class="primaryLight pt-6">
                {{ $t('sample-residential') }}
              </v-col>
            </v-row>
            <v-row
              id="comFloorPlan"
              @click="
                openFile(
                  'http://mediaupload-us-east1.s3.amazonaws.com/images/sample_floorplan_commerical.png'
                )
              "
              class="mx-5 mb-5 media-row"
            >
              <v-col md="3" cols="12" class="primary white--text py-6 px-1 text-ellipsis">
                <v-icon color="#fff" right>mdi-file-image</v-icon>
                {{ $t('download') }}
              </v-col>
              <v-col md="9" cols="12" class="primaryLight pt-6">
                {{ $t('sample-commercial') }} 
              </v-col>
            </v-row>
            <v-row
              id="resFloorPlan"
              @click="
                openFile(
                  'http://mediaupload-us-east1.s3.amazonaws.com/pdf/AirFinder%20SuperTag%20Pro%20-%20Activation%20Guide-v1.pdf'
                )
              "
              class="mx-5 mb-5 media-row"
            >
              <v-col md="3" cols="12" class="primary white--text py-6 px-1 text-ellipsis">
                <v-icon color="#fff" right>mdi-file-pdf</v-icon>
                {{ $t('download') }}
              </v-col>
              <v-col md="9" cols="12" class="primaryLight pt-6">
                {{ $t('activation-guide') }}
              </v-col>
            </v-row>
            <v-row
              id="comFloorPlan"
              @click="
                openFile(
                  'http://mediaupload-us-east1.s3.amazonaws.com/pdf/CloudSync%20-%20AirFinder%20SuperTag%20Pro%20Instructions%20v1.pdf'
                )
              "
              class="mx-5 mb-5 media-row"
            >
              <v-col md="3" cols="12" class="primary white--text py-6 px-1 text-ellipsis">
                <v-icon color="#fff" right>mdi-file-pdf</v-icon>
                {{ $t('download') }}
              </v-col>
              <v-col md="9" cols="12" class="primaryLight pt-6">
                {{ $t('cloudSync-guide') }}
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" sm="6" class="contact-us" id="contact-us-id">
            <h3 class="ml-3 mb-5">{{ $t('help-page-contact-us') }}</h3>
            <v-row>
              <v-col class="d-flex justify-center">
                <v-btn
                  id="contact-support"
                  @click="submitTicket"
                  color="primary"
                >
                  <span>{{ $t('help-page-enter-ticket') }}</span>
                  <v-icon right>mdi-lifebuoy</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-dialog
      @click:outside="closeModalVideo"
      persistent
      scrollable
      v-model="videoDialog"
    >
      <v-card>
        <v-card-title class="secondary">{{ videoTitle }}</v-card-title>
        <v-card-text>
          <video
            class="video-player mt-5"
            id="videoPlayerId"
            controls
            autoplay
            height="700"
          ></video>
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
  name: 'Help',
  data() {
    return {
      videoDialog: false,
      videoLink: '',
      videoTitle: '',
      host: ''
    };
  },
  mounted() {
    window.location.hostname !== 'localhost' ? this.host = window.location.hostname : this.host = 'apps.airfinder.com';
  },
  methods: {
    submitTicket() {
      window.open(
        'https://link-labs.zendesk.com/hc/en-us/requests/new?ticket_form_id=360000334931',
        '_blank'
      );
    },
    openFile(file) {
      window.open(file, '_blank');
    },
    openSuperTagActivationsVideo() {
      this.openVideo(
        'http://mediaupload-us-east1.s3.amazonaws.com/videos/Activation-720p.mp4',
        this.$i18n.t('activating-airFinder-superTag-pro')
      );
    },
    openAddingLocationsVideo() {
      this.openVideo(
        'http://mediaupload-us-east1.s3.amazonaws.com/videos/Adding_Locations_720p.mp4',
        this.$i18n.t('adding-indoor-locations')
      );
    },
    openCloudSyncVideo() {
      this.openVideo(
        'http://mediaupload-us-east1.s3.amazonaws.com/videos/CloudSync-720p.mp4',
        this.$i18n.t('cloudSync-superTag')
      );
    },
    openMapUpgradeVideo() {
      this.openVideo(
        'http://mediaupload-us-east1.s3.amazonaws.com/videos/Map%20Upgrades.mov',
        this.$i18n.t('help-map-upgrades')
      );
    },
    openVideo(link, title) {
      if (link) {
        this.videoDialog = true;
        setTimeout(() => {
          let videoCont = document.getElementById('videoPlayerId');
          let source = document.createElement('source');
          source.setAttribute('src', link);
          videoCont.appendChild(source);
          this.videoTitle = title;
        }, 100);
      }
    },
    launchGettingStartedTour() {
      window.chmln.show(process.env.VUE_APP_APPLICATION_HOW_TO_TOUR_ID);
    },
    closeModalVideo() {
      let videoCont = document.getElementById('videoPlayerId');
      if (videoCont) {
        videoCont.pause();
        videoCont.removeAttribute('src');
        videoCont.innerHTML = '';
        videoCont.load();
      }
      this.videoDialog = false;
    },
  },
};
</script>

<style scoped lang="scss">
.vertical-divider {
  border-right: 1px solid var(--v-secondary-base);
  height: 100%;
}
#helpCreating .col {
  cursor: pointer;
}
.help-card {
  overflow: auto;
  overflow-x: hidden;
}
.media-row {
  cursor: pointer;
}
@media (max-width: 568px) {
  .vertical-divider {
    border: none;
    height: auto;
  }
  .contact-us h3 {
    border-top: 1px solid var(--v-secondary-base);
    padding-top: 20px;
    margin-right: 10px;
  }
}
</style>