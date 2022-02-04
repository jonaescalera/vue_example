<template>
  <div>
    <v-dialog v-model="dialog" width="413" scrollable>
      <v-card id="siteEdit">
        <v-card-title v-if="modalMode === 'create'" class="secondary">{{$t('add-site')}}</v-card-title>
        <v-card-title v-if="modalMode === 'edit'" class="secondary">{{$t('edit-site')}}</v-card-title>
        <v-card-text>
          <v-form @submit.stop.prevent id="siteEditForm">
            <v-row justify="center">
              <v-col cols="11">
                <!-- name -->
                <v-text-field
                  :label="$t('name')"
                  tabindex="1"
                  :dense="true"
                  v-model="form.name"
                  outlined
                  :error-messages="nameErrors"
                  @input="$v.form.name.$touch()"
                  @blur="$v.form.name.$touch()"
                  color="secondary"
                ></v-text-field>
              </v-col>
               <v-col cols="11" class="pb-0">
                <!-- org -->
                <v-select
                  v-if="modalMode === 'edit' && organizations.length > 0"
                  :label="$t('site-assigned-org')"
                  tabindex="2"
                  :dense="true"
                  :items="organizations"
                  item-text="name"
                  item-value="id"
                  v-model="form.organizationId"
                  outlined
                  color="secondary"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-radio-group :disabled="modalMode === 'edit'" v-model="form.siteType" class="site-options">
                  <v-row class="ml-1">
                    <v-col class="pb-0">
                      <v-radio :label="$t('site-type-indoor')" :value="'indoor'" color="secondary"></v-radio>
                        <v-row class="ml-1">
                          <v-col>
                            <v-radio-group v-model="form.onSite" :disabled="form.siteType === 'outdoor'" class="on-site-options">
                              <v-radio :label="$t('site-type-indoor-af2')" :value="'af2'" color="secondary"></v-radio>
                              <v-radio :label="$t('site-type-indoor-af3')" :value="'af3'" color="secondary"></v-radio>
                            </v-radio-group>
                          </v-col>
                        </v-row>
                    </v-col>
                    <v-col>
                      <v-radio :label="$t('site-type-outdoor')" :value="'outdoor'" color="secondary"></v-radio>
                    </v-col>
                  </v-row>
                </v-radio-group>
              </v-col>
              <v-col cols="6" class="pr-0" v-if="showConfigMenu">
                <h3>{{$t('events-menu')}}</h3>
                <v-checkbox
                  v-model="form.isWorkflowEnable"
                  :label="$t('enable-workflows')"
                  color="secondary"
                ></v-checkbox>
                <v-checkbox
                  v-model="form.isReportsEnable"
                  :label="$t('enable-reports')"
                  color="secondary"
                  class="mt-0"
                ></v-checkbox>
              </v-col>
              <v-col cols="6" class="pr-0" v-if="showConfigMenu">
                <h3>{{$t('analytics-menu')}}</h3>
                <v-checkbox
                  v-model="form.isCustomReportsEnable"
                  :label="$t('enable-analytics')"
                  color="secondary"
                ></v-checkbox>
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
              @click="editSiteFn"
              class="px-8 float-right"
            >{{$t('save')}}</v-btn>
            <v-btn
              v-if="modalMode === 'create'"
              depressed
              color="secondary"
              tabindex="3"
              @click="createSiteFn"
              class="px-8 float-right"
            >{{$t('add')}}</v-btn>
            <v-btn
              text
              color="secondary"
              tabindex="3"
              @click="resetForm"
              class="px-8 mr-2 float-right"
            >{{$t('cancel')}}</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { SITE_TYPES, INDOOR_TYPES } from '../../constants/site';
import { ROLES } from '../../constants/roles'

