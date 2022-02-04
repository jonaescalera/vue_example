<template>
    <div>
        <v-row class="filters">
            <v-col md="2" class="pt-0">
                <v-row class="ml-1">
                    <v-col>
                        <v-select
                            id="locations"
                            label="Select a location"
                            v-model="locSelected"
                            :items="locations"
                            item-text="name"
                            item-value="value"
                            hide-details
                            solo
                            dense
                            outlined
                        >
                        </v-select>
                    </v-col>
                </v-row>
            </v-col>
            <v-col md="10" class="pt-0" v-if="locSelected">
                <v-row>
                    <search-bar @searchText="searchBarFilter"/>
                </v-row>
            </v-col>
        </v-row>
        <DataTable
            v-if="locSelected"
            name="reportEntryExit"
            :settings="settings"
            :columns="columnDefs"
            :rows="locItems"
            :customTableContainerClass="'withFilters withActions withoutPagination'"
        ></DataTable>
        <ReportDateRangeDialog
            :title="'reports-entryexit-date'"
            @onGenerateReport="generateReport"
            ref="dateRangeModal">
        </ReportDateRangeDialog>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import DataTable from "../shared/data-table/data-table.vue"
import ReportDateRangeDialog from "./report-date-range"
import SearchBar from "../../components/search-bar/search-bar"
import { pageSize } from '../../constants/pagination';

export default {
    components: {
        DataTable,
        ReportDateRangeDialog,
        SearchBar
    },
    data(){
        return {
            locations: [
                {value: 'area', name: 'Area'},
                {value: 'zone', name: 'Zone'},
                {value: 'location', name: 'Location'}
            ],
            locSelected: null,
            locItems: [],
            allItems: [],
            selectedItem: null,
            columnDefs: [],
            settings: {
                moreActions: [{
                    name: this.$i18n.t('reports-generate'),
                    fn: this.openDateRangeModal,
                    icon: 'file-download-outline'
                }]
            },
            searchText: ''
        }
    },
    watch:{
        currentSiteId() {
            this.locSelected = null;
            this.locItems = [];
            this.allItems = [];
            this.searchText = '';
        },
        locSelected(){
            this.selectedItem = null;
            this.fetchItems();
        }
    },
    computed:{
        ...mapGetters('site', ['currentSiteId'])
    },
    methods: {
        ...mapActions('area', ['getAreas']),
        ...mapActions('zone', ['getZonesBySite']),
        ...mapActions('location', ['getLocationsBySite']),
        ...mapActions('report', ['generateAreaReport', 'generateZoneReport', 'generateLocationReport']),
        openDateRangeModal(tag){
            this.selectedItem  = tag;
            this.$refs.dateRangeModal.openModal();
        },
        async fetchItems(){
            if(this.locSelected === 'area'){
                this.locItems = await this.getAreas({ siteId: this.currentSiteId }); //TODO add pagination
                this.columnDefs = [ { 
                    name: this.$i18n.t('reports-name-column'), 
                    field: "value", 
                    type: "data"
                }];
            }else{
                if(this.locSelected === 'zone'){
                    this.locItems = await this.getZonesBySite({ siteId: this.currentSiteId }); //TODO add pagination
                    this.columnDefs = [ { 
                        name: this.$i18n.t('reports-name-column'), 
                        field: "value", 
                        type: "data"
                    }];
                }else{
                    if(this.locSelected === 'location'){
                        this.locItems = await this.getLocationsBySite({ siteId: this.currentSiteId }); //TODO add pagination
                        this.columnDefs = [ {
                            name: this.$i18n.t('reports-mac-address'),
                            field: "macAddress",
                            type: "data"
                        },
                        { 
                            name: this.$i18n.t('reports-name-column'), 
                            field: "name", 
                            type: "data"
                        }];
                    }   
                }
            }
            Object.assign(this.allItems, this.locItems);
        },
        searchBarFilter(text){
            this.$set(this, 'locItems', this.allItems);
            if(text){
                this.locItems = this.locItems.filter( item => 
                (item.value.search(text) > -1));
            }          
        },
        async generateReport(dateRange){
            try{
                let report = null;
                switch (this.locSelected) {
                    case 'area':
                        report = await this.generateAreaReport({areaId: this.selectedItem.id, start: dateRange.start, end: dateRange.end});
                        break;
                    case 'zone':
                        report = await this.generateZoneReport({zoneId: this.selectedItem.id, start: dateRange.start, end: dateRange.end});
                        break;
                    case 'location':
                        report = await this.generateLocationReport({locationId: this.selectedItem.id, start: dateRange.start, end: dateRange.end});
                        break;
                }

                let filename = 'in-out-'+this.selectedItem.value.replace(/\s/,'_') + '-' + dateRange.start + '-' + dateRange.end;
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