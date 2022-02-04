<template>
  <div>
    <v-dialog v-model="dialog" width="513" scrollable>
      <v-card id="labelEdit">
        <v-card-title class="secondary">{{$t('devices-page-edit-labels')}}</v-card-title>
        <div class="labels-note">
          <div>{{$t('label-edit-note-1')}}</div>
          <div>{{$t('label-edit-note-2')}}</div>
        </div>
        <v-form class="p-3" @submit.stop.prevent id="labelEditForm">
          <v-row justify="center">
            <v-col cols="12" class="pt-4 pb-0">
              <v-text-field
                :label="$t('tag')"
                tabindex="1"
                maxlength="200"
                :dense="true"
                v-model="form.tag_label"
                outlined
                color="secondary"
              ></v-text-field>
            </v-col>
            <v-col cols="6" class="py-0">
              <v-text-field
                :label="$t('group')"
                tabindex="2"
                maxlength="200"
                :dense="true"
                v-model="form.group_label"
                outlined
                color="secondary"
              ></v-text-field>
            </v-col>
            <v-col cols="6" class="py-0">
              <v-text-field
                :label="$t('category')"
                tabindex="3"
                maxlength="200"
                :dense="true"
                v-model="form.category_label"
                outlined
                color="secondary"
              ></v-text-field>
            </v-col>
            <v-col cols="6" class="py-0">
              <v-text-field
                :label="$t('field1')"
                tabindex="4"
                maxlength="200"
                :dense="true"
                v-model="form.field1_label"
                outlined
                color="secondary"
              ></v-text-field>
            </v-col>
            <v-col cols="6" class="py-0">
              <v-text-field
                :label="$t('field2')"
                tabindex="5"
                maxlength="200"
                :dense="true"
                v-model="form.field2_label"
                outlined
                color="secondary"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
        <v-card-actions>
          <v-col cols="12" class="p-0">
            <v-btn
              depressed
              color="secondary"
              tabindex="6"
              @click="editLabelsFn"
              class="px-8 float-right"
            >{{$t('save')}}</v-btn>
            <v-btn
              text
              color="secondary"
              tabindex="7"
              @click="resetForm"
              class="px-8 float-right"
            >{{$t('cancel')}}</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      dialog: false,
      form: {
        tag_label: '',
        category_label: '',
        group_label: '',
        field1_label: '',
        field2_label: '',
        siteId: ''
      },
    };
  },
  methods: {
    ...mapActions('site', ['editSite', 'getSites', 'setCurrentSiteId']),
    openModal(site) {
      this.dialog = true;
      let labels = site?.assetInfo?.metadata?.props
      site?.id? this.$set(this.form, 'siteId', site.id): null;
      labels.tag_label ? this.$set(this.form, 'tag_label', labels.tag_label) : null;
      labels.category_label ? this.$set(this.form, 'category_label', labels.category_label) : null;
      labels.group_label ? this.$set(this.form, 'group_label', labels.group_label) : null;
      labels.field2_label ? this.$set(this.form, 'field2_label', labels.field2_label) : null;
      labels.field1_label ? this.$set(this.form, 'field1_label', labels.field1_label) : null;
    },
    resetForm() {
      Object.assign(this.form, {
        tag_label: '',
        category_label: '',
        group_label: '',
        field1_label: '',
        field2_label: '',
        siteId: ''
      });
      this.dialog = false;
    },
    async editLabelsFn() {
        let site = {
            tag_label: (this.form.tag_label.trim() !== '') ? this.form.tag_label: null,
            category_label: (this.form.category_label.trim() !== '') ? this.form.category_label: null,
            group_label: (this.form.group_label.trim() !== '') ? this.form.group_label: null,
            field1_label: (this.form.field1_label.trim() !== '') ? this.form.field1_label: null,
            field2_label: (this.form.field2_label.trim() !== '') ? this.form.field2_label: null
        };
        let siteId = this.form.siteId
        try {
          await this.editSite({ siteId, site });
          this.$toasted.show(this.$t('site-edited'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          //refresh sites after label edition
          await this.getSites()
          this.setCurrentSiteId({ siteId: siteId })
          this.$emit('labelsEdited');
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
};
</script>
<style scoped>
#labelEditForm {
  padding: 0px 20px 0px 20px;
}
.labels-note {
  font-size: 0.8rem;
  padding: 10px 20px 0px 20px;
}
</style>