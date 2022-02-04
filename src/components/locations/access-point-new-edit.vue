<template>
  <div>
    <v-dialog v-model="dialog" width="413" scrollable>
      <v-card id="accessPointEdit">
        <v-card-title v-if="modalMode === 'create'" class="secondary">{{$t('add-access-point')}}</v-card-title>
        <v-card-title v-if="modalMode === 'edit'" class="secondary">{{$t('edit-access-point')}}</v-card-title>
        <v-card-text>
          <v-form @submit.stop.prevent id="accessPointEditForm">
            <v-row justify="center">
              <v-col cols="11">
                <v-select
                  v-if="modalMode === 'create'"
                  :clearable="true"
                  :items="prefixes"
                  item-text="value"
                  item-value="id"                  
                  :label="$t('prefix')"
                  :dense="true"
                  @change="setPrefix"
                  v-model="form.prefix"
                  outlined
                  color="secondary"
                ></v-select>
                <!-- name -->
                <v-text-field
                  :label="$t('name-required')"
                  tabindex="1"
                  :dense="true"
                  v-model="form.name"
                  outlined
                  :error-messages="nameErrors"
                  @input="$v.form.name.$touch()"
                  @blur="$v.form.name.$touch()"
                  color="secondary"
                ></v-text-field>
                 <!-- sub-name -->
                <v-text-field
                  v-if="modalMode === 'create'"
                  :label="$t('sub-name')"
                  :dense="true"
                  v-model="form.subName"
                  outlined
                  color="secondary"
                ></v-text-field>
                <!-- mac address -->
                <v-text-field
                  :label="$t('devices-page-device-mac-address-required')"
                  tabindex="2"
                  v-model="form.macAddress"
                  @keyup="formatMacAddress" 
                  maxlength="17"
                  :dense="true"
                  :error-messages="macAddressErrors"
                  
                  outlined
                  required
                  color="secondary"
                  @change="$v.form.macAddress.$touch()"
                ></v-text-field>
                <!-- Partial functionality, admin site has this UI but does not send any extra parameter to the backend 
                this is functional now if uncoment. Once the backend supports access point type, we can uncoment-->
                <!-- <v-select
                  v-model="form.type"
                  :items="accessPointsTypes"
                  :clearable="false"
                  item-text="value"
                  item-value="id"
                  :label="$t('access-point-type')"
                  tabindex="3"
                  :dense="true"
                  outlined
                  color="secondary"
                ></v-select> --> 
                 <v-select
                  :clearable="true"
                  :items="areas"
                  item-text="value"
                  item-value="id"
                  :label="$t('area')"
                  :dense="true"
                  v-model="form.area"
                  outlined
                  color="secondary"
                ></v-select>
                <DeviceImagesForm
                  ref="deviceImagesForm"
                  :prevImages="prevImagesData"
                  v-on:imagesUploaded="onImagesUpload"
                />
                <v-checkbox
                  v-if="modalMode === 'create'"
                  v-model="addAnother"
                  id="addAnother"
                  class="d-inline-block mt-1"
                  color="primary"
                  :label="$t('add-another')"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-col cols="12">
            <v-btn
              v-if="modalMode === 'edit'"
              depressed
              color="secondary"
              tabindex="3"
              @click="submitForm"
              class="px-8 float-right"
            >{{$t('save')}}</v-btn>
            <v-btn
              v-if="modalMode === 'create'"
              depressed
              color="secondary"
              tabindex="3"
              @click="submitForm"
              class="px-8 float-right"
            >{{$t('add')}}</v-btn>
            <v-btn
              text
              color="secondary"
              tabindex="3"
              @click="resetForm(false)"
              class="px-8 mr-2 float-right"
            >{{$t('cancel')}}</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { mapActions, mapGetters } from 'vuex';
import DeviceImagesForm from './device-images-form';
import { macAddressValidator } from '../../mixins/macAddressValidator';
import { PREFIXES } from '../../constants/prefixes';

