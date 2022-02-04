<template>
  <div>
    <v-dialog v-model="dialog" @click:outside="closeModal" @keydown.esc="closeModal" width="70vw" scrollable>
      <v-card id="indoorAreaCreate">
        <v-btn color="seondary" text fab x-small dark class="float-right mt-1 mr-1 close-btn" title="close" @click="closeModal">
            <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-title class="secondary">
          <div>
            {{$t('area-name')}}:
            <b>{{area.name}}</b>
          </div>
          <div class="ml-2">
            | {{$t('site')}}:
            <b>{{area.site.value}}</b>
          </div>
        </v-card-title>
        <v-card-text>
          <div
            ref="dragZone"
            @drop.prevent="dropFile"
            @dragover.prevent="dragOver"
            @dragleave.prevent="dragEnd"
            class="uploadimage-dragndrop"
            id="dragnDropImage"
          >
            <v-row v-if="notDraggedOver">
              <v-col>
                <div class="upload-container">
                  <v-icon class="upload-icon d-inline-block" key="0" v-text="'mdi-upload'"></v-icon>
                  <div class="d-inline-block">
                    <div class="uploadimage-text center-content">{{$t('drag-drop-browse-png')}}</div>
                    <v-btn
                      @click="onBrowseClick"
                      outlined
                      text
                      color="secondary"
                      tabindex="3"
                      class="px-8 mt-3 center-content btn-outlined-secondary"
                    >{{$t('devices-page-browse')}}</v-btn>
                    <input
                      ref="uploadPngInput"
                      value="csvUpload"
                      @change="onInputChange"
                      id="upload-input"
                      hidden
                      name="uploadFiles"
                      type="file"
                      accept=".png"
                    />
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <div v-if="imageSrc" class="uploaded-img-cont mt-4">
          <img class="uploaded-img" :src="imageSrc" alt />
        </div>
        <v-card-text class="invalid-file mt-4" v-if="displayInvalidFile">{{$t('not-valid-png')}}</v-card-text>
        <v-card-actions>
          <v-col cols="12">
            <v-btn
              id="areaUploadImageBtn"
              depressed
              color="secondary"
              tabindex="2"
              @click="addImage"
              class="px-8 float-right"
            ><span v-if="area.areaType === 'airfinder3'">{{$t('next')}}</span><span v-else>{{$t('save')}}</span></v-btn>
            <v-btn
              v-if="backBtn"
              text
              id="areaUploadImageBtnCancel"
              color="secondary"
              tabindex="3"
              @click="onBackHandle"
              class="px-8 float-right mr-2"
            >{{$t('back')}}</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <FloorPlanData ref="floorPlanData"/>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import FileService from '../../services/file';
import FloorPlanData from './floor-plan-data';
const AF3 = 'airfinder3';
export default {
  data() {
    return {
      modalMode: 'create',
      dialog: false,
      notDraggedOver: true,
      imageSrc: '',
      file: null,
      displayInvalidFile: false
    };
  },
  components: {
    FloorPlanData
  },
  props: ['area', 'backBtn'],
  methods: {
    ...mapActions('area', ['createAreaIndoorMapping', 'getAreaIndoorFile', 'editAreaIndoorMapping']),
    async openModal(area) {
      this.imageSrc = null;
      if (area) {
        try {
          const indoorMapImage = await this.getAreaIndoorFile({ areaId: this.area.id });
          this.modalMode = 'edit'
          this.imageSrc = indoorMapImage.file[0].preview;
        } catch (error) {
          throw error;
        }
      }
      this.displayInvalidFile = false;
      this.dialog = true;
      this.$nextTick(()=>{
        this.$refs.uploadPngInput.value = null;
      })
    },
    onInputChange(ev) {
      const file = ev.target.files[0]; 
      if (file) {
        this.setFile(file);
      }
    },
    setFile(file) {
      if (file.type === 'image/png' && file.size < 5242880) {
        this.file = file;
        this.displayInvalidFile = false;
        let fr = new FileReader();
        let self = this;
        fr.onload = function() {
          self.imageSrc = fr.result;
        };
        fr.readAsDataURL(file);
      } else {
        this.displayInvalidFile = true;
        this.imageSrc = '';
      }
    },
    onBrowseClick() {
      this.$refs.uploadPngInput.click();
    },
    dropFile(e) {
      this.dragEnd();
      if (e.dataTransfer.files[0]) {
        this.setFile(e.dataTransfer.files[0]);
      }
    },
    dragOver() {
      this.notDraggedOver = false;
      this.$refs.dragZone.classList.add('being-drag-over');
    },
    dragEnd() {
      this.notDraggedOver = true;
      this.$refs.dragZone.classList.remove('being-drag-over');
    },
    closeModal() {
      this.file = null;
      this.displayInvalidFile = false;
      this.dialog = false;
      this.$refs.uploadPngInput.value = null;
      this.modalMode = 'create';
    },
    onBackHandle() {
      this.$emit('onBackHandler', this.area);
      this.closeModal();
    },
    async addImage() {
      if (this.file) {
        let acc = {
          accountId: this.area.site.assetInfo.metadata.props.accountId,
          href: this.area.site.account.href,
        };
        this.$set(this.file, 'account', acc);
        try {
          const resp = await FileService.createFile(this.file);
          if (this.modalMode === 'create') {
            this.createAreaHandler(resp);
          } else {
            this.editAreaHandler(resp);
          }
        } catch (e) {
          throw new Error(this.$t('something-went-wrong'), e);
        }
      }
    },
    async createAreaHandler(file) {  
      let params = {
        area: this.area,
        file: file
      }
      try {
        let resp = await this.createAreaIndoorMapping(params);
        this.$toasted.show(this.$t('area-created'), {
          position: 'bottom-right',
          className: ['toast-success'],
          duration: 2000,
        });
        if (this.area.areaType === AF3) {
          this.area.id = resp.id;
          this.$refs.floorPlanData.openModal(this.area);
        }
        this.dialog = false;
        this.$emit('areaCreatedEdited', resp)
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
      }
    },
    async editAreaHandler(file) {  
      let params = {
        area: this.area,
        file: file
      }
      try {
        let resp = await this.editAreaIndoorMapping(params);
        this.$toasted.show(this.$t('area-edited'), {
          position: 'bottom-right',
          className: ['toast-success'],
          duration: 2000,
        });
        if (this.area.areaType === AF3) {
          this.area.id = resp.id;
          this.$refs.floorPlanData.openModal(this.area);
        }
        this.dialog = false;
        this.modalMode = 'create';
        this.$emit('areaCreatedEdited', resp)
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
      }
    }
  },
};
</script>

<style scoped>
.v-dialog {
  overflow-x: hidden;
}
.upload-container {
  text-align: center;
}
.uploadimage-dragndrop {
  width: 100%;
  height: 12rem;
  border-style: dashed;
  border-width: 2px;
  margin-top: 20px;
  background-color: rgb(241, 243, 244);
  padding-top: 2.5rem;
}
.being-drag-over {
  background-color: var(--v-primaryLight-base);
  cursor: pointer;
}
.upload-icon {
  font-size: 80px;
  color: var(--v-secondary-base);
  text-align: center;
  bottom: 13px;
  right: 5px;
}
.uploadimage-text {
  color: var(--v-secondary-base);
  text-align: center;
}
.invalid-file {
  color: var(--v-error-base) !important;
}
.uploaded-img {
  max-height: 50vh;
}
.uploaded-img-cont {
  margin: auto;
}
.close-btn {
  position: absolute;
  right: 0;
}
</style>