<template>
  <div>
    <div>
      <label>{{ $t('installation-image') }}</label>
      <div class="mb-3 image-controls">
        <input ref="installationImageUpload" @change="imageSelected($event, 'installationImage')" class="invisible-input" type="file">
        <v-btn @click="$refs.installationImageUpload.click()" small color="primaryLight"><v-icon class="mr-1" small v-text="'mdi-cloud-upload'"></v-icon>{{ $t('upload') }}</v-btn>
        <template v-if="installationImage || (this.prevImages && this.prevImages.installationImageID)">
          <v-btn small @click="openModal('installationImage')" color="primaryLight">{{ $t('view-image') }}</v-btn>
          <v-btn small @click="removeImage('installationImage')" color="primaryLight">{{ $t('remove-image') }}</v-btn>
        </template>
      </div>
    </div>
    <div>
      <label>{{ $t('location-image') }}</label>
      <div class="mb-3 image-controls">
        <input ref="locationImageUpload" @change="imageSelected($event, 'locationImage')" class="invisible-input" type="file">
        <v-btn @click="$refs.locationImageUpload.click()" small color="primaryLight"><v-icon class="mr-1" small v-text="'mdi-cloud-upload'"></v-icon>{{ $t('upload') }}</v-btn>
        <template v-if="locationImage || (this.prevImages && this.prevImages.locationImageID)">
          <v-btn small @click="openModal('locationImage')" color="primaryLight">{{ $t('view-image') }}</v-btn>
          <v-btn small @click="removeImage('locationImage')" color="primaryLight">{{ $t('remove-image') }}</v-btn>
        </template>
      </div>
    </div>
    <div>
      <label>{{ $t('other-image') }}</label>
      <div class="mb-3 image-controls">
        <input ref="otherImageUpload" @change="imageSelected($event, 'otherImage')" class="invisible-input" type="file">
        <v-btn @click="$refs.otherImageUpload.click()" small color="primaryLight"><v-icon class="mr-1" small v-text="'mdi-cloud-upload'"></v-icon>{{ $t('upload') }}</v-btn>
        <template v-if="otherImage || (this.prevImages && this.prevImages.otherImageID)">
          <v-btn small @click="openModal('otherImage')" color="primaryLight">{{ $t('view-image') }}</v-btn>
          <v-btn small @click="removeImage('otherImage')" color="primaryLight">{{ $t('remove-image') }}</v-btn>
        </template>
      </div>
    </div>

    <v-dialog v-model="imageViewDialog" @click:outside="closeModal" @keydown.esc="closeModal" max-width="95vw" scrollable>
      <v-card id="indoorAreaCreate">
        <v-btn color="seondary" text fab x-small dark class="float-right mt-1 mr-1 close-btn" title="close" @click="closeModal">
            <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-title class="secondary">
          <div> {{ viewedImageTitle }} </div>
        </v-card-title>
        <div v-if="viewedImage || downloadedImage" class="img-cont mt-4">
          <img class="uploaded-img" :src="viewedImage || downloadedImage" alt />
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FileService from '../../services/file';
import {fileNameLimit, deviceImagesAllowedTypes} from '../../constants/theme';

