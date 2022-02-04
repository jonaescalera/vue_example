<template>
  <div id="subscriptions" ref="subscriptions">
    <v-row>
      <v-col class="custom-card px-0 pa-0 card-no-footer-height">
        <v-row class="mb-3" style="height: 40px;">
            <!-- search bar -->
            <search-bar @searchText="search" :placeholder="$t('search-by-subscription')"/>
            <v-col cols="8">
              <div class="mr-3 right-btn-container">
                <v-btn id="add-asset" height="32" :depressed="true" @click="createSubscription" class="primary--text font-weight-bold" color="primaryLight">Add Subscription</v-btn>
              </div>
            </v-col>
        </v-row>
        <!-- Grid component -->
        <DataTable 
          :settings="settings" 
          name="subscriptions"
          :resizeRef="$refs.subscriptions"
          :columns="columnDefs" 
          :rows="filteredSubscriptions"
          :customTableContainerClass="'users-page'"
          :confirmDeleteModalBody="'delete-user-selection'"
          :confirmDeleteModalTitle="'delete-user-selection-title'"
        ></DataTable>
      </v-col>
    </v-row>
    <SubscriptionView ref="subscriptionView"/>
    <SubscriptionNewEdit ref="newEditModal" @finished="finished"/>
    <v-dialog v-model="confirmationDeleteDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">{{$t('users-page-delete-user')}}</v-card-title>
        <v-card-text v-if="subscriptionToDelete" class="mt-3">{{$t('delete-are-you-sure', { name: subscriptionToDelete.username})}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn height="32" text color="secondary" @click="confirmationDeleteDialog = false" class="primary--text font-weight-bold">{{$t('cancel')}}</v-btn>
          <v-btn depressed color="secondary" @click="confirmDelete" class="px-8 float-right">{{$t('yes')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <ConfirmModal 
      :dialogModel="checkDialog" 
      :dialogTitle="selectedSubscription.isEnabled === 0 ? $t('enable-subscription') : $t('disable-subscription')"
      :dialogBody="selectedSubscription.isEnabled === 0 ? $t('enable-subscription-are-you-sure', {sub: selectedSubscription.username}) : $t('disable-subscription-are-you-sure', {sub: selectedSubscription.username})"
      @cancel="checkDialog = false"
      @confirm="handleConfirm"
      />
  </div>
</template>
<script>

import { mapActions, mapGetters } from 'vuex';
import SearchBar from "../../components/search-bar/search-bar"
import DataTable from "../../components/shared/data-table/data-table.vue"
import SubscriptionNewEdit from '../../components/subscriptions/subscription-new-edit.vue'
import StatusComponent from "../../components/shared/data-table/custom-cells/status"
import { csvMixin } from "../../mixins/csvExport"
import { generatePassword } from '../../mixins/uuid'
import SubscriptionView from '../../components/subscriptions/subscription-view.vue'
import ConfirmModal from '../../components/shared/modals/confirmModal.vue';

export default {
  name: "Users",
  components: {
    DataTable,
    SubscriptionView,
    ConfirmModal,
    StatusComponent,
    SubscriptionNewEdit,
    "search-bar": SearchBar
  },
  data() {
    return {
      columnDefs: null,
      searchValue: '',
      checkDialog: false,
      editedRow: {},
      selectedSubscription: {},
      settings: {
          noPagination: true,
          actionsPanel: false,
          moreActions: [
        {
          name: this.$t('view-details'),
          fn: this.viewDetails,
          icon: 'eye',
        },
        {
          name: this.$t('enable'),
          fn: this.openCheckModal,
          icon: 'check',
          condition: { 
              field: 'isEnabled',
              operator: '===',
              value: 0
          },
        },
        {
          name: this.$t('disable'),
          fn: this.openCheckModal,
          icon: 'close',
          condition: { 
              field: 'isEnabled',
              operator: '===',
              value: 1
          },
        },
        {
          name: this.$t('table-delete'),
          fn: this.delete,
          icon: 'delete',
        }],
      },
      confirmationDeleteDialog: false,
      subscriptionToDelete: null,
    };
  },
  computed: {
    ...mapGetters('subscriptions', ['subscriptions']),
    ...mapGetters('organization', ['orgSelected']),
    filteredSubscriptions() {
      if (this.searchValue) {
        return this.subscriptions.filter(u => {
          return u.username
          .toLowerCase()
          .replace(' ', '')
          .includes(this.searchValue.toLowerCase().replace(/%20/g, ''));
        });
      } else {
        return this.subscriptions
      }
    },
  },
  mixins: [csvMixin],
  mounted() {
    this.fetchSubscriptions();    
  },
  beforeMount() {
    this.columnDefs = [
      {
        name: 'Subscription Type',
        field: "subscriptionType",
        type: "data"
      },
      { 
        name: 'Username', 
        field: "username", 
        type: "data",
        capitalizeStyle: true
      },
    
      { 
        name: 'Enabled', 
        field: "isEnabled", 
        type: "renderObject",
        cellRenderer: StatusComponent,
        renderParams: { 'isTrue': 'Enabled', 'isFalse': 'Disabled'}
      },
    ];
  },

  methods: {
    ...mapActions('subscriptions', ['getSubscriptions', 'deleteSubscription', 'editSubscription']),
    async viewDetails(sub) {
      this.$refs.subscriptionView.openModal(sub)
    },
    openCheckModal(sub) {
      this.selectedSubscription = sub;
      this.checkDialog = true;
    },
    edit(row) {
      this.editedRow = row;      
      this.$refs.newEditModal.openModal(row);
    },
    createSubscription() {
      this.$refs.newEditModal.openModal('create');
    },
    async handleConfirm() {
      let sub = {
        mqttUsername: this.selectedSubscription.username,
        password: this.selectedSubscription.isEnabled === 0 ? generatePassword() : null,
        isEnable: this.selectedSubscription.isEnabled === 0 ? 1 : 0,
        organizationId: this.selectedSubscription.organizationId
      }
      try {
        await this.editSubscription(sub);
        this.fetchSubscriptions();
        this.$toasted.show(this.$t('subscription-edited'), { 
          position: "bottom-right",
          className: ['toast-success'], 
          duration : 1500
        });
      } catch (error) {
        this.$toasted.show(error, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
      }
      this.checkDialog = false;
      this.selectedSubscription = {};
    },
    delete(subscription) {
      this.confirmationDeleteDialog = true;
      this.subscriptionToDelete = subscription;
    },
    async confirmDelete() {
      try {
        const username = this.subscriptionToDelete.username
        let params = {
          orgId: this.orgSelected,
          username: username
        }
        await this.deleteSubscription(params);
        this.fetchSubscriptions();
        this.$toasted.show(this.$t('subscription-deleted'), { 
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
      }
    },
    finished(){
      this.fetchSubscriptions();
    },
    async fetchSubscriptions() {
      let orgId = this.orgSelected
      await this.getSubscriptions( {orgId} );
    },
    search(str) {
      this.searchValue = str;
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