export default {
  data() {
    return {
      dialog: false,
      selectedSite: null,
      form: {
        name: '',
        organizationId: '',
        siteType: SITE_TYPES.INDOOR,
        onSite: INDOOR_TYPES.AF2,
        workflows: false,
        reports: false,
        isCustomReportsEnable: false,
        isReportsEnable: false,
        isWorkflowEnable: false
      },
      showConfigMenu: false
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      name: {
        required,
      },
      siteType: {
        required
      },
      onSite: {
        required: requiredIf(function(values) {
          return values.siteType === SITE_TYPES.INDOOR
        })
      }
    },
  },
  props: ['modalMode'],
  computed: {
    ...mapGetters('organization', ['organizations', 'userRole', 'currentOrganization']),
    ...mapGetters('site', ['currentSite']),
    nameErrors() {
      const errors = [];
      if (!this.$v.form.name.$dirty) return errors;
      !this.$v.form.name.required &&
        errors.push(this.$t('error-name-required'));
      return errors;
    },
  },
  methods: {
    ...mapActions('site', ['createSite', 'editSite']),
    ...mapMutations('site', ['setCurrentSite']),
    async openModal(site) {
      this.showConfigMenu = false;
      this.dialog = true;
      if(this.currentOrganization.isOrgCustomReportsEnable === true){
          if(this.userRole && (this.userRole.assetInfo.metadata.props.role === ROLES.SUPER_ADMIN || this.userRole.assetInfo.metadata.props.role === ROLES.ADMIN )){
            this.showConfigMenu = true;
          }
        }/* for Admin siteUser we need to have the siteRole in the getSites endpoint in order to show the option for edit a site in the sites page,
            now the Admin siteUser has no access to this */
      if (site) {
        this.selectedSite = site;
        let siteType = site.isEverywhere ? SITE_TYPES.OUTDOOR : SITE_TYPES.INDOOR;
        let onSiteType = site.isAf3? INDOOR_TYPES.AF3 : INDOOR_TYPES.AF2;
        Object.assign(this.form, {
        name: site.value,
        organizationId: site.organizationId,
        siteType: siteType,
        onSite: onSiteType,
        isCustomReportsEnable: site.isCustomReportsEnable,
        isReportsEnable: site.isReportsEnable,
        isWorkflowEnable: site.isWorkflowEnable
      });
      } else {
        Object.assign(this.form, {
          name: '',
          isCustomReportsEnable: false,
          isReportsEnable: false,
          isWorkflowEnable: false
        });
      }
    },
    resetForm() {
      this.$v.form.$reset();
      Object.assign(this.form, {
        name: '',
        siteType: SITE_TYPES.INDOOR,
        onSite: INDOOR_TYPES.AF2,
        isCustomReportsEnable: false,
        isReportsEnable: false,
        isWorkflowEnable: false
      });
      this.dialog = false;
    },
    async editSiteFn() {
      this.$v.$touch();
      if (!this.$v.form.$anyError && this.modalMode === 'edit') {
        const { name, organizationId, isCustomReportsEnable, isReportsEnable, isWorkflowEnable } = this.form;
        const isAf2 = this.form.siteType === SITE_TYPES.INDOOR && this.form.onSite === INDOOR_TYPES.AF2;
        const isAf3 = this.form.siteType === SITE_TYPES.INDOOR && this.form.onSite === INDOOR_TYPES.AF3;
        const isEverywhere = this.form.siteType === SITE_TYPES.OUTDOOR;
        const site = {
          name: name,
          organizationId: organizationId,
          isAf2: isAf2 || undefined,
          isAf3: isAf3 || undefined,
          isEverywhere: isEverywhere || undefined
        }
        if(this.userRole && (this.userRole.assetInfo.metadata.props.role === ROLES.SUPER_ADMIN || this.userRole.assetInfo.metadata.props.role === ROLES.ADMIN )){
          Object.assign(site, { 
            isCustomReportsEnable: isCustomReportsEnable,
            isReportsEnable: isReportsEnable,
            isWorkflowEnable: isWorkflowEnable
          });
        }
        const siteId = this.selectedSite.id;
        try {
          await this.editSite({ siteId, site });
          this.$toasted.show(this.$t('site-edited'), {
              position: 'bottom-right',
              className: ['toast-success'],
              duration: 2000,
            });
            if(this.currentSite.id === siteId){
              if(this.currentSite.organizationId !== site.organizationId){
                this.setCurrentSite({});
              }else{
                this.$emit('finishedEdit', true);
              }
            }
            this.$emit('finishedEdit');
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
    async createSiteFn() {
      this.$v.$touch();
      if (!this.$v.form.$anyError && this.modalMode === 'create') {
        const { name, isCustomReportsEnable, isReportsEnable, isWorkflowEnable } = this.form;
        const isAf2 = this.form.siteType === SITE_TYPES.INDOOR && this.form.onSite === INDOOR_TYPES.AF2;
        const isAf3 = this.form.siteType === SITE_TYPES.INDOOR && this.form.onSite === INDOOR_TYPES.AF3;
        const isEverywhere = this.form.siteType === SITE_TYPES.OUTDOOR;
        const site = {
          configValue: name,
          properties: {
            organizationId: localStorage.getItem('orgId'),
            isAf2: isAf2 || undefined,
            isAf3: isAf3 || undefined,
            isEverywhere: isEverywhere || undefined,
            isCustomReportsEnable: isCustomReportsEnable,
            isReportsEnable: isReportsEnable,
            isWorkflowEnable: isWorkflowEnable
          }
        };
        try {
          await this.createSite({ site })
            this.$toasted.show(this.$t('site-created'), {
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
<style scoped lang="scss">
#siteEditForm {
  padding-top: 2rem;
}
.site-options{
  margin-top: -25px;
}
.on-site-options{
  margin-top: -5px;
}
</style>