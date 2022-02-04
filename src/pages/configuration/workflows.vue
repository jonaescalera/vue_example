<template>
  	<div id="workflows" ref="workflows">
    	<v-row>
      		<v-col class="custom-card px-0 pa-0">
                <v-row>
                    <v-col class="text-right mr-3 pb-0">
                        <v-btn id="add-workflow" height="32" :depressed="true" @click="createWorkflow" class="primary--text font-weight-bold" color="primaryLight">Add workflow</v-btn>
                    </v-col>
                </v-row>
                <WorkflowCreate ref="createModal" @creationFinished="fetchWorkflows"></WorkflowCreate>
      			<DataTable
                    :settings="settings"
                    name="workflows"
                    :resizeRef="$refs.workflows"
                    :columns="columnDefs"
                    :rows="workflows"
                    :totalRows="totalRows"
                    :page="pagination.page"
                    :pageSize="pagination.size"
                    @onPaginationChange="onPaginationChange"
                    :customTableContainerClass="'withoutFilters'">
                </DataTable>
      		</v-col>
	  	</v-row>
        <WorkflowEdit ref="editModal" @editionFinished="fetchWorkflows"></WorkflowEdit>
        <confirmDeleteModal
            @confirm="onConfirmDelete"
            @cancel="confirmDeleteModal = false"
            :dialogModel="confirmDeleteModal"
            :dialogTitle="$t('workflow-delete')"
            :dialogBody="$t('delete-are-you-sure', { name: currentWorkflow.name })">
        </confirmDeleteModal>
	</div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import DataTable from "../../components/shared/data-table/data-table.vue"
import ConfirmDeleteModal from '../../components/shared/modals/confirmModal';
import WorkflowCreate from "../../components/workflow/workflow-create"
import WorkflowEdit from '../../components/workflow/workflow-edit.vue';
import { pageSize } from '../../constants/pagination';

export default{
    name: "Workflows",
    components: {
        DataTable,
        ConfirmDeleteModal,
        WorkflowCreate,
        WorkflowEdit
    },
    data() {
        return {
            columnDefs: null,
            confirmDeleteModal: false,
            currentWorkflow: {},
            workflows: [],
            settings: {
                moreActions: [
                {
                    name: this.$t('table-edit'),
                    fn: this.editWorkflow,
                    icon: 'pen'
                },
                {
                    name: this.$t('table-delete'),
                    fn: this.deleteSelectedWorkflow,
                    icon: 'delete'
                }
                ],
            },
            pagination: {
                size: pageSize,
                page: 1
            },
            totalRows: 0
        }
    },
    watch:{
        currentSiteId(siteId){
            this.fetchWorkflows();
        }
    },
    beforeMount() {
        //define columns, TODO this can be loaded dynamically from JSON since it will come from a service in the future
        this.columnDefs = [
            {
                name: this.$i18n.t('workflow-column-name'),
                field: "name",
                type: "data"
            },
            { 
                name: this.$i18n.t('workflow-column-enabled'), 
                field: "enabled", 
                type: "bool",
                width: "10%"
            }, 
            { 
                name: this.$i18n.t('workflow-column-type'), 
                field: "type",
                type: "data",
                width: "10%"
            },
            { 
                name: this.$i18n.t('workflow-column-criteria'), 
                field: "criteria",
                type: "data"
            },
            {
                name: this.$i18n.t('workflow-column-tags'),
                field: "tags",
                type: "data"
            },
            { 
                name: this.$i18n.t('workflow-column-notify'), 
                field: "notify",
                type: "data"
            }
        ];
    },
    mounted(){
        if(this.currentSiteId){
            this.fetchWorkflows();
        }
    },
    computed: {
        ...mapGetters('site', ['currentSiteId']),
    },
    methods:{
        ...mapActions('workflow', ['getWorkflows', 'deleteWorkflow']),
        async fetchWorkflows(){
            try{
                const response = await this.getWorkflows({siteId: this.currentSiteId, pagination: this.pagination, sorting: this.sorting });
                this.workflows = response.workflows;
                this.totalRows = response.totalItems;
            }catch{
                this.workflows = [];
                this.totalRows = 0;
            }
        },
        createWorkflow(){
            this.$refs.createModal.openWizard();
        },
        editWorkflow(row){
            this.$refs.editModal.openModal(row);
        },
        deleteSelectedWorkflow(row){
            this.currentWorkflow = row;
            this.confirmDeleteModal = true;
        },
        async onConfirmDelete(){
            try{
                await this.deleteWorkflow(this.currentWorkflow.id);
                this.$toasted.show(this.$t('workflow-deleted'), { 
                    position: "bottom-right",
                    className: ['toast-success'], 
                    duration : 3000
                });
                this.confirmDeleteModal = false;
                this.fetchWorkflows();
            }catch (error){
                this.$toasted.show(error.data.message, { 
                position: "bottom-right",
                className: ['toast-error'], 
                duration : 5000
                });
            }
        },
        onPaginationChange(newPagination){
            this.pagination.page = newPagination.page;
            this.pagination.size = newPagination.pageSize;
            this.fetchWorkflows();
        }
    }
}
    
</script>