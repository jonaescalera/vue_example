<template>
  <v-app id="reset">
    <v-container fill-height fluid>
      <v-row align="center" justify="center">
        <v-col>
          <v-img
            class="mx-auto"
            max-width="219"
            src="../../src/assets/img/logoairfinder.png"
          ></v-img>
          <!--RESET card-->
          <v-card class="mx-auto mt-3" max-width="376">
            <v-card-text>
              <p class="signin-text text-center mt-5">
                {{ $t('reset-your-password') }}
              </p>

              <v-form
                v-if="!missingParams && !success"
                @submit.stop.prevent="onSubmit"
                ref="loginForm"
              >
                <div id="reset-new-password-container">
                  <v-text-field
                    id="reset-new-password"
                    :label="$t('new-password')"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    :error-messages="passwordErrors"
                    required
                    prepend-inner-icon="mdi-lock"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showPassword = !showPassword"
                    color="secondary"
                    @input="$v.form.password.$touch()"
                    @blur="$v.form.password.$touch()"
                  >
                  </v-text-field>
                </div>

                <div id="reset-confirm-password-container">
                  <v-text-field
                    id="reset-confirm-password"
                    :label="$t('re-enter-password')"
                    v-model="form.confirmPassword"
                    :type="showConfirm ? 'text' : 'password'"
                    :error-messages="confirmPasswordErrors"
                    required
                    prepend-inner-icon="mdi-lock"
                    :append-icon="showConfirm ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showConfirm = !showConfirm"
                    color="secondary"
                    @input="$v.form.confirmPassword.$touch()"
                    @blur="$v.form.confirmPassword.$touch()"
                  >
                  </v-text-field>
                </div>

                <password-policy />

                <v-alert
                  id="reset-alert-error"
                  class="text-center submit-error"
                  :value="!!warning"
                  transition="scale-transition"
                >
                  {{ warning }}
                </v-alert>

                <v-row>
                  <v-col class="text-center">
                    <v-btn
                      id="reset-submit"
                      depressed
                      small
                      color="secondary"
                      class="signin-button mt-5 pl-10 pr-10"
                      @click="onSubmit"
                      :disabled="inProgress"
                    >
                      {{ $t('reset-password') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
              <template v-if="missingParams || success">
                <v-alert
                  id="reset-alert-success"
                  :value="!!success"
                  class="text-center success-message"
                  text
                  color="green"
                  transition="scale-transition"
                >
                  {{ $t('reset-page-success-msg') }}
                </v-alert>
                <v-alert
                  id="reset-alert-error-missing-param"
                  :value="!!missingParams"
                  class="text-center submit-error"
                  transition="scale-transition"
                >
                  {{ $t('auth-page-missing-parameters') }}
                </v-alert>
                <v-row>
                  <v-col class="text-center">
                    <router-link id="reset-link-login" to="/" class="mx-auto">{{
                      $t('go-to-sign-in')
                    }}</router-link>
                  </v-col>
                </v-row>
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, minLength, helpers, sameAs } from 'vuelidate/lib/validators';
import { mapActions } from 'vuex';
import passwordPolicy from '../components/auth/password-policy.vue';
import authConstants from '../constants/auth';

export default {
  name: "Reset",
  components: {
    passwordPolicy,
  },
  data() {
    return {
      form: {
        password: '',
        confirmPassword: '',
      },
      showPassword: false,
      showConfirm: false,
      missingParams: false,
      inProgress: false,
      warning: null,
      success: false,
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      password: {
        required,
        minLength: minLength(8),
        secure: helpers.regex('securePassword', authConstants.passwordRegex),
      },
      confirmPassword: {
        required,
        sameAsPassword: sameAs('password'),
      },
    },
  },
  computed: {
    passwordErrors() {
      const errors = [];
      if (!this.$v.form.password.$dirty) return errors;
      !this.$v.form.password.required && errors.push(this.$t('error-required'));
      if (!this.$v.form.password.minLength || !this.$v.form.password.secure)
        errors.push(this.$t('error-password-security'));
      return errors;
    },
    confirmPasswordErrors() {
      const errors = [];
      if (!this.$v.form.confirmPassword.$dirty) return errors;
      if (!this.$v.form.confirmPassword.required) {
        errors.push(this.$t('error-required'));
      } else if (!this.$v.form.confirmPassword.sameAsPassword) {
        errors.push(this.$t('error-confirm-password'));
      }
      return errors;
    },
  },
  mounted() {
    if (!this.$route.query.email || !this.$route.query.key) {
      this.missingParams = true;
    }
  },
  methods: {
    ...mapActions(['reset']),
    async onSubmit() {
      this.$v.form.$touch();
      this.warning = null;
      if (!this.inProgress && !this.$v.form.$anyError) {
        this.inProgress = true;
        try {
          await this.reset({
            username: this.$route.query.email,
            password: this.form.password,
            key: this.$route.query.key,
          });
          this.success = true;
        } catch (error) {
          this.warning = error.message;
          this.$v.form.$reset();
          this.inProgress = false;
        }
      }
    },
  },
};
</script>
<style type="text/css" scoped>
#reset {
  background: var(--v-primary-base);
}
#reset .signin-button {
  font-size: 14px;
  text-transform: none;
}
#reset .signin-text {
  font-size: 22px;
  font-weight: 600;
  color: var(--v-primary-darken2);
}
#reset .v-alert {
  font-size: 12px;
  padding: 0px;
  margin: 0px;
}
#reset .submit-error {
  color: red !important;
}
#reset .success-message {
  margin: 30px 0;
}
</style>
