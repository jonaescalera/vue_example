<template>
  <div id="users" ref="users">
    <v-row>
      <v-col class="custom-card px-0 pa-0 card-no-footer-height">
        <v-row class="mb-3" style="height: 40px;">
            <!-- search bar -->
            <search-bar @searchText="search" :placeholder="$t('users-page-search-placeholder')"/>
            <v-col cols="8">
              <v-switch
                v-if="isOrgAdmin"
                class="mt-1 ml-2 float-left switcher"
                v-model="organizationUsers"
                inset
                color="secondary"
                :label="$t('users-page-org-users')"
              ></v-switch>
              <div class="mr-3 right-btn-container" v-if="isAdmin">
                <v-btn id="add-asset" height="32" :depressed="true" @click="createUser" class="primary--text font-weight-bold" color="primaryLight">{{$t('users-page-add-user')}}</v-btn>
              </div>
            </v-col>
        </v-row>
        <!-- Grid component -->
        <DataTable 
          :settings="settings" 
          name="users"
          :resizeRef="$refs.users"
          :columns="columnDefs" 
          :rows="filteredUsers"
          :customTableContainerClass="'users-page'"
          :confirmDeleteModalBody="'delete-user-selection'"
          :confirmDeleteModalTitle="'delete-user-selection-title'"
          @onDeleteSelection="deleteSelectedUsers"
          @onExport="downloadCsv"
        ></DataTable>
      </v-col>
    </v-row>
    <new-edit-modal ref="newEditModal" @finishedEdit="finished" @finishedCreate="finished" :modalMode='createEdit'/>
    <v-dialog v-model="confirmationDeleteDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">{{$t('users-page-delete-user')}}</v-card-title>
        <v-card-text v-if="userToDelete" class="mt-3">{{$t('delete-are-you-sure', { name: userToDelete.email})}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn height="32" text color="secondary" @click="confirmationDeleteDialog = false" class="primary--text font-weight-bold">{{$t('cancel')}}</v-btn>
          <v-btn depressed color="secondary" @click="confirmDelete" class="px-8 float-right">{{$t('yes')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="invitationLinkDialog" max-width="1000">
      <v-card>
        <v-card-title class="headline">{{
          $t('invitation-link')
        }}</v-card-title>
        <v-card-text class="mt-3">
          <span v-if="invitationLink">{{invitationLink}}<v-icon @click="copyToClipboard" class="ml-3">mdi-clipboard-multiple-outline</v-icon></span>
          <span v-else-if="messageLink">{{messageLink}}</span>
        </v-card-text>
          
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            depressed
            color="secondary"
            @click="invitationLinkDialog = false; messageLink = ''"
            class="px-8 float-right"
            >{{ $t('close') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>

import { mapActions, mapGetters } from 'vuex';
import SearchBar from "../../components/search-bar/search-bar"
import { ROLES } from '../../constants/roles';
import DataTable from "../../components/shared/data-table/data-table.vue"
import UserNewEdit from '../../components/users/user-new-edit'
import StatusComponent from "../../components/shared/data-table/custom-cells/status"
import { csvMixin } from "../../mixins/csvExport"
import UserModel from '../../models/userModel';

export default {
  name: "Users",
  components: {
    DataTable,
    StatusComponent,
    'new-edit-modal': UserNewEdit,
    "search-bar": SearchBar
  },
  data() {
    return {
      createEdit: 'create',
      columnDefs: null,
      searchValue: '',
      editedRow: {},
      settings: {
            noPagination: true,
            actionsPanel: true,
            noPagination: true,
            moreActions: [],
          },
      confirmationDeleteDialog: false,
      userToDelete: null,
      organizationUsers: false,
      invitationLinkDialog: false,
      messageLink: '',
      invitationLink: ''
    };
  },
  computed: {
    ...mapGetters('site', ['currentSiteId', 'siteUserRole']),
    ...mapGetters('configurationUser', ['users']),
    ...mapGetters('organization', ['userRole', 'orgSelected']),
    filteredUsers() {
      if (this.searchValue) {
        return this.users.filter(u => {
          return u.email
          .toLowerCase()
          .replace(' ', '')
          .includes(this.searchValue.toLowerCase().replace(/%20/g, ''));
        });
      } else {
        return this.users
      }
    },
    isOrgAdmin(){
      return this.userRole && (this.userRole.assetInfo.metadata.props.role === ROLES.SUPER_ADMIN || this.userRole.assetInfo.metadata.props.role === ROLES.ADMIN);
    },
    isAdmin(){
      //check the user role (Admin SiteUser or Admin OrgUser or SuperAdmin)
      if(this.isOrgAdmin || (this.siteUserRole && this.siteUserRole.assetInfo.metadata.props.Admin === 'true')){
         return true;
      }else{
        return false;
      }
    }
  },
  mixins: [csvMixin],
  watch: {
    currentSiteId(){
      this.organizationUsers = false;
      this.fetchUsers(this.currentSiteId);    
    },
    siteUserRole() {
      this.setSettingsMoreActions();
    },
    organizationUsers(){
      if(this.organizationUsers){
        this.fetchOrgUsers();
        this.settings.moreActions= [
          {
            name: this.$t('view-invite'),
            fn: this.viewInvite,
            icon: 'email-search',
          },
          {
            name: this.$t('resend-invite'),
            fn: this.resendInvite,
            icon: 'email-sync',
          },
          {
            name: this.$t('resend-forgot-password'),
            fn: this.resendForgotPassword,
            icon: 'email-lock',
          },
          { 
            name: this.$t('table-delete'),
            fn: this.delete,
            icon: 'delete'
          }
        ];
        this.settings.actionsPanel = false;
      }else{
        this.fetchUsers(this.currentSiteId);
        this.settings.moreActions= [
          {
            name: this.$t('table-edit'),
            fn: this.edit,
            icon: 'pen',
          },
          {
            name: this.$t('view-invite'),
            fn: this.viewInvite,
            icon: 'email-search',
          },
          {
            name: this.$t('resend-invite'),
            fn: this.resendInvite,
            icon: 'email-sync',
          },
          {
            name: this.$t('resend-forgot-password'),
            fn: this.resendForgotPassword,
            icon: 'email-lock',
          },
          {
            name: this.$t('table-delete'),
            fn: this.delete,
            icon: 'delete',
          },
        ]
        this.settings.actionsPanel = true;
      }
    }
  },
  mounted() {
    this.setSettingsMoreActions();
    this.fetchUsers(this.currentSiteId);    
  },
  beforeMount() {
    this.columnDefs = [
      {
        name: this.$t('users-page-email'),
        field: "email",
        type: "data",
        width: "20%"
      },
      { 
        name: this.$t('users-page-role'), 
        field: "role", 
        type: "data",
        capitalizeStyle: true
      },
      { 
        name: this.$t('users-page-add-tags'), 
        field: "userPermissions.AddTags", 
        type: "renderObject",
        cellRenderer: StatusComponent,
        renderParams: { 'isTrue': this.$t('data-table-allowed'), 'isFalse': this.$t('data-table-not-allowed')}
      },
      { 
        name: this.$t('users-page-edit-delete-tags'), 
        field: "userPermissions.EditDeleteTags", 
        type: "renderObject",
        cellRenderer: StatusComponent,
        renderParams: { 'isTrue': this.$t('data-table-allowed'), 'isFalse': this.$t('data-table-not-allowed')}
      },
      { 
        name: this.$t('users-page-edit-delete-group-categories'), 
        field: "userPermissions.EditDeleteGroupsCategories", 
        type: "renderObject",
        cellRenderer: StatusComponent,
        renderParams: { 'isTrue': this.$t('data-table-allowed'), 'isFalse': this.$t('data-table-not-allowed')}
      },
      { 
        name: this.$t('users-page-status'), 
        field: "userPermissions.Status",
        type: "renderObject",
        cellRenderer: StatusComponent,
        renderParams: { 'isTrue': this.$t('data-table-allowed'), 'isFalse': this.$t('data-table-not-allowed')}
      }
    ];
  },

  methods: {
    ...mapActions('configurationUser', [
      'getConfigurationUsers', 
      'getConfigurationOrgUsers', 
      'deleteConfigurationUser', 
      'deleteConfigurationUsers', 
      'deleteConfigurationOrgUser',
      'viewInviteLink',
      'resendInviteLink']),
    edit(row) {
      this.createEdit = 'edit'
      this.editedRow = row;      
      this.$refs.newEditModal.openModal(row);
    },
    createUser() {
      if(this.organizationUsers){
        this.createEdit = 'createOrgUser'
      }else{
        this.createEdit = 'create'
      }
      this.$refs.newEditModal.openModal();
    },
    delete(user) {
      this.confirmationDeleteDialog = true;
      this.userToDelete = user;
    },
    async copyToClipboard() {
      await navigator.clipboard.writeText(this.invitationLink) 
      this.$toasted.show(this.$t('link-copied-to-clipboard'), { 
        position: "bottom-right",
        className: ['toast-success'],
        duration : 1500
      });
    },
    async confirmDelete() {
      try {
        if(this.organizationUsers){
          const data = {orgId: this.orgSelected, userId: this.userToDelete.email};
          await this.deleteConfigurationOrgUser({ data });
          this.fetchOrgUsers();
        }else{
          const userId = this.userToDelete.id
          await this.deleteConfigurationUser({ userId });
          this.fetchUsers(this.currentSiteId);
        }
        this.$toasted.show(this.$t('users-page-user-deleted'), { 
          position: "bottom-right",
          className: ['toast-success'], 
          duration : 1500
        });
        this.confirmationDeleteDialog = false;
      } catch (error) {
        this.$toasted.show(error, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
        this.confirmationDeleteDialog = false;
        if(this.organizationUsers){
          this.fetchOrgUsers();
        }else{
          this.fetchUsers(this.currentSiteId);
        }
      }
    },
    finished(){
      if(this.organizationUsers){
        this.fetchOrgUsers();
      }else{
        this.fetchUsers(this.currentSiteId);
      }
    },
    async fetchUsers(siteId) {
      if (siteId) {
        await this.getConfigurationUsers( {siteId} );
      }
    },
    async fetchOrgUsers() {
      let orgId = this.userRole.assetInfo.metadata.props.organizationId;
      await this.getConfigurationOrgUsers({orgId});
    },
    async deleteSelectedUsers(users) {
      let userIds = [];      
      try {
        users.forEach(user => {
          userIds.push(user.id);
        });
        await this.deleteConfigurationUsers({ userIds });
        this.$toasted.show(userIds.length + ' ' + this.$t('users-page-users-deleted'), { 
          position: "bottom-right",
          className: ['toast-success'], 
          action : {
              text : this.$t('ok'),
              onClick : (e, toastObject) => {
                  toastObject.goAway(0);
              }
            },
        });
        this.fetchUsers(this.currentSiteId);
      } catch (error) {
        this.$toasted.show(error, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
      }
    },
    search(str) {
      this.searchValue = str;
    },
    setSettingsMoreActions() {
      if (this.isAdmin) {
        this.settings.moreActions = [
          {
            name: this.$t('table-edit'),
            fn: this.edit,
            icon: 'pen',
          },
          {
            name: this.$t('view-invite'),
            fn: this.viewInvite,
            icon: 'email-search',
          },
          {
            name: this.$t('resend-invite'),
            fn: this.resendInvite,
            icon: 'email-sync',
          },
          {
            name: this.$t('resend-forgot-password'),
            fn: this.resendForgotPassword,
            icon: 'email-lock',
          },
          {
            name: this.$t('table-delete'),
            fn: this.delete,
            icon: 'delete',
          },
        ]
      }
      else{
        this.settings.moreActions = [
          {
            name: this.$t('resend-forgot-password'),
            fn: this.resendForgotPassword,
            icon: 'email-lock',
          }
        ]
      }
    },
    async viewInvite(user) {
      let orgIdFromStorage = localStorage.getItem('orgId');
      try {
        let resp = await this.viewInviteLink({email: user.email, siteId: user.siteId || this.currentSiteId, orgId: orgIdFromStorage})
        if (resp && resp.data && resp.data.verificationLink) {
          this.invitationLink = resp.data.verificationLink;
        }else{
          this.messageLink = this.$i18n.t('link-unavailable');
        }
        this.invitationLinkDialog = true;
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 1500,
        });
      }
    },
    async resendForgotPassword(user) {
      try {
        await this.$store.dispatch('forgot', {username: user.email})
        this.$toasted.show(this.$i18n.t('forgot-sent'), {
          position: 'bottom-right',
          className: ['toast-success'],
          duration: 1500,
        });
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 1500,
        });
      }
    },
    async resendInvite(user) {
      try {
        let resp = await this.resendInviteLink({email: user.email})
        if (resp && resp.data) {
          this.messageLink = this.$i18n.t('link-sent');
        }else{
          this.messageLink = this.$i18n.t('something-went-wrong-link');
        }
        this.invitationLinkDialog = true;
      } catch (error) {
       this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 1500,
        });
      }
    },
    downloadCsv(users) {
      let normalizedUsers = users.map((user)=> new UserModel().normalizeForCsv(user));
      if (normalizedUsers) {
        csvMixin.methods.csvExport(normalizedUsers, 'Users');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  .right-btn-container {
    height: 100%;
    float: right;
  }

  .headline {
    height: 48px;
    font-size: 18px !important;
    font-weight: 600;
    color: #3B5762;
  }

  //media queries
  @media (max-width: 812px) {
    .right-btn-container {
      float: none !important;
      margin-left: 13px;
    }
  }

  // IE styles
  @media all and (-ms-high-contrast:none) {
    .right-btn-container {
      padding-top: 2px;
    } 
  }
</style>