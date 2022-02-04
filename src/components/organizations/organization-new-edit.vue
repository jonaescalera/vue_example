<template>
  <div>
    <v-dialog @click:outside="resetForm" v-model="dialog" width="413" scrollable>
      <v-card>
        <v-card-title v-if="modalMode === 'create'" class="secondary"
          >{{$t('add-organization')}}</v-card-title
        >
        <v-card-title v-if="modalMode === 'edit'" class="secondary"
          >{{$t('edit-organization')}}</v-card-title
        >
        <v-card-text>
          <v-form @submit.stop.prevent id="organizationForm">
            <v-row justify="center">
              <v-col cols="12">
                <v-row class="img-wrapper">
                  <v-col cols="4">
                    
                    <img
                      :src="fileOrganization"
                      accept="image/jpg, image/jpeg, image/png"
                    />
                  </v-col>
                  <v-col cols="8">
                    <v-btn
                      depressed
                      small
                      @click="uploadImage('uploadFileReference')"
                      >{{$t('upload-logo')}}</v-btn
                    >
                  </v-col>
                  <input
                    type="file"
                    accept="image/jpg, image/jpeg, image/png"
                    ref="uploadFileReference"
                    @change="uploadFileReference($event, 'fileOrganization')"
                  />
                  <span class="invalid" v-if="invalidFile">{{$t('invalide-image-file')}}</span>
                </v-row>
                  
                <v-text-field
                  :label="$t('organization')"
                  tabindex="1"
                  :dense="true"
                  v-model="form.name"
                  @input="$v.form.name.$touch()"
                  @blur="$v.form.name.$touch()"
                  :error-messages="nameErrors"
                  outlined
                  required
                  color="secondary"
                ></v-text-field>

                <v-text-field
                  :label="$t('address')"
                  tabindex="2"
                  v-model="form.address"
                  @input="$v.form.address.$touch()"
                  @blur="$v.form.address.$touch()"
                  :error-messages="addressErrors"
                  :dense="true"
                  outlined
                  color="secondary"
                ></v-text-field>

                <v-text-field
                  :label="$t('address-2')"
                  tabindex="3"
                  v-model="form.address2"
                  :dense="true"
                  outlined
                  color="secondary"
                ></v-text-field>
                <v-row>
                  <v-col cols="6" class="pt-0">
                    <v-select
                      tabindex="4"
                      class="d-flex"
                      v-model="form.country"
                      @input="$v.form.country.$touch()"
                      @blur="$v.form.country.$touch()"
                      :error-messages="countryErrors"
                      :items="countries"
                      item-value="countryId"
                      item-text="name"
                      :label="$t('country')"
                      @change="onCountryChange"
                      :dense="true"
                      :eager="true"
                      outlined
                      color="secondary"
                    ></v-select>
                  </v-col>
                  <v-col cols="6" class="pt-0">
                    <v-select
                      class="d-flex"
                      v-model="form.state"
                      :items="states"
                      item-value="stateId"
                      item-text="name"
                      :label="$t('state')"
                      tabindex="5"
                      :dense="true"
                      outlined
                      color="secondary"
                    ></v-select>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="6" class="pt-0">
                    <v-text-field
                      label="City"
                      tabindex="6"
                      v-model="form.city"
                      @input="$v.form.city.$touch()"
                      @blur="$v.form.city.$touch()"
                      :error-messages="cityErrors"
                      :dense="true"
                      outlined
                      color="secondary"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" class="pt-0">
                    <v-text-field
                      label="Zipcode"
                      tabindex="7"
                      v-model="form.zipCode"
                      @input="$v.form.zipCode.$touch()"
                      @blur="$v.form.zipCode.$touch()"
                      :error-messages="zipCodeErrors"
                      :dense="true"
                      outlined
                      autocomplete
                      type="number"
                      color="secondary"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <h5 class="mb-5">{{$t('primary-contact')}}</h5>
                <v-text-field
                  :label="$t('contact-full-name')"
                  tabindex="8"
                  v-model="form.contactName"
                  @input="$v.form.contactName.$touch()"
                  @blur="$v.form.contactName.$touch()"
                  :error-messages="contactNameErrors"
                  :dense="true"
                  outlined
                  color="secondary"
                ></v-text-field>
                <v-text-field
                  :label="$t('email')"
                  tabindex="9"
                  v-model="form.contactEmail"
                  @input="$v.form.contactEmail.$touch()"
                  @blur="$v.form.contactEmail.$touch()"
                  :error-messages="contactEmailErrors"
                  :dense="true"
                  outlined
                  color="secondary"
                ></v-text-field>
                <v-text-field
                  :label="$t('phone-number')"
                  tabindex="10"
                  v-model="form.contactPhoneNumber"
                  @input="$v.form.contactPhoneNumber.$touch()"
                  @blur="$v.form.contactPhoneNumber.$touch()"
                  :error-messages="contactPhoneNumberErrors"
                  :dense="true"
                  outlined
                  autocomplete
                  type="number"
                  color="secondary"
                ></v-text-field>
                <h5 class="mb-5">{{$t('technical-contact')}}</h5>
                <v-text-field
                  :label="$t('technical-contact-full-name')"
                  tabindex="11"
                  v-model="form.techContactName"
                  :dense="true"
                  outlined
                  color="secondary"
                ></v-text-field>
                <v-text-field
                  :label="$t('technical-contact-email')"
                  tabindex="12"
                  v-model="form.techContactEmail"
                  :error-messages="techContactEmailErrors"
                  :dense="true"
                  outlined
                  color="secondary"
                ></v-text-field>
                <v-text-field
                  :label="$t('technical-contact-phone-number')"
                  tabindex="13"
                  v-model="form.techContactPhoneNumber"
                  :dense="true"
                  outlined
                  autocomplete
                  type="number"
                  color="secondary"
                ></v-text-field>
                <div v-if="showConfigMenu">
                  <h5 class="mb-5">{{$t('analytics-report')}}</h5>
                  <v-radio-group
                    v-model="form.isOrgCustomReportsEnable"
                    row
                  >
                    <v-radio
                      label="Enable"
                      v-bind:value="true"
                      color="secondary"
                    ></v-radio>
                    <v-radio
                      label="Disable"
                      v-bind:value="false"
                      color="secondary"
                    ></v-radio>
                  </v-radio-group>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-col cols="12">
            <v-btn
              depressed
              color="secondary"
              tabindex="14"
              @click="handleSaveOrganization"
              class="px-8 float-right">
              <span v-if="modalMode === 'create'">{{$t('add')}}</span>
              <span v-else>{{$t('save')}}</span>
            </v-btn>
            <v-btn
              text
              color="secondary"
              tabindex="15"
              @click="resetForm"
              class="px-8 float-right mr-2"
              >{{$t('cancel')}}</v-btn
            >
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';
import { mapActions, mapGetters } from 'vuex';
import { validationMixin } from 'vuelidate';
import { minLength, maxLength } from 'vuelidate/lib/validators'
import { ROLES } from '../../constants/roles'

