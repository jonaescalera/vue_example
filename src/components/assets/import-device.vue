<template>
  <div>
    <v-dialog @click:outside="closeModal" @keydown.esc="closeModal" class="customDialog" v-model="dialog" width="70vw">
      <v-card>
        <v-card-title class="secondary">{{
          modalTitle || $t('devices-page-import-devices')
        }}</v-card-title>
        <div class="modal-close" @click="closeModal">X</div>
        <v-card-text>
          <div
            ref="dragZone"
            @drop.prevent="dropFile"
            @dragover.prevent="dragOver"
            @dragleave.prevent="dragEnd"
            class="uploadimage-dragndrop"
            id="dragndropimage"
          >
            <v-row v-if="notDraggedOver">
              <v-col>
                <div class="upload-container">
                  <v-icon
                    class="upload-icon d-inline-block"
                    key="0"
                    v-text="'mdi-upload'"
                  ></v-icon>
                  <div class="d-inline-block">
                    <div class="uploadimage-text center-content">
                      {{ $t('devices-page-drag-drop-browse') }}
                    </div>
                    <v-btn
                      @click="onBrowseClick"
                      outlined
                      text
                      color="secondary"
                      tabindex="3"
                      class="px-8 mt-3 center-content btn-outlined-secondary"
                      >{{ $t('devices-page-browse') }}</v-btn
                    >
                    <input
                      ref="uploadCsvInput"
                      value="csvUpload"
                      @change="onInputChange"
                      id="upload-input"
                      hidden
                      name="uploadFiles"
                      type="file"
                      accept=".csv"
                    />
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <v-card-text class="invalid-csv" v-if="displayInvalidCsv">{{
          $t('devices-page-not-valid-csv')
        }}</v-card-text>
        <v-divider></v-divider>
        <data-table 
          v-if="csvData" 
          class="devices-table" 
          name="importDevice"
          :settings="settings" 
          :columns="columns" 
          :rows="csvData" 
          :maxHeight="'250px'"> 
        </data-table>
        <v-card-actions>
          <v-col cols="12">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon
                  v-on="on"
                  class="info-csv-icon float-left"
                  v-text="'mdi-alert-circle'"
                ></v-icon>
              </template>
              <span v-if="idType !== nodeAddress">{{ $t('devices-page-info-csv') }}</span>
              <span v-else>{{ $t('devices-page-info-csv-gateway') }}</span>
            </v-tooltip>
            <v-btn
              outlined
              text
              color="secondary"
              class="px-8 float-left btn-outlined-secondary"
              @click="downloadTemplate"
              >{{ $t('devices-page-download-csv-template') }}</v-btn
            >
            <v-btn
              @click="completeImport"
              depressed
              color="secondary"
              class="float-right"
              >{{ $t('devices-page-complete-import') }}</v-btn
            >
            <v-btn
              @click="closeModal"
              text
              color="secondary"
              class="float-right mr-3"
              >{{ $t('devices-page-info-cancel') }}</v-btn
            >
          </v-col>
        </v-card-actions>
      </v-card>
      <ErrorDetail ref="errorDetail"/>
    </v-dialog>
  </div>
</template>

<script>
import DataTable from '../shared/data-table/data-table';
import i18n from '../../i18n';
import { mapGetters, mapActions } from 'vuex';
import { csvMixin } from '../../mixins/csvExport';
import idConstants from '../../constants/id-types';
import ErrorDetail from './import-devices-error-detail'

