<template>
  <div>
    <v-dialog v-model="dialog" width="413" scrollable>
      <v-card id="locationEdit">
        <v-card-title v-if="modalMode === 'create'" class="secondary">{{$t('add-location')}}</v-card-title>
        <v-card-title v-if="modalMode === 'edit'" class="secondary">{{$t('edit-location')}}</v-card-title>
        <v-card-text  ref="locationCard" class="pb-0 card-text-loc">
          <v-form @submit.stop.prevent id="locationEditForm">
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
                  :label="'Sub Name'"
                  :dense="true"
                  v-model="form.subName"
                  outlined
                  color="secondary"
                ></v-text-field>
                <!-- mac address -->
                <v-text-field
                  :label="$t('devices-page-device-mac-address-required')"
                  v-model="form.macAddress"
                  @keyup="formatMacAddress"
                  maxlength="17"
                  :dense="true"
                  :error-messages="macAddressErrors"
                  :disabled="modalMode === 'edit'"
                  outlined
                  required
                  color="secondary"
                  @change="$v.form.macAddress.$touch()"
                ></v-text-field>
                <v-select
                  :clearable="true"
                  :items="areas"
                  :item-text="areaItemText"
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
        <v-card-actions class="py-0">
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
              @click="closeModal"
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
import { PREFIXES } from '../../constants/prefixes'
import { macAddressValidator } from '../../mixins/macAddressValidator';

export default {
  components: {
    DeviceImagesForm,
  },
  data() {
    return {
      dialog: false,
      addAnother: false,
      hasChanges: false,
      prefixes: [],
      currentLocation: null,
      prevImagesData: null,
      newImagesData: null,
      form: {
        name: '',
        area: '',
        prefix: null,
        subName: '',
        macAddress: ''
      },
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      name: {
        required
      },
      macAddress: {
        required,
        minLength: minLength(17),
      },
    },
  },
  props: ['modalMode', 'area', 'areas'],
  computed: {
    ...mapGetters('layout', ['getIsMobile',]),
    ...mapGetters('site', ['currentSiteId',]),
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
    areaItemText(){
      return (this.areas && this.areas.length > 0 && this.areas[0].name) ? 'name' : 'value';
    }
  },
  methods: {
    ...mapActions('location', ['createLocation','editLocation',]),
    async openModal(location) {
      this.prefixes = PREFIXES;
      this.dialog = true;
      this.hasChanges = false;
      if (location) {
        this.currentLocation = location;
        Object.assign(this.form, {
          name: location.name,
          area: location.areaId,
          macAddress: macAddressValidator.computed.formatMacAddress(
          location.macAddress
          ),
        });
        this.prevImagesData = {
          installationImageID: location.installationPictureId,
          locationImageID: location.locationPictureId,
          otherImageID: location.otherPictureId,
        }
      } else {
        Object.assign(this.form, {
          name: '', 
          area: '',
          macAddress: '',
          prefix: this.prefixes[0].id
        });
        this.prevImagesData = null;
      }
      this.$refs.deviceImagesForm?.reset();
    },
    closeModal() {
      this.$v.form.$reset();
      Object.assign(this.form, {
        name: '',
      });
      if (this.hasChanges) {
        this.$emit('changeOnLocations');
      }
      this.dialog = false;
    },
    setPrefix() {
      this.form.name = this.form.prefix;
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
        this.editLocationFn();
      } else if (this.modalMode === 'create') {
        this.createLocationFn();
      }
    },
    async editLocationFn() {
      if (this.modalMode === 'edit' && this.currentLocation) {
        const location = {
          name: this.form.name,
          areaId: this.form.area ? this.form.area : null,
          siteId: this.area?.site?.id || this.currentSiteId,
          ...this.newImagesData,
        };
        const locationId = this.currentLocation.id;
        try {
          let resp = await this.editLocation({locationId, location})
          this.$toasted.show(this.$t('location-edited'), {
              position: 'bottom-right',
              className: ['toast-success'],
              duration: 2000,
            });
            this.$emit('changeOnLocations', this.currentLocation);
            this.closeModal();
        } catch (error) {
          this.$toasted.show(error, {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });
        }
      }
    },
    async createLocationFn() {
      if (this.modalMode === 'create') {
        let completeName = this.form.subName ? this.form.name + '@' + this.form.subName : this.form.name;
        const location = {
          name: completeName,
          areaId: this.form.area ? this.form.area : null,
          macAddress: this.form.macAddress.replace(/\s/g, ''),
          siteId: this.area?.site?.id || this.currentSiteId,
          properties: {
            ...this.newImagesData,
          }
        };
        try {
          const resp = await this.createLocation( location )
            this.$toasted.show(this.$t('location-created'), {
              position: 'bottom-right',
              className: ['toast-success'],
              duration: 2000,
            });
            if (this.addAnother) {
              this.hasChanges = true;
              this.form.macAddress = '';              
              this.form.subName = '';   
              this.form.name = this.form.prefix;
              this.$v.form.$reset();
            }else{
              this.$emit('changeOnLocations');
              this.closeModal();
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
#locationEditForm {
  padding-top: 2rem;
}
.card-text-loc {
  scroll-behavior: smooth;
}

</style>