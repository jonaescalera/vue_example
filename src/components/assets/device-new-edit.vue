<template>
  <div>
    <v-dialog @click:outside="closeModal" @keydown.esc="closeModal" v-model="dialog" width="413" scrollable>
      <v-card v-if="currentSiteLabels" id="deviceCreateEdit">
        <v-card-title v-if="modalMode === 'create'" class="secondary">{{$t('add') }} {{currentSiteLabels.tag}}</v-card-title>
        <v-card-title v-if="modalMode === 'edit'" class="secondary">{{$t('edit')}} {{currentSiteLabels.tag}}</v-card-title>
        <v-card-text>
          <v-form @submit.stop.prevent id="deviceEditForm" ref="deviceForm">
            <v-row justify="center">
              <v-col cols="11">
                <!-- device name -->
                <v-text-field
                  :label="nameLabel"
                  tabindex="1"
                  :dense="true"
                  v-model="form.name"
                  :error-messages="nameErrors"
                  outlined
                  required
                  color="secondary"
                  @input="$v.form.name.$touch()"
                  @blur="$v.form.name.$touch()"
                ></v-text-field>
                <!-- mac address -->
                <v-text-field
                  :label="$t('devices-page-device-mac-address-required')"
                  tabindex="2"
                  v-model="form.macAddress"
                  @keyup="formatMacAddress"
                  :dense="true"
                  maxlength="17"
                  :error-messages="macAddressErrors"
                  :disabled="modalMode === 'edit'"
                  outlined
                  required
                  color="secondary"
                  @change="$v.form.macAddress.$touch()"
                ></v-text-field>
                <v-row>
                  <!-- category -->
                  <v-col cols="6" class="pt-0 pos-relative">
                    <v-autocomplete
                      class="d-flex"
                      v-model="form.category"
                      :items="categories"
                      :clearable="true"
                      item-text="value"
                      item-value="id"
                      :label="currentSiteLabels.category"
                      tabindex="3"
                      :dense="true"
                      outlined
                      color="secondary"
                    ></v-autocomplete>
                    <v-btn color="secondary" rounded x-small @click="openCategoryCreateModal" class="p-0 add-btn" depressed><v-icon
                      v-text="'mdi-plus'"
                    ></v-icon></v-btn>
                  </v-col>
                  <!-- group -->
                  <v-col cols="6" class="pt-0 pos-relative">
                    <v-autocomplete
                      class="d-flex"
                      v-model="form.group"
                      :items="groups"
                      :clearable="true"
                      item-text="value"
                      item-value="id"
                      :label="currentSiteLabels.group"
                      tabindex="4"
                      :dense="true"
                      outlined
                      color="secondary"
                    ></v-autocomplete>
                    <v-btn color="secondary" rounded x-small @click="openGroupCreateModal" class="p-0 add-btn" depressed><v-icon
                      v-text="'mdi-plus'"
                    ></v-icon></v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <!-- field 1 -->
                  <v-col cols="6" class="pt-0">
                    <v-text-field
                      :label="currentSiteLabels.field1"
                      tabindex="5"
                      v-model="form.field1"
                      :dense="true"
                      outlined
                      color="secondary"
                    ></v-text-field>
                  </v-col>
                  <!-- field 2 -->
                  <v-col cols="6" class="pt-0">
                    <v-text-field
                      :label="currentSiteLabels.field2"
                      tabindex="6"
                      v-model="form.field2"
                      :dense="true"
                      outlined
                      color="secondary"
                    ></v-text-field>
                  </v-col>
                  <v-row>
                    <v-col class="pl-5 pb-0 pt-0">
                    <v-checkbox
                      v-if="modalMode === 'create'"
                      v-model="addAnother"
                      id="addAnother"
                      class="d-inline-block mt-1"
                      color="primary"
                      :label="$t('add-another')"
                    ></v-checkbox>
                    </v-col>
                  </v-row>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-col cols="12">
            <v-btn
              v-if="modalMode === 'edit'"
              depressed
              color="secondary"
              tabindex="3"
              @click="saveDevice"
              class="px-8 float-right"
            >{{$t('save')}}</v-btn>
            <v-btn
              v-if="modalMode === 'create'"
              depressed
              color="secondary"
              tabindex="7"
              @click="saveDevice"
              class="px-8 float-right"
            >{{$t('add')}}</v-btn>
            <v-btn
              text
              color="secondary"
              tabindex="8"
              @click="closeModal"
              class="mr-2 px-8 float-right"
            >{{$t('cancel')}}</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <CategoryModal @finished="onCategoryCreated" ref="categoryModal"/>
    <GroupModal @finished="onGroupCreated" ref="groupModal"/>
    <ConfirmModal 
      @confirm="editExisting"
      @cancel="editDialog = false"
      :dialogModel="editDialog"
      :dialogTitle=" this.existingTagTitle || $t('device-provisioned') "
      :dialogBody="$t('would-like-edit')"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { required, minLength } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { macAddressValidator } from '../../mixins/macAddressValidator';
import CategoryModal from './category-new-edit';
import GroupModal from './group-new-edit';
import ConfirmModal from '../shared/modals/confirmModal'

