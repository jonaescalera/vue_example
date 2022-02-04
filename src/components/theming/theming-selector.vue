<template>
  <div id="themingSelector">
    <v-row>
      <div class="mx-4 mt-2">
        <p class="mb-1">{{ $t('theming-page-primary') }}:</p>
        <v-btn
          @click.stop="openDialog('primary', theme.primary)"
          :color="theme.primary"
        ></v-btn>
      </div>
      <div class="mx-4 mt-2">
        <p class="mb-1">{{ $t('theming-page-secondary') }}:</p>
        <v-btn
          @click.stop="openDialog('secondary', theme.secondary)"
          :color="theme.secondary"
        ></v-btn>
      </div>
      <div class="mx-4 mt-2">
        <p class="mb-1">{{ $t('theming-page-info') }}:</p>
        <v-btn
          @click.stop="openDialog('info', theme.info)"
          :color="theme.info"
        ></v-btn>
      </div>
      <v-checkbox
          id="livePreviewCheckbox"
          class="ml-4"
          v-model="livePreview"
          @change="applyColor"
          :label="$t('theming-page-live-preview')" >               
      </v-checkbox>
    </v-row>

    <v-row class="logo-selector mt-4">      
      <v-col md="6" sm="12" class="pt-0">
        <v-row>
          <v-col md="4">
            <p class="mb-3 font-weight-bold">{{$t('theming-page-logo')}}</p>
            <div class="logo-large">
              <v-img :src="largeImage" max-width="133" aspect-ratio="3"></v-img>
            </div>
            <p class="mt-3 mb-0">{{ $t('theming-page-preferer-size-large') }}</p>
            <p class="mb-1">PNG, GIF {{$t('theming-page-or')}} JPG</p>
            <v-btn @click="$refs.largeIconUpload.click()" small color="primaryLight" class="mt-3"><v-icon class="mr-1" small v-text="'mdi-cloud-upload'"></v-icon>{{ $t('theming-page-upload-large') }}</v-btn>
            <input ref="largeIconUpload" @change="iconSelected($event, logoSizes.large, logoResolutions.large)" class="invisible-input" type="file">
          </v-col>
          <v-col md="6">
            <p class="mb-3 font-weight-bold">{{$t('theming-page-favicon')}}</p>
            <div class="logo-small mr-3">
              <v-img :src="smallImage" ></v-img>
            </div>
            <p class="mt-3 mb-0">{{ $t('theming-page-preferer-size-small') }}</p>
            <p class="mb-1">PNG, GIF {{$t('theming-page-or')}} JPG</p>
            <v-btn @click="$refs.smallIconUpload.click()" small color="primaryLight" class="mt-3"><v-icon class="mr-1" small v-text="'mdi-cloud-upload'"></v-icon>{{ $t('theming-page-upload-small') }}</v-btn>
            <input ref="smallIconUpload" @change="iconSelected($event, logoSizes.small, logoResolutions.small)" class="invisible-input" type="file">
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline secondary">{{ $t('theming-page-colorpicker-title') }}</v-card-title>
        <v-card-text class="mt-4">
          <v-color-picker v-model="color"></v-color-picker>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            {{ $t('theming-page-colorpicker-close') }}
          </v-btn>

          <v-btn
            color="secondary"
            depresed
            @click="saveSelection()"
          >
            {{ $t('theming-page-colorpicker-accept') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { pSBC } from "../../mixins/colorModifier";
import {fileNameLimit, allowedFileTypes} from '../../constants/theme';
import { logoSizes, logoResolutions } from '../../constants/theme';

export default {
  mixins: [pSBC],
  props: ['customTheme'],
  data() {
    return {
      theme: Object.assign({}, this.customTheme.colorSettings),
      smallImage: 'data:image/jpeg;base64,' + this.customTheme.smallImage.data,
      largeImage: 'data:image/jpeg;base64,' + this.customTheme.largeImage.data,
      currentColor: {},
      livePreview: false,
      dialog: false,
      color: null,
      colorSelected: null,
      logoSizes,
      logoResolutions
    };
  },
  watch: {
      customTheme(newValue) {
        this.theme = Object.assign({}, newValue.colorSettings);
        this.smallImage = 'data:image/jpeg;base64,' + newValue.smallImage.data;
        this.largeImage = 'data:image/jpeg;base64,' + newValue.largeImage.data;
        this.livePreview = false;
      }
    },
  methods: {
    openDialog(color, value){
      this.colorSelected = color;
      this.color = value;
      this.dialog = true;
    },
    saveSelection(){
      this.$set(this.theme, this.colorSelected, this.color);
      if(this.colorSelected === "primary")
        this.$set(this.theme, 'primaryLight', pSBC.computed.pSBC(0.88, this.theme.primary));
      this.$emit("modified", this.theme);
      this.dialog = false;
    },
    applyColor() {
      if (this.livePreview) {
        this.$vuetify.theme.themes.light.primary = this.theme.primary;
        this.$vuetify.theme.themes.light.secondary = this.theme.secondary;
        this.$vuetify.theme.themes.light.primaryLight = this.theme.primaryLight;
        this.$vuetify.theme.themes.light.info = this.theme.info;
      } else {
        this.$vuetify.theme.themes.light.primary = this.customTheme.colorSettings.primary;
        this.$vuetify.theme.themes.light.secondary = this.customTheme.colorSettings.secondary;
        this.$vuetify.theme.themes.light.primaryLight = this.customTheme.colorSettings.primaryLight;
        this.$vuetify.theme.themes.light.info = this.customTheme.colorSettings.info;
      }
    },
    async iconSelected(event, logoSize, logoResolution) {
      let invalidFileError;
      if (event.target.files[0]) {
        let type = event.target.files[0].type;
        let name = event.target.files[0].name;
        if(name.length > fileNameLimit){
          this.$toasted.show(this.$t('theming-page-error-name'), { 
            position: "bottom-right",
            className: ['toast-error'], 
            duration : 5000
          });
          return false;
        }
        if(allowedFileTypes.includes(type)){
          const file = event.target.files[0];
          const isImageResolutionValid = await this.validateFileResolution(file, logoResolution);
          if (isImageResolutionValid) {
            this[logoSize] = URL.createObjectURL(file);
            this.$emit('logoChanged', file, logoSize);
          } else {
            invalidFileError = this.$t('theming-page-error-resolution');
          }
        } else {
          invalidFileError = this.$t('theming-page-error-type');
        }

        if (invalidFileError) {
          this.$toasted.show(invalidFileError, {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });
        }
      }
    },
    validateFileResolution(file, resolution) {
      return new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = (e) => {
          let image = new Image();
          image.src = e.target.result;

          image.onload = function () {
            const width = this.width;
            const height = this.height;

            if (width <= resolution.width && height <= resolution.height) {
              resolve(true);
            } else {
              resolve(false);
            }
          };
        };
        reader.readAsDataURL(file);
      });
    },
  }
};

</script>

<style lang="scss" scoped>
  .logo-large {
    width: 162px;
    height: 58px;
    background-repeat: no-repeat;
    background-position: center center;
  }
  .logo-small {
    width: 39px;
    height: 58px;
    background-repeat: no-repeat;
    background-position: center center;
  }
  .invisible-input {
    display: none;
  }
  .logo-selector{
    margin: -8px;
  }
  .v-input--selection-controls{
    margin-top: 40px;
  }
  .v-color-picker{
    overflow: hidden;
  }
  @media (max-width: 1440px) {
    .logo-selector>div{
      max-width: 70% !important;
      flex: 0 0 70%;
    }
  }
  @media (max-width: 1024px) {
    .logo-selector>div{
      max-width: 100% !important;
      flex: 0 0 100%;
    }
  }
</style>