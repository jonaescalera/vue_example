<template>
  	<div id="reports">
        <v-row>
            <v-col class="custom-card px-0 pa-0">
                <v-row class="ml-1 mt-2">
                    <v-col md="3" sm="12" class="pb-0">
                        <p class="custom-label">{{ $t('reports-select')}}</p>
                        <v-select
                            id="report"
                            v-model="reportSelected"
                            :items="reports"
                            item-text="name"
                            item-value="value"
                            hide-details
                            solo
                            dense
                            outlined
                        >
                        </v-select>
                    </v-col>
                    <v-col cols="9" class="d-flex align-center reportDesc">
                        <em v-if="reportSelected === 2">
                            {{ $t('reports-entryexit-desc') }}
                        </em>
                        <em v-if="reportSelected === 3">
                            {{ $t('reports-tagpath-desc') }}
                        </em>
                    </v-col>
                </v-row>
                <BatteryStatusReport v-if="reportSelected === 1" @downloadReport="downloadReport"></BatteryStatusReport>
                <EntryExitReport v-if="reportSelected === 2" @downloadReport="downloadReport"></EntryExitReport>
                <TagpathReport v-if="reportSelected === 3" @downloadReport="downloadReport"></TagpathReport>
            </v-col>
        </v-row>
    </div>
</template>
<script>

import { mapGetters } from 'vuex';
import TagpathReport from '../../components/reports/report-tagpath';
import EntryExitReport from '../../components/reports/report-entry-exit';
import BatteryStatusReport from '../../components/reports/report-battery-status';
import { csvMixin } from "../../mixins/csvExport"

export default {
    name: "Reports",
    components: {
        TagpathReport,
        EntryExitReport,
        BatteryStatusReport
    },
    data() {
        return {
            reports: [
                {value: 1, name:  this.$t('reports-batterystats')}
            ],
            reportSelected: null
        }
    },
    mixins: [csvMixin],
    computed: {
        ...mapGetters('site', ['currentSite']),
    },
    watch:{
        currentSite(){
            this.addReports();
        }
    },
    mounted(){
        this.addReports();
    },
    methods:{
        downloadReport(filename, report){
            csvMixin.methods.downloadFile(filename, report);
        },
        addReports(){
            if(!this.currentSite.isAf3){
                this.reports.push(
                    {value: 2, name:  this.$t('reports-entryexit')},
                    {value: 3, name:  this.$t('reports-tagpath')}
                );
                this.reportSelected = null;
            }else{
                this.reportSelected = 1;
            }
        }
        
    }
}
</script>
<style scoped>
    .reportDesc{
        font-size: 0.9rem;
    }
</style>