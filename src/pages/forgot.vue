<template>
  <v-app id="forgot">
    <v-container fill-height fluid>
      <v-row align="center" justify="center">
        <v-col>
          <!--FORGOT card-->
          <v-card class="mx-auto mt-3" max-width="504">
            <router-link id="forgot-link-back-login" to="/">
              <img src="../assets/img/icons/arrow-back.svg" class="back-icon" />
            </router-link>
            <v-card-text class="card-body text-center">
              <v-img
                class="mx-auto"
                max-width="80"
                src="../../src/assets/img/password.png"
              ></v-img>
              <p class="signin-text mt-5">{{ $t('forgot-page-title') }}</p>
              <v-form
                @submit.stop.prevent="onSubmit"
                ref="loginForm"
                class="forgot-form"
              >
                <p class="description-text">{{ $t('forgot-page-subtitle') }}</p>
                <template v-if="!success">
                  <div id="forgot-email-container">
                    <v-text-field
                      id="forgot-email"
                      :label="$t('email-address')"
                      v-model="form.username"
                      required
                      color="secondary"
                      :error-messages="usernameErrors"
                      @input="$v.form.username.$touch()"
                      @blur="$v.form.username.$touch()"
                    >
                    </v-text-field>
                  </div>

                  <v-alert
                    id="login-alert-error1"
                    class="submit-error"
                    :value="!!warning"
                    transition="scale-transition"
                  >
                    {{ warning }}
                  </v-alert>

                  <v-row>
                    <v-col>
                      <v-btn
                        id="login-submit"
                        depressed
                        small
                        color="secondary"
                        class="signin-button mt-5 pl-10 pr-10"
                        @click="onSubmit"
                      >
                        {{ $t('request-link') }}
                      </v-btn>
                    </v-col>
                  </v-row>
                </template>
                <template v-else>
                  <v-alert
                    id="login-alert-success"
                    :value="!pending && !warning"
                    text
                    color="green"
                    transition="scale-transition"
                  >
                    {{ $t('forgot-page-success-msg') }}
                  </v-alert>
                  <v-alert
                    id="login-alert-error2"
                    :value="!!warning"
                    class="submit-error"
                    transition="scale-transition"
                  >
                    {{ warning }}
                  </v-alert>
                  <v-row>
                    <v-col class="text-left description-text">
                      <span>{{
                        $t('forgot-page-email-not-received-msg')
                      }}</span>
                      <router-link
                        id="forgot-link-resend"
                        to=""
                        @click.native="onSubmit()"
                        class="link float-right"
                      >
                        {{ $t('resend-link') }}
                      </router-link>
                    </v-col>
                  </v-row>
                </template>
                <v-row>
                  <v-col>
                    <router-link id="forgot-link-login" to="/" class="mx-auto">
                      {{ $t('back-to-sign-in') }}
                    </router-link>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';
export default {
  name: "Forgot",
  data() {
    return {
      form: {
        username: '',
      },
      warning: null,
      success: false,
      pending: false,
    };
  },
  validations: {
    form: {
      username: {
        required,
        email,
      },
    },
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
  },
  methods: {
    async onSubmit() {
      this.pending = true;
      this.$v.form.$touch();
      this.warning = null;
      if (!this.$v.form.$anyError) {
        try {
          await this.$store.dispatch('forgot', {
            username: this.form.username,
          });
          this.success = true;
        } catch (error) {
          this.warning = error.message;
          this.$v.form.$reset();
        }
      }
      this.pending = false;
    },
  },
};
</script>
<style type="text/css" scoped>
#forgot .description-text {
  font-size: 12px;
}
#forgot {
  background: var(--v-primary-base);
}
#forgot .signin-button {
  font-size: 14px;
  text-transform: none;
}
#forgot .signin-text {
  font-size: 22px;
  font-weight: 600;
  color: var(--v-primary-darken2);
}
#forgot .v-alert {
  font-size: 12px;
  padding: 0px;
  margin: 0px;
}
#forgot .submit-error {
  color: red !important;
}
#forgot .forgot-form {
  padding: 0 18px;
}
#forgot .card-body {
  padding: 20px 77px 45px;
}
#forgot .back-icon {
  margin: 7px;
}
</style>