export default {
  components: {
    DeviceImagesForm,
  },
  data() {
    return {
      dialog: false,
      addAnother: false,
      prefixes: PREFIXES,
      currentAccessPoint: null,
      prevImagesData: null,
      newImagesData: null,
      form: {
        name: '',
        type: 'v1Slap',
        macAddress: '',
      },
      accessPointsTypes: [
        {
          id: 'v1Slap',
          value: 'v1 SLAP (Default)',
        },
        {
          id: 'symbleAP',
          value: 'Access Point OG',
        },
        {
          id: 'symbleRPi',
          value: 'Raspberry Pi (No)',
        }
      ]
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      prefix: '',
      name: {
        required,
      },
      subName: '',
      macAddress: {
        required,
        minLength: minLength(17),
      },
      area: ''
    },
  },
  props: ['modalMode', 'area'],
  computed: {
    ...mapGetters('area', ['areas']),
    ...mapGetters('site', ['currentSiteId']),
    nameErrors() {
      const errors = [];
      if (!this.$v.form.name.$dirty) return errors;
      !this.$v.form.name.required &&
        errors.push(this.$t('error-name-required'));
      return errors;
    },
    macAddressErrors() {
      const errors = [];
      if (!this.$v.form.macAddress.$dirty) return errors;
      !this.$v.form.macAddress.required &&
        errors.push(this.$t('devices-error-mac-address-required'));
      !this.$v.form.macAddress.minLength &&
        errors.push(this.$t('devices-error-mac-address-min-length'));
      return errors;
    },
  },
  methods: {
    ...mapActions('accessPoint', ['createAccessPoint', 'editAccessPoint', 'replaceAccessPoint']),
    openModal(accessPoint) {
      this.dialog = true;
      if (accessPoint) {
        this.currentAccessPoint = accessPoint;
        Object.assign(this.form, {
          name: accessPoint.value,
          macAddress: macAddressValidator.computed.formatMacAddress(
            accessPoint.macAddress
          ),
          area: accessPoint.areaId
        });
        this.prevImagesData = {
          installationImageID: accessPoint.installationPictureId,
          locationImageID: accessPoint.locationPictureId,
          otherImageID: accessPoint.otherPictureId,
        };
      } else {
        Object.assign(this.form, {
          name: '',
          macAddress: '',
          type: 'v1Slap',
          area: '',
          prefix: this.prefixes[0].id
        });
        this.prevImagesData = null;
      }
      this.$refs.deviceImagesForm?.reset();
    },
    setPrefix() {
      this.form.name = this.form.prefix;
    },
    resetForm(keepDialog) {
      this.$v.form.$reset();
      Object.assign(this.form, {
        prefix: keepDialog ? this.form.prefix : '',
        name: keepDialog ? this.form.prefix : '',
        subName: '',
        macAddress: '',
        area: '',
        type: 'v1Slap',
      });
      this.addAnother = keepDialog ? this.addAnother : false;
      this.dialog = keepDialog ? keepDialog : false;
    },
    formatMacAddress() {
      this.$set(
        this.form,
        'macAddress',
        macAddressValidator.computed.formatMacAddress(this.form.macAddress)
      );
    },
    submitForm() {
      this.$v.$touch();
      if (!this.$v.form.$anyError) {
        this.$refs.deviceImagesForm.uploadImages();
      }
    },
    onImagesUpload(data) {
      this.newImagesData = {
        installationPictureId: data.installationImageID,
        locationPictureId: data.locationImageID,
        otherPictureId: data.otherImageID,
      };
      if (this.modalMode === 'edit') {
        this.editAccessPointFn();
      } else if (this.modalMode === 'create') {
        this.createAccessPointFn();
      }
    },
    async editAccessPointFn() {
      this.$v.$touch();
      if (this.modalMode === 'edit') {
        const accessPoint = {
          name: this.form.name,
          siteId: this.area.site.id || this.currentSiteId,
          areaId: this.form.area ? this.form.area : null,
          ...this.newImagesData,
        };
        const accessPointId = this.currentAccessPoint.id;
        try {
          if (
            this.currentAccessPoint.macAddress === this.form.macAddress.replace(/\s/g, '')
          ) {
            await this.editAccessPoint({ accessPointId, accessPoint });
          } else {
            accessPoint.macAddress = this.form.macAddress.replace(/\s/g, '');
            await this.replaceAccessPoint({ accessPointId, accessPoint });
          }
          this.$toasted.show(this.$t('access-point-edited'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          this.$emit('changeOnAccessPoints');
          this.resetForm();
        } catch (error) {
          this.$toasted.show(error, {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });
        }
      }
    },
    async createAccessPointFn() {
      this.$v.$touch();
      if (this.modalMode === 'create') {
        let completeName = this.form.subName ? this.form.name + '@' + this.form.subName : this.form.name;
        const accessPoint = {
          name: completeName,
          macAddress: this.form.macAddress.replace(/\s/g, ''),
          siteId: this.area?.site?.id || this.currentSiteId,
          areaId: this.form.area ? this.form.area : null,
          properties: {
            ...this.newImagesData,
          },
        };
        try {
          await this.createAccessPoint(accessPoint);
          this.$toasted.show(this.$t('access-point-created'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          if (this.addAnother) {
              this.resetForm(true);
            }else{
              this.$emit('changeOnAccessPoints');
              this.resetForm();
            }
        } catch (error) {
          this.$toasted.show(error, {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });
        }
      }
    },
  },
};
</script>
<style scoped>
#accessPointEditForm {
  padding-top: 2rem;
}
</style>