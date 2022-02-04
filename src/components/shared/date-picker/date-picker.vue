<template>
    <div>
        <v-text-field
            v-model="fullDate"
            :label="label"
            readonly
            outlined
            hide-details
            dense
            @click="loadDate()">
        </v-text-field>

        <v-dialog
            ref="dialog"
            v-model="modal"
            persistent
            width="290px"
        >
            <v-date-picker v-model="selectedDate" scrollable v-if="showDate">
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="modal = false">{{ $t('cancel') }}</v-btn>
                <v-btn text color="primary" :disabled="!selectedDate" @click="showDate = false; showHour = true;">{{ $t('ok') }}</v-btn>
            </v-date-picker>

            <v-time-picker v-if="showHour" v-model="time" full-width>
                <v-row>
                    <v-col class="py-0">
                        <v-btn class="float-left" text color="primary" @click="showDate = true; showHour = false">{{ $t('back') }}</v-btn>
                        <v-btn class="float-right" text color="primary" :disabled="!time" @click="closePicker(true)">{{ $t('ok') }}</v-btn>
                        <v-btn class="float-right" text color="primary" @click="closePicker(false)">{{ $t('cancel') }}</v-btn>
                    </v-col>
                </v-row>
            </v-time-picker>
        </v-dialog>
    </div>
</template>

<script>
    export default {
        props: ['label', 'date'],
        data(){
            return {
                modal: false,
                fullDate: null,
                selectedDate: null,
                showDate: true,
                showHour: false,
                time: null,
            }
        },
        mounted(){
            this.setDate();
        },
        watch:{
            date(){
                this.setDate();
            }
        },
        methods:{
            loadDate(){
                this.modal = true;
                this.selectedDate = this.fullDate ? this.fullDate.split(' ')[0] : null;
            },
            setDate(){
                if(this.date){
                    this.fullDate = this.date;
                    this.time = this.$moment(this.date).format("HH:mm")
                }
            },
            closePicker(ok){
                this.showDate = true;
                this.showHour = false;
                this.modal = false;
                if(ok){
                    this.fullDate = this.selectedDate + ' ' + this.time;
                }
                this.$emit('chosenDate', this.fullDate);
            }
        }
    }
</script>