<template>
    <div>
        <v-dialog @click:outside="closeModal" @keydown.esc="closeModal" v-model="dialog" width="413" scrollable>
            <v-card>
                <v-card-title class="secondary">Generate report</v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="12">
                            <p>{{ $t(title) }}</p>
                        </v-col>
                        <v-col cols="6" class="pb-0">
                            <DatePicker :label="$t('reports-start-date')" @chosenDate="setStartDate" :date="fullStartDate"></DatePicker>
                        </v-col>
                        <v-col cols="6" class="pb-0">
                            <DatePicker :label="$t('reports-end-date')" @chosenDate="setEndDate" :date="fullEndDate" ></DatePicker>
                        </v-col>
                        <v-col cols="12" class="pt-0">
                            <p class="error-text" v-if="!validLimit">{{ $t('reports-date-range-error') }}</p>
                            <p class="error-text" v-if="startGreaterEnd">{{ $t('reports-date-start-greater-end-error') }}</p>
                        </v-col>
                        <v-col cols="12" class="text-right">
                            <v-btn
                                text
                                color="secondary"
                                @click="closeModal"
                                class="mr-2"
                                >{{$t('cancel')}}</v-btn>
                            <v-btn color="secondary" :disabled="canGenerate" @click="generateReport()">
                                {{ $t('reports-generate') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    import DatePicker from "../shared/date-picker/date-picker.vue"
    const valideDateLimit = 48 * 60 * 60 * 1000;

    export default {
        components: {
            DatePicker
        },
        props: ['title'],
        data(){
            return{
                dialog: false,
                validLimit: true,
                startGreaterEnd: false,
                fullEndDate: null,
                fullStartDate: null,
            }
        },
        mounted(){
            this.setDefaultDates();
        },
        computed:{
            canGenerate(){
                if(this.fullStartDate && this.fullEndDate){
                    if(this.fullStartDate < this.fullEndDate){
                        this.startGreaterEnd = false;
                        this.validLimit = new Date(this.$moment(this.fullEndDate).format("YYYY-MM-DD HH:mm")) - new Date(this.$moment(this.fullStartDate).format("YYYY-MM-DD HH:mm")) <= valideDateLimit;
                    }else{
                        this.startGreaterEnd = true;
                    }
                }
                return !(this.fullStartDate && this.fullEndDate && this.validLimit && !this.startGreaterEnd);            
            }
        },
        methods: {
            openModal() {
                this.setDefaultDates();
                this.dialog = true;
            },
            closeModal(){
                this.dialog = false;
            },
            setStartDate(date){
                this.fullStartDate = date;
            },
            setEndDate(date){
                this.fullEndDate = date;
            },
            generateReport(){
                this.$emit('onGenerateReport', {start: (new Date(this.fullStartDate)).toISOString(), end: (new Date(this.fullEndDate)).toISOString()});
            },
            setDefaultDates(){                
                this.$set(this, 'fullEndDate', this.$moment(new Date()).format('YYYY-MM-DD HH:mm'));
                this.$set(this, 'fullStartDate', this.$moment(this.fullEndDate).subtract(2, 'days').format('YYYY-MM-DD HH:mm'));
            }
        }
    }
</script>
<style scoped>
    .error-text{
        margin-bottom: 0px;
        color: red;
        font-size: 12px;
    }
</style>
