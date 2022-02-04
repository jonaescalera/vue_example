<template>
  <div>
    <v-dialog @click:outside="closeModal" @keydown.esc="closeModal" v-model="dialog" width="413" scrollable>
      <v-card id="gatewayEdit">
        <v-card-title v-if="modalMode === 'create'" class="secondary">{{$t('add-gateway')}}</v-card-title>
        <v-card-title v-if="modalMode === 'edit'" class="secondary">{{$t('edit-gateway')}}</v-card-title>
        <v-card-text>
          <v-form @submit.stop.prevent id="gatewayEditForm">
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
                <!-- id -->
                <v-text-field
                  :label="$t('id-required')"
                  tabindex="2"
                  :dense="true"
                  v-model="form.id"
                  outlined
                  :disabled="modalMode === 'edit'"
                  :error-messages="idErrors"
                  @blur="$v.form.id.$touch()"
                  color="secondary"
                  :placeholder="$t('example-id')"
                ></v-text-field>
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
      currentGateway: null,
      prevImagesData: null,
      newImagesData: null,
      form: {
        name: '',
        id: ''
      },
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      prefix: '',
      name: {
        required
      },
      subName: '',
      id: {
        required,
        minLength: minLength(12),
      },
    },
  },
  props: ['modalMode', 'area'],
  computed: {
    ...mapGetters('area', ['areas']),
    ...mapGetters('site', ['currentSiteId',]),
    nameErrors() {
      const errors = [];
      if (!this.$v.form.name.$dirty) return errors;
      !this.$v.form.name.required &&
        errors.push(this.$t('error-name-required'));
      return errors;
    },
    idErrors() {
      const errors = [];
      if (!this.$v.form.id.$dirty) return errors;
      !this.$v.form.id.required &&
        errors.push(this.$t('error-id-required'));
      this.$v.form.id.$dirty && !this.$v.form.id.minLength && 
        errors.push(this.$t('gateway-id-min-length'));
      return errors;
    },
  },
  methods: {
    ...mapActions('gateway', ['createGateway','editGateway',]),
    openModal(gateway) {      
      this.dialog = true;
      if (gateway) {
        this.currentGateway = gateway;
        Object.assign(this.form, {
          name: gateway.value,
          id: gateway.id,
          area: gateway.areaId
        });
        this.prevImagesData = {
          installationImageID: gateway.installationPictureId,
          locationImageID: gateway.locationPictureId,
          otherImageID: gateway.otherPictureId,
        };
      } else {
        Object.assign(this.form, {
          name: '',
          subName: '',
          id: '',
          area: '',
          prefix: this.prefixes[0].id,
        });
        this.addAnother = false;
        this.prevImagesData = null;
      }
      this.$refs.deviceImagesForm?.reset();
    },
    setPrefix() {
      this.form.name = this.form.prefix;
    },
    closeModal() {
      this.$v.form.$reset();
      Object.assign(this.form, {
        name: '',
      });
      this.dialog = false;
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
        this.editGatewayFn();
      } else if (this.modalMode === 'create') {
        this.createGatewayFn();
      }
    },
    async editGatewayFn() {
      if (this.modalMode === 'edit') {
        const gateway = {
          name: this.form.name,
          siteId: this.area.site.id || this.currentSiteId,
          areaId: this.form.area ? this.form.area : null,
          ...this.newImagesData,
        };
        const gatewayId = this.currentGateway.id;
        try {
          await this.editGateway({gatewayId, gateway})
          this.$toasted.show(this.$t('gateway-edited'), {
              position: 'bottom-right',
              className: ['toast-success'],
              duration: 2000,
            });
            this.$emit('changeOnGateways');
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
    async createGatewayFn() {
      this.$v.$touch();
      if (this.modalMode === 'create') {
        let completeName = this.form.subName ? this.form.name + '@' + this.form.subName : this.form.name;
        const gateway = {
          name: completeName,
          nodeAddress: this.form.id,
          siteId: this.area?.site?.id || this.currentSiteId,
          properties: {
            areaId: this.form.area ? this.form.area : null,
            ...this.newImagesData,
          },
        };
        try {
          await this.createGateway( gateway )
            this.$toasted.show(this.$t('gateway-created'), {
              position: 'bottom-right',
              className: ['toast-success'],
              duration: 2000,
            });
            if (this.addAnother) {
              this.$v.form.$reset();
              Object.assign(this.form, {
                name: this.form.prefix, 
                subName: '',
                id: '',
                area: ''
              });
            }else{
              this.$emit('changeOnGateways');
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
#gatewayEditForm {
  padding-top: 2rem;
}
</style>