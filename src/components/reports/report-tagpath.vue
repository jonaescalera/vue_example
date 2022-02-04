<template>
    <div>
        <v-row class="filters">
            <search-bar @searchText="searchBarFilter"/>
        </v-row>
        <DataTable
            :settings="settings"
            :columns="columnDefs"
            :rows="tags"
            name="tagPath"
            :totalRows="totalRows"
            :page="pagination.page"
            :pageSize="pagination.size"
            @onPaginationChange="onPaginationChange"
            :customTableContainerClass="'withFilters withActions'"
          ></DataTable>
        <ReportDateRangeDialog
            :title="'reports-tagpath-date'"
            @onGenerateReport="generateReport"
            ref="dateRangeModal">
        </ReportDateRangeDialog>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import DataTable from "../shared/data-table/data-table.vue"
import SearchBar from "../../components/search-bar/search-bar"
import ReportDateRangeDialog from "./report-date-range"
import { pageSize } from '../../constants/pagination';

export default {
    components: {
        DataTable,
        SearchBar,
        ReportDateRangeDialog
    },
    data(){
        return {
            pagination: {
                size: pageSize,
                page: 1
            },
            settings: {
                moreActions: [{
                    name: this.$i18n.t('reports-generate'),
                    fn: this.openDateRangeModal,
                    icon: 'file-download-outline'
                }]
            },
            selectedTag: null,
            searchText: ''
        }
    },
    watch:{
        currentSiteId() {
            this.fetchTags();
        }
    },
    beforeMount() {
        //define columns, TODO this can be loaded dynamically from JSON since it will come from a service in the future
        this.columnDefs = [
        {
            name: this.$i18n.t('reports-mac-address'),
            field: "macAddress",
            type: "data",
            width: "15%"
        },
        { 
            name: this.$i18n.t('assets-column-name'), 
            field: "name", 
            type: "data"
        }, 
        { 
            name: this.$i18n.t('assets-column-group'), 
            field: "groupName",
            type: "data"
        },
        { 
            name: this.$i18n.t('assets-column-category'), 
            field: "categoryName",
            type: "data"
        },
        { 
            name: this.$i18n.t('assets-column-field1'), 
            field: "field1",
            type: "data"
        },
        { 
            name: this.$i18n.t('assets-column-field2'), 
            field: "field2",
            type: "data"
        }
        ];
    },
    mounted(){
        this.fetchTags();
    },
    computed:{
        ...mapGetters('site', ['currentSiteId']),
        ...mapGetters('tag', ['tags', 'totalRows'])
    },
    methods: {
        ...mapActions('tag', ['getTags']),
        ...mapActions('report', ['generateTagPathReport']),
        openDateRangeModal(tag){
            this.selectedTag = tag;
            this.$refs.dateRangeModal.openModal();
        },
        fetchTags(){
            this.getTags({ siteId: this.currentSiteId, pagination: this.pagination });
        },
        async onPaginationChange(newPagination) {
            this.pagination.page = newPagination.page;
            this.pagination.size = newPagination.pageSize;
            this.fetchTags();
        },
        searchBarFilter(text){
            this.pagination.page = 1;

            if(text){
                this.searchText = '&search='+text;
                this.getTags({ siteId: this.currentSiteId, pagination: this.pagination, filters: this.searchText });
            }else{
                if(this.searchText){
                    this.searchText = '';
                    this.getTags({ siteId: this.currentSiteId, pagination: this.pagination });
                }
            }
        },
        async generateReport(dateRange){
            try{
                let report = await this.generateTagPathReport({tagId: this.selectedTag.id, start: dateRange.start, end: dateRange.end});
                let filename = 'tag-path-' + this.selectedTag.name.replace(/\s/,'_') + '-' + dateRange.start + '-' + dateRange.end;
                this.$emit('downloadReport', filename, report);
                this.$refs.dateRangeModal.closeModal();
            }catch (error){
                this.$toasted.show(error.data.message, { 
                    position: "bottom-right",
                    className: ['toast-error'], 
                    duration : 5000
                });
            }
        }
    }
}
</script>
<style scoped>
    .filters{
        height: 60px;
    }
</style>