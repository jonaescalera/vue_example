<template>
    <v-row class="ml-1">
        <v-col>
            <p>{{ $t('reports-batterystatus-label') }}</p>
            <v-radio-group v-model="radioGroup">
                <v-radio
                    :label="$t('reports-batterystatus-all')"
                    value="all"
                ></v-radio>
                <v-radio
                    :label="$t('reports-batterystatus-need')"
                    value="need"
                ></v-radio>
            </v-radio-group>
            <v-btn color="primary" :disabled="!radioGroup" @click="generateReport()">
                {{ $t('reports-generate') }}
            </v-btn>
        </v-col>
    </v-row>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'

export default {
    data(){
        return {
            radioGroup: null
        }
    },
    computed:{
        ...mapGetters('site', ['currentSiteName', 'currentSite'])
    },
    methods:{
        ...mapActions('report', ['generateBatteryStatusReport']),
        async generateReport(){
            try{
                let report = await this.generateBatteryStatusReport({ siteId: this.currentSite.id, filter: this.radioGroup });
                let filename = 'battery-stats-' + this.radioGroup + '-' + this.currentSiteName.replace(/\s/,'_') + '-' + new Date().toJSON();
                this.$emit('downloadReport', filename, report);
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