<template>
  <v-app id="verify">
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
            <v-card-text class="text-center">
              <p class="signin-text text-center mt-5">
                {{ $t('welcome-to-airfinder') }}
              </p>

              <v-form
                v-if="!missingParams && !success"
                @submit.stop.prevent="onSubmit"
                ref="loginForm"
              >
                <p class="description-text">
                  {{ $t('verify-page-welcome-msg') }}
                </p>

                <div id="verify-email-container">
                  <v-text-field
                    id="verify-email"
                    :label="$t('email')"
                    v-model="form.username"
                    color="secondary"
                    prepend-inner-icon="mdi-account"
                    disabled
                  >
                  </v-text-field>
                </div>

                <div id="verify-password-container">
                  <v-text-field
                    id="verify-password"
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

                <password-policy />

                <v-alert
                  id="verify-alert-error"
                  class="text-center submit-error"
                  :value="!!warning"
                  transition="scale-transition"
                >
                  {{ warning }}
                </v-alert>

                <v-row>
                  <v-col class="text-center">
                    <v-btn
                      id="verify-submit"
                      depressed
                      small
                      color="secondary"
                      class="signin-button mt-5 pl-10 pr-10"
                      type="submit"
                      :disabled="inProgress"
                    >
                      {{ $t('save') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
              <template v-if="missingParams || success">
                <v-alert
                  id="verify-alert-success"
                  :value="!!success"
                  class="text-center success-message"
                  text
                  color="green"
                  transition="scale-transition"
                >
                  {{ $t('verify-page-success-msg') }}
                </v-alert>
                <v-alert
                  id="verify-alert-error-missing-param"
                  :value="!!missingParams"
                  class="text-center submit-error"
                  transition="scale-transition"
                >
                  {{ $t('auth-page-missing-parameters') }}
                </v-alert>
                <v-row>
                  <v-col class="text-center">
                    <router-link id="verify-link-login" to="/" class="mx-auto">
                      {{ $t('go-to-sign-in') }}
                    </router-link>
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
import { required, minLength, helpers } from 'vuelidate/lib/validators';
import { mapActions } from 'vuex';
import passwordPolicy from '../components/auth/password-policy.vue';
import authConstants from '../constants/auth';

export default {
  name: "Verify",
  components: {
    passwordPolicy,
  },
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
      showPassword: false,
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
  },
  mounted() {
    if (!this.$route.query.email || !this.$route.query.key) {
      this.missingParams = true;
    } else {
      this.form.username = this.$route.query.email;
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
#verify {
  background: var(--v-primary-base);
}
#verify .signin-button {
  font-size: 14px;
  text-transform: none;
}
#verify .signin-text {
  font-size: 22px;
  font-weight: 600;
  color: var(--v-primary-darken2);
}
#verify .v-alert {
  font-size: 12px;
  padding: 0px;
  margin: 0px;
}
#verify .submit-error {
  color: red !important;
}
#verify .success-message {
  margin: 30px 0;
}
</style>