export default {
  data() {
    return {
      installationImagePreview: null,
      locationImagePreview: null,
      otherImagePreview: null,
      installationImage: null,
      locationImage: null,
      otherImage: null,
      imageViewDialog: false,
      viewedImageType: null,
      downloadedImage: null,
    };
  },
  props: ['prevImages'],
  computed: {
    ...mapGetters('site', ['currentSite']),
    viewedImage() {
      return this.viewedImageType && this[this.viewedImageType + 'Preview'];
    },
    viewedImageTitle() {
      switch(this.viewedImageType) {
        case 'installationImage':
          return this.$t('installation-image');
        case 'locationImage':
          return this.$t('location-image');
        case 'otherImage':
          return this.$t('other-image');
        default:
          return this.$t('view-image');
      }
    },
  },
  methods: {
    imageSelected(event, imageType) {
      let invalidType = false;
      if (event.target.files[0]) {
        let type = event.target.files[0].type;
        let name = event.target.files[0].name;
        if(name.length > fileNameLimit){
          this.$toasted.show(this.$t('theming-page-error-name'), { 
            position: "bottom-right",
            className: ['toast-error'], 
            duration : 5000
          });
          this.removeImage(imageType);
        }
        if(deviceImagesAllowedTypes.includes(type)) {
          const file = event.target.files[0];
          this.removeImage(imageType);
          this[imageType] = file;
          this[imageType + 'Preview'] = URL.createObjectURL(this[imageType]);
        }else{
          invalidType = true;
        }
        

        if(invalidType){
          this.removeImage(imageType);
          this.$toasted.show(this.$t('theming-page-error-file-type'), { 
            position: "bottom-right",
            className: ['toast-error'], 
            duration : 5000
          });
        }
      }
    },
    async uploadImages() {
      const imageUploadResponses = await Promise.all([
        this.uploadSingleImage('installationImage'),
        this.uploadSingleImage('locationImage'),
        this.uploadSingleImage('otherImage'),
      ]);
      const imageIDs = imageUploadResponses.map((response) => response && response.id);
      const newImages = {
        installationImageID: imageIDs[0],
        locationImageID: imageIDs[1],
        otherImageID: imageIDs[2],
      };
      this.emitData(newImages);
    },
    emitData(newImages) {
      this.$emit("imagesUploaded", {
        installationImageID: newImages?.installationImageID || this.prevImages?.installationImageID || null,
        locationImageID: newImages?.locationImageID || this.prevImages?.locationImageID || null,
        otherImageID: newImages?.otherImageID || this.prevImages?.otherImageID || null,
      });
    },
    async uploadSingleImage(imageType) {
      if (this[imageType]) {
        let acc = {
          accountId: this.currentSite.assetInfo.metadata.props.accountId,
          href: this.currentSite.account.href,
        };
        this.$set(this[imageType], 'account', acc);
        try {
          const resp = await FileService.createFile(this[imageType]);
          return resp;
        } catch (e) {
          throw new Error(this.$t('something-went-wrong'), e);
        }
      }
    },
    removeImage(imageType) {
      this[imageType] = null;
      const idField = imageType + 'ID';
      if (this.prevImages) {
        this.prevImages[idField] = null;
      }
      this[imageType + 'Preview'] = null;
      this.$refs[imageType + 'Upload'].value = null;
    },
    async openModal(imageType) {
      this.viewedImageType = imageType;
      const prevImageID = this.prevImages && this.prevImages[imageType + 'ID'];
      if (!this[imageType + 'Preview'] && prevImageID) {
        const fileResp = await FileService.getFileById(prevImageID);
        this.downloadedImage = fileResp.preview;
      }
      this.imageViewDialog = true;
    },
    closeModal() {
      this.imageViewDialog = false;
      this.viewedImageType = null;
      this.downloadedImage = null;
    },
    reset() {
      this.installationImagePreview = null;
      this.locationImagePreview = null;
      this.otherImagePreview = null;
      this.installationImage = null;
      this.locationImage = null;
      this.otherImage = null;
      this.imageViewDialog = false;
      this.viewedImageType = null;
      this.downloadedImage = null;
    },
  },
};
</script>
<style lang="scss" scoped>
.invisible-input {
  display: none;
}
.logo-small {
  width: 200px;
  background-repeat: no-repeat;
  background-position: center center;
}
.img-cont {
  margin: auto;
}
.uploaded-img {
  max-width: 100%;
  max-height: 80vh;
}
.close-btn {
  position: absolute;
  right: 0;
}
.image-controls  {
  button {
    display: block;
  }
  button + button {
    margin-top: 8px;
  }
}
</style>