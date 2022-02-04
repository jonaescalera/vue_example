<template>
  <v-app id="activate" class="main">
    <v-container fill-height fluid>
      <v-row align="center" justify="center">
        <v-col>
          <v-img
            class="mx-auto"
            max-width="219"
            src="../../src/assets/img/logoairfinder.png"
          ></v-img>
          <!--CODE FORM START-->
          <v-card v-if="cardNo === 1" class="mx-auto mt-3" max-width="376" >
            <v-card-text>
              <p class="form-text text-center mt-5">{{ $t('activate-page-welcome-msg') }}</p>
              <v-form @submit.stop.prevent="onSubmitCode" ref="loginForm">
                <div id="activate-code-container" class="d-flex justify-center">
                  <vue-pincode-input
                    v-model="code"
                    :length="5"
                  />
                </div>

                <error-alert class="mt-5" :message="warning"/>

                <v-row>
                  <v-col class="text-center">
                    <v-btn
                      id="activate-code-submit"
                      depressed
                      small
                      color="secondary"
                      class="form-button mt-5 pl-10 pr-10"
                      type="submit"
                      :disabled="!codeValid"
                    >
                      {{ $t('start-activation') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
          <!--CODE FORM END-->

          <!--ORGANISATION FORM START-->
          <v-card v-if="cardNo === 2" class="mx-auto mt-3" max-width="376">
            <v-card-text>
              <p class="form-text text-center mt-5">{{ $t('setup-your-account') }}</p>
              <v-form @submit.stop.prevent="onSubmitOrgInfo" ref="orgForm">

                <div id="activate-org-email-container">
                  <!-- placeholder with a single space added on purpose https://stackoverflow.com/a/60161209 -->
                  <v-text-field
                    id="activate-org-email"
                    :label="$t('account-owners-email')"
                    placeholder=" "
                    v-model="orgForm.email"
                    required
                    color="secondary"
                    :error-messages="orgEmailErrors"
                    @input="$v.orgForm.email.$touch()"
                    @blur="$v.orgForm.email.$touch()"
                  >
                  </v-text-field>
                </div>

                <div id="activate-org-name-container">
                  <!-- placeholder with a single space added on purpose https://stackoverflow.com/a/60161209 -->

                  <v-text-field
                    id="activate-org-name"
                    :label="$t('organization-name')"
                    placeholder=" "
                    v-model="orgForm.name"
                    required
                    color="secondary"
                    :error-messages="orgNameErrors"
                    @input="$v.orgForm.name.$touch()"
                    @blur="$v.orgForm.name.$touch()"
                  >
                  </v-text-field>
                </div>

                <error-alert class="mt-5" :message="warning"/>

                <v-row>
                  <v-col class="text-center">
                    <v-btn
                      id="activate-full-submit"
                      depressed
                      small
                      color="secondary"
                      class="form-button mt-5 pl-10 pr-10"
                      type="submit"
                      :disabled="inProgress"
                    >
                      {{ $t('next') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
          <!--ORGANISATION FORM END -->

          <!--FINAL FORM START-->
          <v-card v-if="cardNo === 3" class="mx-auto mt-3" max-width="376" >
            <v-card-text>
              <p class="form-text text-center mt-5">{{ $t('check-your-email') }}</p>
              <p class="form-description-text">{{ $t('activate-success-message') }}</p>
              <p class="form-description-text">{{ $t('activate-email-message') }}
                <v-icon @click="openFile(
                  'http://mediaupload-us-east1.s3.amazonaws.com/pdf/AirFinder SuperTag Pro - Activation Guide-v1.pdf'
                )">mdi-open-in-new</v-icon>
              </p>
              <i18n class="form-description-text" path="activate-redirect-message" tag="p">
                <template v-slot:action>
                  <a :href="appUrl">{{ $t('activate-here-message') }}</a>
                </template>
              </i18n>
            </v-card-text>
          </v-card>
          <!--FINAL FORM END-->

        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, email } from 'vuelidate/lib/validators';
import VuePincodeInput from '../components/vue-pincode-input/vue-pincode-input.vue';
import ErrorAlert from '../components/activate/error-alert.vue';
import ActivateService from '../services/activate';

export default {
  name: "Activate",
  components: {
    VuePincodeInput,
    ErrorAlert,
  },
  data() {
    return {
      orgForm: {
        email: '',
        name: '',
      },
      inProgress: false,
      warning: null,
      code: '',
      cardNo: 1,
      token: null,
      appUrl: process.env.VUE_APP_APPLICATION_URL
    };
  },
  mixins: [validationMixin],
  validations: {
    orgForm: {
      email: {
        required,
        email,
      },
      name: {
        required,
      },
    }
  },
  computed: {
    orgEmailErrors() {
      const errors = [];
      if (!this.$v.orgForm.email.$dirty) return errors;
      !this.$v.orgForm.email.required &&
        errors.push(this.$t('error-email-required'));
      !this.$v.orgForm.email.email &&
        errors.push(this.$t('error-email-invalid'));
      return errors;
    },
    orgNameErrors() {
      const errors = [];
      if (!this.$v.orgForm.name.$dirty) return errors;
      !this.$v.orgForm.name.required &&
        errors.push(this.$t('error-organization-name-required'));
      return errors;
    },
    codeValid() {
      return this.code && this.code.length === 5;
    }
  },
  methods: {
    openFile(file) {
      window.open(file, '_blank');
    },
    async onSubmitCode() {
      this.warning = null;
      if (this.codeValid) {
        this.cardNo = 2;
      }
    },
    async onSubmitOrgInfo() {
      this.$v.orgForm.$touch();
      this.warning = null;
      if (!this.inProgress && !this.$v.orgForm.$anyError) {
        this.inProgress = true;
        try {
          await this.validateCode();
          await this.createResources();
          this.cardNo = 3;
          ActivateService.navigateToLogin();
        } catch (error) {
          this.warning = (error.data && error.data.message) || this.$t('something-went-wrong');
        }
        this.inProgress = false;
      }
    },
    async validateCode() {
      this.token = null;
      try {
        const activationResponse = await ActivateService.validateCode({ code: this.code });
        this.token = activationResponse.token;
      } catch (error) {
        if (error && (error.status === 404 || error.status === 400)) {
          // Show code input when code validation fails
          this.cardNo = 1;
        }
        throw error;
      }
    },
    async createResources() {
      await ActivateService.createResources({
        code: this.code,
        token: this.token,
        email: this.orgForm.email,
        organizationName: this.orgForm.name,
        siteName: `${this.orgForm.name}-Site`,
      });
    },
  },
};
</script>
<style type="text/css" scoped>
.main {
  background: var(--v-primary-base);
}
.main .form-button {
  font-size: 14px;
  text-transform: none;
}
.main .form-text {
  font-size: 22px;
  font-weight: 600;
  color: var(--v-primary-darken2);
}
.main .form-description-text {
  text-align: center;
}
.main .eye-icon {
  position: absolute;
  left: 100px;
}
</style>