export default {
  data() {
    return {
      dialog: false,
      addAnother: false,
      hasChanges: false,
      editDialog: false,
      existingTag: null,
      existingTagTitle: '',
      form: {
        name: '',
        macAddress: '',
        category: '',
        group: '',
        field1: '',
        field2: '',
      },
    };
  },
  components: {
    GroupModal,
    CategoryModal,
    ConfirmModal
  },
  mixins: [validationMixin],
  validations: {
    form: {
      name: {
        required,
      },
      macAddress: {
        required,
        minLength: minLength(17),
      },
    },
  },
  props: ['modalMode'],
  computed: {
    ...mapGetters('site', ['currentSiteId', 'currentSiteLabels', 'sites']),
    ...mapGetters('tag', ['categories', 'groups']),
    nameLabel() {
      return `${this.currentSiteLabels.tag} *`
    },
    nameErrors() {
      const errors = [];
      if (!this.$v.form.name.$dirty) return errors;
      !this.$v.form.name.required &&
        errors.push(this.$t('devices-error-name-required'));
      return errors;
    },
    macAddressErrors() {
      const errors = [];
      if (!this.$v.form.macAddress.$dirty) return errors;
      !this.$v.form.macAddress.required &&
        errors.push(this.$t('devices-error-mac-address-required'));
      !this.$v.form.macAddress.minLength &&
        errors.push(this.$t('devices-error-mac-address-min-length'));
      return errors;
    },
  },
  methods: {
    ...mapActions('tag', ['createTag', 'editTag', 'getTag']),
    ...mapActions('site', ['setCurrentSiteId']),
    openModal(device) {
      this.dialog = true;
      this.hasChanges = false;
      this.addAnother = false;
      if (device) {
        Object.assign(this.form, {
          name: device.name,
          macAddress: macAddressValidator.computed.formatMacAddress(
            device.macAddress
          ),
          category: device.category?.id,
          group: device.group?.id,
          site: this.currentSiteId,
          field1: device.field1,
          field2: device.field2,
          id: device.id,
        });
      } else {
        Object.assign(this.form, {
          site: this.currentSiteId,
          name: '',
          macAddress: '',
          category: '',
          group: '',
          field1: '',
          field2: '',
        });
      }
    },
    onCategoryCreated(category) {
      if (category) {
        this.form.category = category.id;
      }
    },
    onGroupCreated(group) {
      if (group) {
        this.form.group = group.id;
      }
    },
    openCategoryCreateModal() {
      this.$refs.categoryModal.openModal('create');
    },
    openGroupCreateModal() {
      this.$refs.groupModal.openModal('create');
    },
    closeModal() {
      this.$v.form.$reset();
      Object.assign(this.form, {
        name: '',
        macAddress: '',
        category: '',
        group: '',
        field1: '',
        field2: '',
      });
      if (this.hasChanges) {
        this.$emit('finished');
      }
      this.dialog = false;
    },
    formatMacAddress() {
      this.$set(
        this.form,
        'macAddress',
        macAddressValidator.computed.formatMacAddress(this.form.macAddress)
      );
    },
    async editExisting() {
      this.editDialog = false;
      this.$emit('editModalMode');
      this.closeModal();
      if (this.existingTag.site.id !== this.currentSiteId) {
        this.setCurrentSiteId({siteId: this.existingTag.site.id});
      }
      this.openModal(this.existingTag);
    },
    async saveDevice() {
      this.$v.$touch();
      if (!this.$v.form.$anyError) {
        let device = this.mapDeviceData();
        try {
          let resp;
          this.modalMode === 'edit'
            ? (resp = await this.editTag({ device }))
            : (resp = await this.createTag({ device }));
          if (resp && resp.status === 409 && this.modalMode === 'create') {
            try {
              this.existingTag = await this.getTag(device.macAddress);
              let editedTagSiteId = this.existingTag.site.id;
              if (!this.sites.find(s => s.id === editedTagSiteId)) {
                this.$toasted.show(this.$t('tag-belongs-to-different-org'), {
                position: 'bottom-right',
                className: ['toast-error'],
                action: {
                  text: this.$t('get-help'),
                  onClick: () => {
                    let mailAnchor = document.createElement("a");
                    mailAnchor.href = "mailto:support@airfinder.com";
                    mailAnchor.click();
                  },
                },
              });
              }else {
                this.editDialog = true;
                this.existingTagTitle = resp && resp.data && resp.data.message;
              } 
            } catch (error) {
              this.$toasted.show(error, {
              position: 'bottom-right',
              className: ['toast-error'],
              duration: 5000,
            });
            }
          } else {
            let msg;
            this.modalMode === 'create'
              ? (msg = 'devices-page-device-created')
              : (msg = 'devices-page-device-edited');
            this.$toasted.show(this.$t(msg), {
              position: 'bottom-right',
              className: ['toast-success'],
              duration: 2000,
            });
            if (this.addAnother) {
              this.hasChanges = true;
              this.form.macAddress = '';              
              this.form.name = '';
              this.$v.form.$reset();
            }else{
              this.$emit('finished');
              this.closeModal();
            }
          }
        } catch (error) {
          this.$toasted.show(error, {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });
        }
      }
    },
    mapDeviceData() {
      let category = this.form.category;
      let group = this.form.group;
      let device = {
        description: this.form.name,
        siteId: this.currentSiteId,
      };
      if (this.modalMode === 'create') {
        device.macAddress = this.form.macAddress.replace(/\s/g, '');
      } else {
        device.id = this.form.id;
      }
      if (group) {
        if (this.modalMode === 'create') {
          device.groups = [group];
        } else {
          device.groupId_0 = group;
        }
      } else if (this.modalMode === 'edit') {
        device.groupId_0 = null;
      }
      if (category) {
        device.categoryId = category;
      } else if(this.modalMode === 'edit') {
        device.categoryId = null;
      }
      device.field1 = this.form.field1;
      device.field2 = this.form.field2;
      return device;
    },
  },
};
</script>
<style lang="scss" scoped>
#deviceEditForm {
  padding-top: 2rem;
}
.add-btn {
    min-height: inherit;
    max-height: 20px;
    max-width: 20px;
    min-width: 20px !important;
    position: absolute;
    right: 2px;
    top: 28px;
    i {
      font-size: 19px;
    }
}
.pos-relative {
  position: relative;
}
</style>