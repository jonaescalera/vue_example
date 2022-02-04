<template>
  <div>
    <v-dialog v-model="dialog" width="413" scrollable>
      <v-card id="subscriptionsNewEdit">
        <v-card-title class="secondary">{{$t('add')}} Subscription</v-card-title>
        <v-card-text>
          <v-form @submit.stop.prevent id="SubscriptionEditForm">
            <v-row justify="center">
              <v-col class="mt-3" cols="11">
                <!-- subscription type -->
                <v-autocomplete
                  class="d-flex"
                  :items="subscriptionTypes"
                  item-text="value"
                  item-value="id"
                  label="Subscription Type"
                  tabindex="1"
                  :dense="true"
                  v-model="form.subscriptionType"
                  outlined
                  color="secondary"
                ></v-autocomplete>
                <!-- name -->
                <v-text-field
                  :label="$t('name')"
                  tabindex="2"
                  :dense="true"
                  v-model="form.name"
                  outlined
                  :error-messages="nameErrors"
                  @input="$v.form.name.$touch()"
                  @blur="$v.form.name.$touch()"
                  color="secondary"
                ></v-text-field>
                <!-- sites -->
                <v-autocomplete
                  class="d-flex"
                  :items="sites"
                  item-text="value"
                  item-value="id"
                  :label="$t('site')"
                  tabindex="3"
                  :dense="true"
                  v-model="form.site"
                  outlined
                  color="secondary"
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-col cols="12">
            <v-btn
              depressed
              color="secondary"
              tabindex="4"
              @click="handleCreateSubscription"
              class="px-8 float-right"
            >{{$t('add')}}</v-btn>
            <v-btn
              text
              color="secondary"
              tabindex="3"
              @click="resetForm"
              class="mr-2 px-8 float-right"
            >{{$t('cancel')}}</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import ConfirmDeleteModal from '../shared/modals/confirmModal';
import { validationMixin } from 'vuelidate';
import { mapActions, mapGetters } from 'vuex';
import { generatePassword } from '../../mixins/uuid'

export default {
  components: {
    'confirm-delete-modal': ConfirmDeleteModal,
  },
  data() {
    return {
      dialog: false,
      subscriptionTypes: [{value: 'MQTT', id: 'MQTT'}],
      confirmDeleteDialog: false,
      form: {
        name: '',
        site: '',
        subscriptionType: '',
      },
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      name: {
        required,
      },
      subscriptionType: {
        required,
      },
    },
  },
  computed: {
    ...mapGetters('site', ['sites']),
    ...mapGetters('organization', ['orgSelected']),
    nameErrors() {
      const errors = [];
      if (!this.$v.form.name.$dirty) return errors;
      !this.$v.form.name.required &&
        errors.push(this.$t('error-name-required'));
      return errors;
    },
  },
  methods: {
    ...mapActions('subscriptions', ['createSubscription']),
    openModal() {
      this.$set(this.form, 'name', '');
      this.$set(this.form, 'site', '');
      this.confirmDeleteDialog = false;
      this.dialog = true;
    },
    resetForm() {
      this.$v.form.$reset();
      Object.assign(this.form, {
        name: '',
        site: ''
      });
      this.dialog = false;
    },
    async handleCreateSubscription() {
      this.$v.$touch();
      if (!this.$v.form.$anyError) {
        const subscription = {
          mqttUsername: this.form.name,
          siteId: this.form.site,
          organizationId: this.orgSelected,
          password: generatePassword()
        };
        try {
          const resp = await this.createSubscription(subscription);
          this.$emit('finished', resp);
          this.$toasted.show(this.$t('subscription-created'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          this.resetForm();
        } catch (error) {
          this.$toasted.show(error, {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });
        }
      }
    }
  },
};
</script>
<style scoped>
#siteEditForm {
  padding-top: 2rem;
}
</style>