export default {
  data() {
    return {
      modalMode: 'create',
      dialog: false,
      orgId: null,
      invalidFile: false,
      fileOrganization: null,
      form: {
        name: '',
        address: '',
        address2: '',
        city: '',
        state: '' ,
        country: '' ,
        zipCode: '',
        contactName: '',
        contactEmail: '',
        contactPhoneNumber: '',
        techContactName: '',
        techContactEmail: '',
        techContactPhoneNumber: '',
        isOrgCustomReportsEnable: false
      },
      updatedLogo: null,
      showConfigMenu: false
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      name: {
        required
      },
      address: {
        required
      },
      country: {
        required
      },
      city: {
        required
      },
      zipCode: {
        required,
        minLength: minLength(5),
        maxLength: maxLength(5)
      },
      contactName: {
        required
      },
      contactEmail: {
        required,
        email
      },
      techContactEmail: {
        email
      },
      contactPhoneNumber: {
        required
      },
    },
  },
  watch: {
    addEditModalOpen(newValue) {
      if (newValue) {
        this.openModal(this.addEditModalOrg);
      } else {
        this.resetForm();
      }
    },
  },
  mounted() {
    if (!this.countries.length) {
      this.getCountries();
    }
  },
  computed: {
    ...mapGetters('organization', ['countries', 'states', 'addEditModalOpen', 'addEditModalOrg']),
    nameErrors() {
      const errors = [];
      if (!this.$v.form.name.$dirty) return errors;
      !this.$v.form.name.required &&
        errors.push(this.$t('error-name-required'));
      return errors;
    },
    addressErrors() {
      const errors = [];
      if (!this.$v.form.address.$dirty) return errors;
      !this.$v.form.address.required &&
        errors.push(this.$t('error-address-required'));
      return errors;
    },
    countryErrors() {
      const errors = [];
      if (!this.$v.form.country.$dirty) return errors;
      !this.$v.form.country.required &&
        errors.push(this.$t('error-country-required'));
      return errors;
    },
    cityErrors() {
      const errors = [];
      if (!this.$v.form.city.$dirty) return errors;
      !this.$v.form.city.required &&
        errors.push(this.$t('error-city-required'));
      return errors;
    },
    zipCodeErrors() {
      const errors = [];
      if (!this.$v.form.zipCode.$dirty) return errors;
      !this.$v.form.zipCode.required &&
        errors.push(this.$t('error-zipCode-required'));
      if (this.$v.form.zipCode.$model && this.$v.form.zipCode.$model.length !== 5) {
        errors.push(this.$t('error-zipCode-max'));
      }        
      return errors;
    },
    contactNameErrors() {
      const errors = [];
      if (!this.$v.form.contactName.$dirty) return errors;
      !this.$v.form.contactName.required &&
        errors.push(this.$t('error-contact-name-required'));
      return errors;
    },
    contactPhoneNumberErrors() {
      const errors = [];
      if (!this.$v.form.contactPhoneNumber.$dirty) return errors;
      !this.$v.form.contactPhoneNumber.required &&
        errors.push(this.$t('error-contact-phone-number-required'));
      return errors;
    },
    contactEmailErrors() {
      const errors = [];
      if (!this.$v.form.contactEmail.$dirty) return errors;
      !this.$v.form.contactEmail.required &&
        errors.push(this.$t('error-contact-email-required'));
      !this.$v.form.contactEmail.email &&
        errors.push(this.$t('error-email-invalid'));
      return errors;
    },
    techContactEmailErrors() {
      const errors = [];
      if (!this.$v.form.techContactEmail.$dirty) return errors;
      !this.$v.form.techContactEmail.email &&
        errors.push(this.$t('error-email-invalid'));
      return errors;
    },
  },
  methods: {
    ...mapActions('organization', [
      'getCountries',
      'getStates',
      'saveOrg',
      'updateOrg',
      'returnOrgUserRole'
    ]),
    ...mapActions('layout', ['updateCustomTheme', 'getOrganizationTheme']),
    onCountryChange(country) {
      if (parseInt(country)) {
        this.getStates(country);
      }
    },
    async openModal(organization) {
      this.showConfigMenu = false;
      if (organization) {
        this.modalMode = 'edit';
        this.orgId = organization.id;
        if (parseInt(organization.countryId)) {
          await this.getStates(organization.countryId);
        }
        const userRole= await this.returnOrgUserRole(this.orgId);
        if((userRole === ROLES.SUPER_ADMIN) || (userRole === ROLES.ADMIN)){
          this.showConfigMenu = true;
        }
        Object.assign(this.form, {
          name: organization.name,
          address: organization.address,
          address2: organization.address2,
          city: organization.city,
          state: organization.stateId ? parseInt(organization.stateId) : '' ,
          country: organization.countryId ? parseInt(organization.countryId) : '',
          zipCode: organization.zipCode,
          contactName: organization.primaryContact,
          contactEmail: organization.primaryEmail,
          contactPhoneNumber: organization.primaryPhone,
          techContactName: organization.techContact,
          techContactEmail: organization.techEmail,
          techContactPhoneNumber: organization.techPhone,
          isOrgCustomReportsEnable: organization.isOrgCustomReportsEnable
        });
        try {
          let data = await this.getOrganizationTheme({organizationUuid: organization.id});
          this.fileOrganization = `data:image/jpeg;base64, ${data.largeImage.data}`;
        } catch (error) {
          console.error(error);
        } 
      } else {
        this.modalMode = 'create';
        this.showConfigMenu = true;
        Object.assign(this.form, {
          name: '',
          address: '',
          address2: '',
          city: '',
          state: '' ,
          country: '' ,
          zipCode: '',
          contactName: '',
          contactEmail: '',
          contactPhoneNumber: '',
          techContactName: '',
          techContactEmail: '',
          techContactPhoneNumber: '',
          isOrgCustomReportsEnable: false
        });
      }
      this.invalidFile = false;
      this.file = null;
      this.dialog = true;
    },
    uploadImage(ref) {
      this.$refs[ref].click();
    },
    uploadFileReference(e, fileSrc) {
      let file = e.target.files || e.dataTransfer.files;
      if (file[0] && (file[0].type === 'image/png' || file[0].type === 'image/jpeg' || file[0].type === 'image/jpg')) {
        this.invalidFile = false;
        this.file = file[0];
        let self = this;
        const fileReader = new FileReader();
        fileReader.onload = () => {
          self[fileSrc] = fileReader.result;
        };
        fileReader.readAsDataURL(file[0]);
      } else {
        this.invalidFile = true;
        this.file = null;
        this.fileOrganization = null;
      }
    },
    resetForm() {
      this.orgId = null;
      this.$v.form.$reset();
      this.dialog = false;
    },
    async handleSaveOrganization() {
      this.$v.$touch();
      if (!this.$v.form.$anyError) {
        let newOrg = {
          name: this.form.name,
          address1: this.form.address,
          address2: this.form.address2,
          city: this.form.city,
          state: this.form.state,
          country: this.form.country,
          zipcode: this.form.zipCode,
          primaryContact: this.form.contactName,
          primaryEmail: this.form.contactEmail,
          primaryPhone: this.form.contactPhoneNumber,
          techContact: this.form.techContactName,
          techEmail: this.form.techContactEmail,
          techPhone: this.form.techContactPhoneNumber,
        };
        try {
          let response = null;
          if (this.modalMode === 'create') {
            newOrg['properties'] = {isOrgCustomReportsEnable: this.form.isOrgCustomReportsEnable};
            response = await this.saveOrg(newOrg);
          }else {
            newOrg['isOrgCustomReportsEnable'] = this.form.isOrgCustomReportsEnable;
            response = await this.updateOrg({orgId: this.orgId, organization: newOrg});
          }
          this.$toasted.show(this.$t(this.modalMode === 'create' ? 'organization-created': 'organization-edited'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          let id = response.data?.id || response.id;
          await this.saveOrgLogo(id);
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
    async saveOrgLogo(organizationId) {
      if (this.file && organizationId) {
        const updatedLogo = {
          largeImage: this.file
        };
        try {
          let resp = await this.updateCustomTheme({organizationUuid: organizationId, newTheme: updatedLogo});
          this.$toasted.show(this.$t('logo-updated'), {
          position: 'bottom-right',
          className: ['toast-success'],
          duration: 2000,
        });
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
  input[type='file'] {
    display: none;
  }
  .img-wrapper {
    display: flex;
    flex: 1 0 100%;
    flex-direction: row;
    align-items: center;
    margin-bottom: 10px;
  }
  img {
    max-width: 100%;
  }
  .invalid {
    color: var(--v-error-base) !important;
    text-align: center;
    width: 100%;
    margin-bottom: 10px;
  }
</style>