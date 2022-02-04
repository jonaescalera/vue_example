<template>
  <v-app id="login">
    <v-container fill-height d-flex justify-center>
      <v-row>
        <v-col>
          <v-img
            class="mx-auto"
            max-width="219"
            src="../../src/assets/img/logoairfinder.png"
          ></v-img>
          <!--LOGIN FORM START-->
          <v-card v-if="showEmailForm" class="mx-auto mt-3" max-width="376" >
            <v-card-text>
              <p class="signin-text text-center mt-5">{{ $t('sign-in') }}</p>
              <v-form @submit.stop.prevent="onSubmit" ref="loginForm">
                <div id="login-email-container">
                  <!-- placeholder with a single space added on purpose https://stackoverflow.com/a/60161209 -->
                  <v-text-field
                    id="login-email"
                    :label="$t('email')"
                    placeholder=" "
                    v-model="form.username"
                    required
                    color="secondary"
                    prepend-inner-icon="mdi-account"
                    :error-messages="usernameErrors"
                    @input="$v.form.username.$touch()"
                    @blur="$v.form.username.$touch()"
                  >
                  </v-text-field>
                </div>

                <v-alert
                  id="login-alert"
                  class="text-center"
                  :value="!!warning"
                  transition="scale-transition"
                >
                  {{ warning }}
                </v-alert>

                <v-row>
                  <v-col class="text-center">
                    <v-btn
                      id="login-submit"
                      depressed
                      small
                      color="secondary"
                      class="signin-button mt-5 pl-10 pr-10"
                      type="submit"
                      :disabled="inProgress"
                    >
                      {{ $t('sign-in') }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="activationURL">
                  <v-col class="text-center">
                    <a class="mx-auto forgot-pass activation-supertag primary--text font-weight-bold" :href="activationURL">
                      {{ $t('sign-in-activation-redirect') }}
                    </a>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
          <!--LOGIN FORM END-->

          <!--PASSWORD FORM -->
          <v-card v-show="!showEmailForm" class="mx-auto mt-3" max-width="376">
            <div @click="showEmailForm = !showEmailForm">
              <img src="../assets/img/icons/arrow-back.svg" class="back-icon" />
            </div>
            <v-card-text>
              <p class="signin-text text-center mt-5">{{ $t('sign-in') }}</p>
              <v-form @submit.stop.prevent="onSubmitPasswordForm" ref="passwordForm">

                <div id="login-password-container">
                  <!-- placeholder with a single space added on purpose https://stackoverflow.com/a/60161209 -->
                  <v-text-field
                    id="login-password"
                    ref="passwordInput"
                    :label="$t('password')"
                    placeholder=" "
                    v-model="passwordForm.password"
                    :type="show ? 'text' : 'password'"
                    :error-messages="passwordErrors"
                    required
                    prepend-inner-icon="mdi-lock"
                    :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="show = !show"
                    color="secondary"
                    @input="$v.passwordForm.password.$touch()"
                    @blur="$v.passwordForm.password.$touch()"
                  >
                  </v-text-field>
                </div>

                <v-alert
                  id="login-alert"
                  class="text-center"
                  :value="!!warning"
                  transition="scale-transition"
                >
                  {{ warning }}
                </v-alert>

                <v-row>
                  <v-col class="text-center">
                    <v-btn
                      id="login-submit"
                      depressed
                      small
                      color="secondary"
                      class="signin-button mt-5 pl-10 pr-10"
                      type="submit"
                      :disabled="inProgress"
                    >
                      {{ $t('sign-in') }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="text-center">
                    <router-link
                      id="login-link-forgot"
                      to="/forgot"
                      class="mx-auto forgot-pass primary--text font-weight-bold"
                    >
                      {{ $t('login-page-forgot-your-password') }}
                    </router-link>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
          <!--PASSWORD FORM END -->

        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, email } from 'vuelidate/lib/validators';
import { mapActions } from 'vuex';

export default {
  name: "Login",
  data() {
    return {
      form: {
        username: ''
      },
      passwordForm: {
        password: ''
      },
      showEmailForm: true,
      show: false,
      inProgress: false,
      warning: null,
      activationURL: process.env.VUE_APP_APPLICATION_SUPERTAG_ACTIVATION_URL
    }
  },
  mixins: [validationMixin],
  validations: {
    form: {
      username: {
        required,
        email,
      },
    },
    passwordForm: {
      password: {
        required,
      },
    },
  },
  mounted() {
    // SSO User Check
    const token = this.$route.query.accessToken;
    if (token) {
      this.saveJwt({ token });
      this.saveLogin();
      this.processLogin();
    }
  },
  computed: {
    usernameErrors() {
      const errors = [];
      if (!this.$v.form.username.$dirty) return errors;
      !this.$v.form.username.required &&
        errors.push(this.$t('error-email-required'));
      !this.$v.form.username.email &&
        errors.push(this.$t('error-email-invalid'));
      return errors;
    },
    passwordErrors() {
      const errors = [];
      if (!this.$v.passwordForm.password.$dirty) return errors;
      !this.$v.passwordForm.password.required &&
        errors.push(this.$t('error-password-required'));
      return errors;
    },
  },
  methods: {
    ...mapActions('organization', ['getOrganizations']),
    ...mapActions(['login', 'checkSSO', 'processLogin', 'saveJwt','saveLogin']),
    async onSubmit() {
      this.$v.form.$touch();
      this.warning = null;
      if (!this.inProgress && !this.$v.form.$anyError) {
        this.inProgress = true;
        try {
          const response = await this.checkSSO({
            username: this.form.username,
          });
          if (response) {
            // Redirect to the SSO URL
            window.location = response;
            return;
          }
          this.showEmailForm = false;
          this.inProgress = false;
          this.$nextTick(() => {
            this.$refs.passwordInput.focus();
          });
        } catch (error) {
          this.warning = error.message;
          this.$v.form.$reset();
          this.inProgress = false;
        }
      }
    },
    async onSubmitPasswordForm() {
      this.$v.passwordForm.$touch();
      this.warning = null;
      if (!this.inProgress && !this.$v.passwordForm.$anyError) {
        this.inProgress = true;
        try {
          await this.login({
            username: this.form.username,
            password: this.passwordForm.password.trim(),
          });
          await this.processLogin();
        } catch (error) {
          this.warning = error.message;
          this.$v.passwordForm.$reset();
          this.inProgress = false;
        }
      }
    },
    async fetchOrganizations() {
      let orgs = await this.getOrganizations();
      return orgs;
    },
  },
};
</script>
<style type="text/css" scoped>
#login {
  background: var(--v-primary-base);
}
#login .signin-button {
  font-size: 14px;
  text-transform: none;
}
#login .forgot-pass {
  font-size: 11px;
}
#login .signin-text {
  font-size: 22px;
  font-weight: 600;
  color: var(--v-primary-darken2);
}
#login .eye-icon {
  position: absolute;
  left: 100px;
}
#login .v-alert {
  color: red !important;
  font-size: 12px;
  padding: 0px;
  margin: 0px;
}
#login .activation-supertag {
  display: inline-block;
}
#login .back-icon {
  margin: 7px;
  position: absolute;
  cursor: pointer;
}
</style>
