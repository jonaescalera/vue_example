<template>
  <div>
    <v-dialog v-model="dialog" width="413" scrollable>
      <v-card v-if="currentSiteLabels" id="groupEdit">
        <v-card-title v-if="mode === 'create'" class="secondary">{{$t('add')}} {{currentSiteLabels.group}}</v-card-title>
        <v-card-title v-if="mode === 'edit'" class="secondary">{{$t('edit')}} {{currentSiteLabels.group}}</v-card-title>
        <v-card-title
          v-if="mode === 'delete'"
          class="secondary"
        >{{$t('delete')}} {{currentSiteLabels.group}}</v-card-title>
        <v-card-text>
          <v-form @submit.stop.prevent id="groupEditForm">
            <v-row justify="center">
              <v-col class="mt-3" cols="11">
                <!-- name -->
                <v-autocomplete
                  v-if="mode === 'edit' || mode === 'delete'" 
                  class="d-flex"
                  :items="groups"
                  item-text="value"
                  item-value="id"
                  :label="$t('devices-page-device-group')"
                  tabindex="1"
                  :dense="true"
                  v-model="form.id"
                  @change="setGroup"
                  outlined
                  color="secondary"
                ></v-autocomplete>
                <v-text-field
                  v-if="mode === 'edit' || mode === 'create'"
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
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-col cols="12">
            <v-btn
              v-if="mode === 'edit'"
              depressed
              color="secondary"
              tabindex="4"
              @click="editGroupFn"
              class="px-8 float-right"
            >{{$t('save')}}</v-btn>
            <v-btn
              v-if="mode === 'create'"
              depressed
              color="secondary"
              tabindex="4"
              @click="createGroupFn"
              class="px-8 float-right"
            >{{$t('add')}}</v-btn>
            <v-btn
              v-if="mode === 'delete'"
              depressed
              color="error"
              tabindex="4"
              @click="deleteGroupFn"
              class="px-8 float-right"
            >{{$t('delete')}}</v-btn>
            <v-btn
              text
              color="secondary"
              tabindex="3"
              @click="resetForm"
              class="mr-2 px-8 float-right"
            >{{$t('cancel')}}</v-btn>
          </v-col>
        </v-card-actions>
        <confirm-delete-modal
          @confirm="confirmDeleteFn"
          @cancel="confirmDeleteDialog = false"
          :dialogModel="confirmDeleteDialog"
          :dialogTitle="$t('devices-page-delete-group')"
          :dialogBody="$t('delete-are-you-sure', { name: currentGroupName })"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import ConfirmDeleteModal from '../shared/modals/confirmModal';
import { validationMixin } from 'vuelidate';
import { mapActions, mapGetters } from 'vuex';

export default {
  components: {
    'confirm-delete-modal': ConfirmDeleteModal,
  },
  data() {
    return {
      mode: 'create',
      dialog: false,
      currentGroupName: null,
      confirmDeleteDialog: false,
      form: {
        name: '',
        id: '',
      },
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      name: {
        required,
      },
    },
  },
  props: ['modalMode'],
  computed: {
    //TODO get from category store once removed from tag store
    ...mapGetters('tag', ['groups']),
    ...mapGetters('site', ['currentSiteId', 'currentSiteLabels']),
    nameErrors() {
      const errors = [];
      if (!this.$v.form.name.$dirty) return errors;
      !this.$v.form.name.required &&
        errors.push(this.$t('error-name-required'));
      return errors;
    },
  },
  methods: {
    ...mapActions('group', [
      'getGroups',
      'createGroup',
      'editGroup',
      'deleteGroup',
    ]),
    openModal(createEdit) {
      this.$set(this.form, 'name', '');
      this.$set(this.form, 'id', '');
      this.currentGroupName = null;
      this.confirmDeleteDialog = false;
      this.mode = createEdit;
      this.dialog = true;
    },
    resetForm() {
      this.$v.form.$reset();
      Object.assign(this.form, {
        name: '',
      });
      this.dialog = false;
    },
    setGroup(gro) {      
      this.groups.map(g => {
          if (gro === g.id) {
            this.currentGroupName = g.value;
          }
      });
      this.$set(this.form, 'name', this.currentGroupName);
    },
    async editGroupFn() {
      this.$v.$touch();
      if (!this.$v.form.$anyError && this.mode === 'edit') {
        const siteId = this.currentSiteId;
        const { name, id } = this.form;
        const groupId = id;
        const group = { name: name };
        try {
          let resp = await this.editGroup({ groupId, group });
          this.getGroups({siteId});
          this.$emit('finished');
          this.$toasted.show(this.$t('group-edited'), {
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
    },
    async createGroupFn() {
      this.$v.$touch();
      if (!this.$v.form.$anyError && this.mode === 'create') {
        const siteId = this.currentSiteId;
        const { name } = this.form;
        const group = {
          configValue: name,
          properties: {
            siteId: siteId,
          },
        };
        try {
          const resp = await this.createGroup({ group });
          this.getGroups({siteId});
          this.$emit('finished', resp);
          this.$toasted.show(this.$t('group-created'), {
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
    },
    deleteGroupFn() {
      this.$v.$touch();
      if (!this.$v.form.$anyError && this.mode === 'delete') {
        this.confirmDeleteDialog = true;
      }
    },
    async confirmDeleteFn() {
      let groupId = this.form.id;
      const siteId = this.currentSiteId;
      try {
        const resp = await this.deleteGroup({ groupId });
        this.confirmDeleteDialog = false;
        this.getGroups({siteId});
        this.$emit('finished');
        this.$toasted.show(this.$t('group-deleted'), {
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
    },
  },
};
</script>
<style scoped>
#siteEditForm {
  padding-top: 2rem;
}
</style>