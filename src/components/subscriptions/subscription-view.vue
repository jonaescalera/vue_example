<template>
  <div>
    <v-dialog v-model="dialog" width="513" scrollable>
      <v-card id="subscriptionView">
        <v-card-title class="secondary">{{$t('mqtt-subscription')}}</v-card-title>
        <v-card-text>
          <v-text-field
            :label="$t('username')"
            :dense="false"
            :readonly="true"
            :value="form.username"
            :append-outer-icon="'mdi-content-copy'"
            class="mt-10"
            required
            color="secondary"
            @click:append-outer="copyToClipboard(form.username)"
          ></v-text-field>
          <v-text-field
            :label="$t('password')"
            :dense="false"
            :type="showPass ? 'text' : 'password'"
            :readonly="true"
            :append-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
            :append-outer-icon="'mdi-content-copy'"
            :value="form.password"
            required
            color="secondary"
            @click:append="showPass = !showPass"
            @click:append-outer="copyToClipboard(form.password)"
          ></v-text-field>
          <v-row no-gutters>
            <v-col cols="12">
              <v-text-field
                :label="$t('client-id')"
                :dense="true"
                :readonly="true"
                :append-outer-icon="'mdi-content-copy'"
                :value="form.clientId"
                required
                class="mt-5"
                color="secondary"
                @click:append-outer="copyToClipboard(form.clientId)"
              ></v-text-field>
            </v-col>
            <v-text-field
              :label="$t('topic')"
              :append-outer-icon="'mdi-content-copy'"
              :readonly="true"
              :dense="true"
              :value="form.topic"
              class="mt-5"
              color="secondary"
              @click:append-outer="copyToClipboard(form.topic)"
            ></v-text-field>
          </v-row>
          <v-row class="mt-5" no-gutters>
            <v-col cols="2">
              <v-text-field
                :label="$t('protocol')"
                :dense="true"
                :value="form.protocol"
                :readonly="true"
                color="secondary"
              ></v-text-field>
            </v-col>
            <v-col cols="8">
              <v-text-field
                :label="$t('host')"
                :dense="true"
                :value="form.host"
                :readonly="true"
                color="secondary"
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field
                :label="$t('port')"
                :dense="true"
                :value="form.port"
                :append-outer-icon="'mdi-content-copy'"
                :readonly="true"
                color="secondary"
                @click:append-outer="
                  copyToClipboard(form.protocol + form.host + ':' + form.port)
                "
              ></v-text-field>
            </v-col>
          </v-row>
          <!-- <v-autocomplete
            class="mt-5"
            id="selectSite"
            :items="sites"
            item-text="value"
            item-value="id"
            label="Site"
            v-model="form.siteId"
            :no-data-text="$t('sites-not-available')"
            outlined
            dense
          ></v-autocomplete> -->
        </v-card-text>
        <v-card-actions>
          <v-col cols="12">
            <v-btn
              text
              color="secondary"
              @click="dialog = false"
              class="px-8 float-right"
              >{{ $t('close') }}</v-btn
            >
            <v-btn
              color="secondary"
              depressed
              @click="copyAll"
              class="px-8 mr-2 float-right"
              >{{ $t('copy-all') }}</v-btn
            >
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      dialog: false,
      showPass: false,
      form: {},
    };
  },
  computed: {
    ...mapGetters('site', ['sites']),
    ...mapGetters('organization', ['orgSelected']),
  },
  methods: {
    openModal(sub) {
      this.dialog = true;
      Object.assign(this.form, sub);
    },
    copyAll() {
      this.copyToClipboard(JSON.stringify(this.form));
    },
    async copyToClipboard(text) {
      await navigator.clipboard.writeText(text);
      this.$toasted.show(this.$t('text-copied-to-clipboard'), {
        position: 'bottom-right',
        className: ['toast-success'],
        duration: 1500,
      });
    },
  },
};
</script>
<style scoped>
#userEditForm {
  padding-top: 2rem;
}
.form-perm-card {
  margin-bottom: 25px;
  padding: 15px;
}
</style>