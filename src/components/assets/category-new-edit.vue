<template>
  <div>
    <v-dialog v-model="dialog" width="413" scrollable>
      <v-card v-if="currentSiteLabels" id="categoryEdit">
        <v-card-title v-if="mode === 'create'" class="secondary">{{$t('add')}} {{currentSiteLabels.category}}</v-card-title>
        <v-card-title v-if="mode === 'edit'" class="secondary">{{$t('edit')}} {{currentSiteLabels.category}}</v-card-title>
        <v-card-title
          v-if="mode === 'delete'"
          class="secondary"
        >{{$t('delete')}} {{currentSiteLabels.category}}</v-card-title>
        <v-card-text>
          <v-form @submit.stop.prevent id="categoryEditForm">
            <v-row justify="center">
              <v-col class="mt-3" cols="11">
                <!-- name -->
                <v-autocomplete
                  v-if="mode === 'edit' || mode === 'delete'"
                  class="d-flex"
                  :items="categories"
                  item-text="value"
                  item-value="id"
                  :label="$t('devices-page-device-category')"
                  tabindex="1"
                  :dense="true"
                  v-model="form.id"
                  @change="setCategory"
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
              @click="editCategoryFn"
              class="px-8 float-right"
            >{{$t('save')}}</v-btn>
            <v-btn
              v-if="mode === 'create'"
              depressed
              color="secondary"
              tabindex="4"
              @click="createCategoryFn"
              class="px-8 float-right"
            >{{$t('add')}}</v-btn>
            <v-btn
              v-if="mode === 'delete'"
              depressed
              color="error"
              tabindex="4"
              @click="deleteCategoryFn"
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
          :dialogTitle="$t('devices-page-delete-category')"
          :dialogBody="$t('delete-are-you-sure', { name: currentCategoryName })"
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
      currentCategoryName: null,
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
    ...mapGetters('tag', ['categories']),
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
    ...mapActions('category', [
      'getCategories',
      'createCategory',
      'editCategory',
      'deleteCategory',
    ]),
    openModal(createEdit) {
      this.$set(this.form, 'name', '');
      this.$set(this.form, 'id', '');
      this.currentCategoryName = null;
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
    setCategory(cat) {      
      this.categories.map(c => {
          if (cat === c.id) {
            this.currentCategoryName = c.value;
          }
      });
      this.$set(this.form, 'name', this.currentCategoryName);
    },
    async editCategoryFn() {
      this.$v.$touch();
      if (!this.$v.form.$anyError && this.mode === 'edit') {
        const siteId = this.currentSiteId;
        const { name, id } = this.form;
        let categoryId = id;
        const category = { name: name };
        try {
          let resp = await this.editCategory({ categoryId, category });
          this.getCategories({siteId});
          this.$emit('finished');
          this.$toasted.show(this.$t('category-edited'), {
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
    async createCategoryFn() {
      this.$v.$touch();
      if (!this.$v.form.$anyError && this.mode === 'create') {
        const siteId = this.currentSiteId;
        const { name } = this.form;
        const category = {
          configValue: name,
          properties: {
            siteId: this.currentSiteId,
          },
        };
        try {
          const resp = await this.createCategory({ category });
          this.getCategories({siteId});
          this.$emit('finished', resp);
          this.$toasted.show(this.$t('category-created'), {
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
    deleteCategoryFn() {
      this.$v.$touch();
      if (!this.$v.form.$anyError && this.mode === 'delete') {
        this.confirmDeleteDialog = true;
      }
    },
    async confirmDeleteFn() {
      let categoryId = this.form.id;
      const siteId = this.currentSiteId;
      try {
        const resp = await this.deleteCategory({ categoryId });
        this.getCategories({siteId});
        this.$emit('finished');
        this.confirmDeleteDialog = false;
        this.$toasted.show(this.$t('category-deleted'), {
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