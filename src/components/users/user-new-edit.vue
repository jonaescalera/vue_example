<template>
  <div>
    <v-dialog v-model="dialog" width="413" scrollable>
      <v-card id="userEdit">
        <v-card-title v-if="modalMode === 'create' || modalMode === 'createOrgUser'" class="secondary">{{$t('users-page-add-user')}}</v-card-title>
        <v-card-title v-if="modalMode === 'edit'" class="secondary">{{$t('users-page-edit-user')}}</v-card-title>
        <v-card-text>
          <v-form @submit.stop.prevent id="userEditForm" ref="userForm">
            <v-row justify="center">
              <v-col cols="11">
                <!-- email -->
                <v-text-field
                  :label="$t('users-edit-create-email')"
                  tabindex="1"
                  v-model="form.email"
                  :dense="true"
                  outlined
                  required
                  :disabled="modalMode === 'edit'"
                  color="secondary"
                  :error-messages="emailErrors"
                  @input="$v.form.email.$touch()"
                  @blur="$v.form.email.$touch()"
                ></v-text-field>
                <!-- user role -->
                <v-select
                  class="d-flex"
                  v-model="form.role"
                  :items="modalMode === 'createOrgUser' ? rolesListOrg : rolesList"
                  item-value="id"
                  item-text="name"
                  :label="$t('users-edit-create-role')"
                  tabindex="2"
                  :dense="true"
                  outlined
                  required
                  color="secondary"
                  :error-messages="roleErrors"
                ></v-select>
                <!-- site -->
                <v-text-field
                  v-if= "!(modalMode === 'createOrgUser')"
                  :label="$t('users-edit-create-site')"
                  tabindex="3"
                  v-model="form.siteName"
                  :dense="true"
                  outlined
                  disabled
                  color="secondary"
                ></v-text-field>
                <!-- permissions -->
                <v-card class="form-perm-card" v-if= "!(modalMode === 'createOrgUser')">
                  <header>{{$t('users-edit-create-permissions')}}</header>
                  <v-switch v-model="form.addTags" :label="$t('users-page-add-tags')"></v-switch>
                  <v-switch v-model="form.editDeleteTags" :label="$t('users-page-edit-delete-tags')"></v-switch>
                  <v-switch
                    v-model="form.editDeleteGroupsCategories"
                    :label="$t('users-page-edit-delete-group-categories')"
                  ></v-switch>
                  <v-switch v-model="form.status" :label="$t('users-page-status')"></v-switch>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-col cols="11">
            <v-btn
              v-if="modalMode === 'edit'"
              depressed
              color="secondary"
              tabindex="5"
              @click="saveUser"
              class="px-8 float-right"
            >{{$t('save')}}</v-btn>
            <v-btn
              v-if="modalMode === 'create' || modalMode === 'createOrgUser'"
              depressed
              color="secondary"
              tabindex="5"
              @click="createUser"
              class="px-8 float-right"
            >{{$t('add')}}</v-btn>
            <v-btn
              text
              color="secondary"
              tabindex="4"
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
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { required, email } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { ROLES } from '../../constants/roles';

export default {
  data() {
    return {
      dialog: false,
      roles: ROLES,
      form: {
        role: null,
        email: '',
        siteName: this.currentSiteName,
        addTags: false,
        aditDeleteGroupsCategories: false,
        editDeleteTags: false,
        status: false,
      },
      rolesList: [ROLES.ADMIN, ROLES.USER],
      rolesListOrg: [ROLES.ADMIN, ROLES.GENERAL, ROLES.TECHNICAL]
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      email: {
        required,
        email,
      },
      role: {
        required
      }
    },
  },
  props: ['modalMode'],
  computed: {
    ...mapGetters('site', ['currentSiteName', 'currentSiteId']),
    ...mapGetters('organization', ['orgSelected']),
    emailErrors() {
      const errors = [];
      if (!this.$v.form.email.$dirty) return errors;
      !this.$v.form.email.required &&
        errors.push(this.$t('error-email-required'));
      !this.$v.form.email.email && errors.push(this.$t('error-email-invalid'));
      return errors;
    },
    roleErrors() {
      const errors = [];
      if (!this.$v.form.role.$dirty) return errors;
      !this.$v.form.role.required &&
        errors.push(this.$t('error-role-required'));
      return errors;
    }
  },
  methods: {
    ...mapActions('configurationUser', [
      'editConfigurationUser',
      'createConfigurationUser',
      'createOrgConfigurationUser'
    ]),
    openModal(user) {
      this.dialog = true;
      if (user) {
        Object.assign(this.form, {
          role: user.role,
          site: this.currentSiteId,
          siteName: this.currentSiteName,
          addTags: user.userPermissions?.AddTags,
          editDeleteGroupsCategories:
          user.userPermissions?.EditDeleteGroupsCategories,
          editDeleteTags: user.userPermissions?.EditDeleteTags,
          status: user.userPermissions?.Status,
          email: user.email,
          id: user.id,
        });
      } else {
        Object.assign(this.form, {
          site: this.currentSiteId,
          siteName: this.currentSiteName,
          addTags: false,
          editDeleteGroupsCategories: false,
          editDeleteTags: false,
          status: false,
          email: '',
          role: null
        });
      }
    },

    resetForm() {
      this.$v.form.$reset();
      this.dialog = false;
    },

    saveUser() {
      this.$v.$touch();
      if (!this.$v.form.$anyError) {
        const {
          role,
          addTags,
          editDeleteGroupsCategories,
          editDeleteTags,
          status,
          id,
        } = this.form;
        const user = {
          Admin: role === this.roles.ADMIN ? true : false,
          AddTags: addTags,
          EditDeleteGroupsCategories: editDeleteGroupsCategories,
          EditDeleteTags: editDeleteTags,
          Status: status,
          siteId: this.currentSiteId,
        };
        if (this.modalMode === 'edit') {
          this.editUser(user, id);
        }
      }
    },
    async editUser(data, userId) {
      try {
        let resp = await this.editConfigurationUser({ data, userId });
        this.$toasted.show(this.$t('users-page-user-edited'), {
          position: 'bottom-right',
          className: ['toast-success'],
          duration: 2000,
        });
        this.$emit('finishedEdit');
        this.resetForm();
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
      }
    },
    async createUser() {
      this.$v.$touch();
      if (!this.$v.form.$anyError) {
        const {
          role,
          email,
          addTags,
          editDeleteGroupsCategories,
          editDeleteTags,
          status,
          id,
        } = this.form;
        let data = {}
        if(this.modalMode === 'create'){
          data = {
            email: email,
            permissions: {
              Admin: role === this.roles.ADMIN ? true : false,
              AddTags: addTags,
              EditDeleteGroupsCategories: editDeleteGroupsCategories,
              EditDeleteTags: editDeleteTags,
              Status: status,
            },
            sites: [this.currentSiteId],
          };
        }else{
          if(this.modalMode === 'createOrgUser'){
            data = {
              form: {
                username: email,
                role: role
              },
              orgID: this.orgSelected
            }
          }
        }
        try {
          if(this.modalMode === 'create'){
            await this.createConfigurationUser({ data });
          }else{
            await this.createOrgConfigurationUser({ data });
          }
          this.$toasted.show(this.$t('users-page-user-created'), {
            position: 'bottom-right',
            className: ['toast-success'],
            duration: 2000,
          });
          this.$emit('finishedCreate');
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