export default {
  mixins: [csvMixin],
  components: {
    'data-table': DataTable,
    ErrorDetail
  },
  props: ['modalTitle', 'uploadFn', 'siteId', 'idType'],
  data() {
    return {
      dialog: false,
      csvData: null,
      displayInvalidCsv: false,
      notDraggedOver: true,
      columns: [],
      nodeAddress: idConstants.NODE_ADDRESS,
      settings: {
        actionsPanel: false,
        noPagination: true,
      },
      csvFile: null,
    };
  },
  computed: {
    ...mapGetters('site', ['currentSiteId']),
  },
  watch: {
    idType(type) {
      this.setColumns(type);
    }
  },
  methods: {
    ...mapActions('asset', ['bulkUpload']),
    openModal() {
      this.dialog = true;
      this.setColumns(this.idType);
    },
    closeModal() {
      this.columns = [];
      this.displayInvalidCsv = false;
      this.csvFile = null;
      this.csvData = null;
      this.$refs.uploadCsvInput.value = '';
      this.dialog = false;
    },
    onInputChange(ev) {
      const file = ev.target.files[0];
      if (file) {
        this.setFile(file);
      } else {
        this.displayInvalidCsv = true;
      } 
    },
    setColumns(type) {
      if (type === idConstants.NODE_ADDRESS) {
        this.columns = [
          {
            name: i18n.t('devices-page-name'),
            field: 'name', 
            type: 'data',
          },
          {
            name: i18n.t('id'),
            field: 'node_address',
            type: 'data',
          }
        ]
      } else {
        this.columns = [
          {
            name: i18n.t('devices-page-name'),
            field: 'name',
            type: 'data',
          },
          {
            name: i18n.t('devices-page-mcid'),
            field: 'mac_address',
            type: 'data',
          }
        ]
      }
    },
    onBrowseClick() {
      this.$refs.uploadCsvInput.click();
    },
    setFile(file) {
      this.csvData = null;
      this.displayInvalidCsv = false;
      const reader = new FileReader();
      reader.onload = (e) => {
        let data = null;
        if (this.idType === this.nodeAddress) {
          data = csvMixin.methods.createJSONForImportGateways(e.target.result);
        }else{
          data = csvMixin.methods.createJSONForImportDevices(e.target.result);
        }
        if (data) {
          this.csvData = data;
          this.csvFile = file;
        } else {
          this.displayInvalidCsv = true;
          this.csvFile = null;
        }
      };
      reader.readAsText(file);
    },
    async completeImport() {
      if (!this.displayInvalidCsv && this.csvFile) {
        const formData = new FormData();
        formData.append('file', this.csvFile);
        try {
          let resp = null;
          if (this.uploadFn) {
            resp = await this.uploadFn({
              siteId: this.siteId || this.currentSiteId,
              formData: formData,
            });
          } else {
            resp = await this.bulkUpload({
              siteId: this.currentSiteId,
              formData: formData,
            });
            // Tags bulk upload to return the success response without errorcount and successcount
            this.$toasted.show(this.$t('devices-page-success-bulk-email'), {
              position: 'bottom-right',
              className: ['toast-success'],
              duration: 2000,
            });
          }
          this.dialog = false;
          this.csvFile = null;
          this.csvData = null;
          this.closeModal();
          if (resp.errorCount > 0) {
            this.$refs.errorDetail.openModal(resp.errors);            
          }
          if (resp.successCount > 0) {
            this.$emit('finished');
            this.$toasted.show(
              this.$t('devices-page-success-bulk') + resp.successCount,
              {
                position: 'bottom-right',
                className: ['toast-success'],
                duration: 2000
              }
            );
          }
        } catch (error) {
          this.$toasted.show(error, {
            position: 'bottom-right',
            className: ['toast-error'],
            action: {
              text: this.$t('devices-page-ok'),
              onClick: (e, toastObject) => {
                toastObject.goAway(0);
              },
            },
          });
        }
      }
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
    downloadTemplate() {
      if (this.idType === this.nodeAddress) {
        csvMixin.methods.csvExport(
        [{ name: 'Gateway01', node_address: '$101$0-0-0-db96e5a6f' }],
        'Template'
        );  
      } else {
        csvMixin.methods.csvExport(
        [{ name: 'primis', mac_address: 'af:02:c5:26:77:12' }],
        'Template'
        );
      }
    },
  },
};
</script>
<style scoped>
.modal-close {
  position: absolute;
  right: 20px;
  font-weight: bold;
  top: 15px;
  color: #fff;
  cursor: pointer;
  font-size: larger;
}
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
.info-csv-icon {
  font-size: 40px;
  color: var(--v-secondary-base);
  text-align: center;
  margin-right: 20px;
  cursor: pointer;
}
.uploadimage-text {
  color: var(--v-secondary-base);
  text-align: center;
}
.devices-table {
  height: inherit;
}
.invalid-csv {
  color: var(--v-error-base) !important;
}
</style>
