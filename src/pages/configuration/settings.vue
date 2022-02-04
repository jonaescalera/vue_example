<template>
    <div>
        <v-row>
            <v-col class="custom-card card-no-footer-height">
                <v-row>
                    <v-col md="5" sm="12">
                        <v-row>
                            <v-col md="8" class="pt-0">
                                <p class="custom-label">{{ $t('supertag-settings-tags')}}</p>
                                <v-autocomplete
                                    id="supertag"
                                    :items="supertags"
                                    item-text="label"
                                    item-value="value"
                                    v-on:change="onSupertagChange"
                                    :label="$t('supertag-settings-select')"
                                    v-model="selectedSupertag"
                                    :no-data-text="$t('tags-not-available')"
                                    hide-details
                                    solo
                                    dense
                                    outlined
                                    return-object
                                >
                                </v-autocomplete>
                            </v-col>
                        </v-row>
                        <v-row v-if="selectedSupertag && supertagConfig">
                            <v-col md="8">
                                <p class="label">{{ $t('supertag-settings-location') }}</p>
                                <span class="display-1 font-weight-light">
                                    {{ convertLocInterval }}
                                </span>
                                <v-slider
                                    id="location"
                                    v-model="loc_slider"
                                    color="secondary"
                                    track-color="grey"
                                    always-dirty
                                    min="5"
                                    max="1440"
                                    @change="onLocationIntervalChange"
                                    @start="onLocationIntervalChange"
                                >
                                    <template v-slot:prepend>
                                    <v-icon
                                        id="decrement-loc"
                                        color="secondary"
                                        @click="decrement"
                                    >
                                        mdi-minus
                                    </v-icon>
                                    </template>

                                    <template v-slot:append>
                                    <v-icon
                                        id="increment-loc"
                                        color="secondary"
                                        @click="increment"
                                    >
                                        mdi-plus
                                    </v-icon>
                                    </template>
                                </v-slider>
                            </v-col>

                        </v-row>
                        <v-row v-if="selectedSupertag && supertagConfig">
                            <v-col md="8">
                                <p class="label">{{ $t('supertag-settings-heartbeat') }}</p>
                                <span class="display-1 font-weight-light">
                                    {{ $t('supertag-settings-hrs', { hrs: hb_interval}) }}
                                </span>
                                <v-slider
                                    id="heartbeat"
                                    v-model="hb_interval"
                                    color="secondary"
                                    track-color="grey"
                                    always-dirty
                                    min="4"
                                    max="24"
                                    @change="hasChanges=true"
                                >
                                    <template v-slot:prepend>
                                    <v-icon
                                        id="decrement-hb"
                                        color="secondary"
                                        @click="hb_interval--; hasChanges=true"
                                    >
                                        mdi-minus
                                    </v-icon>
                                    </template>

                                    <template v-slot:append>
                                    <v-icon
                                        id="increment-hb"
                                        color="secondary"
                                        @click="hb_interval++; hasChanges=true"
                                    >
                                        mdi-plus
                                    </v-icon>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>
                        <v-row v-if="selectedSupertag && supertagConfig">
                            <v-col>
                                <div id='list-pick-container'>
                                    <v-card outlined height="230" width="150" class="float-left mt-2">
                                        <v-list id="available" shaped>
                                            <v-subheader class="justify-center">{{ $t('supertag-settings-available') }}</v-subheader>
                                            <v-spacer></v-spacer>
                                            <v-list-item-group v-model="selectedLeft" color="primary" multiple>
                                                <v-list-item
                                                    v-for="(item, i) in availableTechs"
                                                    :key="i"
                                                    >
                                                    <v-list-item-icon>
                                                        <v-icon>{{ item.icon }}</v-icon>
                                                    </v-list-item-icon>
                                                    <v-list-item-content>
                                                        <v-list-item-title v-text="item.label"></v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                            </v-list-item-group>
                                        </v-list>
                                    </v-card>
                                    <div class="text-center move-to float-left">
                                        <div>
                                            <v-btn id="move-to-right" fab dark x-small color="secondary" @click="moveToRight">
                                                <v-icon dark>mdi-arrow-right-bold</v-icon>
                                            </v-btn>
                                        </div>
                                        <div>
                                            <v-btn id="move-to-left" fab dark x-small color="secondary" @click="moveToLeft">
                                                <v-icon dark>mdi-arrow-left-bold</v-icon>
                                            </v-btn>
                                        </div>
                                    </div>
                                    <v-card outlined height="230" width="150" class="float-left mt-2">
                                        <v-list id="selected" shaped>
                                            <v-subheader class="justify-center">{{ $t('supertag-settings-selected') }}</v-subheader>
                                            <v-list-item-group v-model="selectedRight" color="primary" multiple>
                                                <v-list-item
                                                    v-for="(item, i) in supertagConfig.connectivity"
                                                    :key="i"
                                                    >
                                                    <v-list-item-icon>
                                                        <v-icon>{{ item.icon }}</v-icon>
                                                    </v-list-item-icon>
                                                    <v-list-item-content>
                                                        <v-list-item-title v-text="item.label"></v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                            </v-list-item-group>
                                        </v-list>
                                    </v-card>
                                    <div class="text-center move-to float-left">
                                        <div>
                                            <v-btn id="move-up" fab dark x-small color="secondary" @click="moveUp">
                                                <v-icon dark>mdi-arrow-up-bold</v-icon>
                                            </v-btn>
                                        </div>
                                        <div>
                                            <v-btn id="move-down" fab dark x-small color="secondary" @click="moveDown">
                                                <v-icon dark>mdi-arrow-down-bold</v-icon>
                                            </v-btn>
                                        </div>
                                    </div>
                                </div>
                            </v-col>        
                        </v-row>
                        <v-row v-if="selectedSupertag && supertagConfig">
                            <v-col>
                                <v-btn
                                    id="save-setting"
                                    color="primary"
                                    :disabled="!hasChanges"
                                    depressed
                                    @click="showSaveDialog = true"
                                >
                                    {{ $t('save') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col md="7" sm="12" v-if="currentData">
                        <p class="label">{{ $t('supertag-settings-details') }}</p>
                        <v-card class="mx-auto" id="currentData">
                            <v-card-title class="py-0">
                                <v-row>
                                    <v-col class="px-0">
                                        <table class="px-2 w-100">
                                            <tr v-for="item in currentData.highlightItems" :key="item.fieldKey">
                                                <td class="w-50">
                                                    <p>{{item.title}}</p>
                                                </td>
                                                <td class="pl-2 w-50">
                                                    <p v-if="item.type && item.type === 'date'">{{ item.value | moment('M/D/YYYY hh:mm A')}}</p>
                                                    <p v-else>{{ item.value }}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </v-col>
                                </v-row>
                            </v-card-title>
                            <v-card-actions class="pt-0">
                                <v-spacer></v-spacer>
                                <v-btn id="show-more" class="mx-2" text @click="showMore = !showMore" color="primary">
                                    {{showMore ? $t('supertag-settings-less-info') : $t('supertag-settings-more-info')}}<v-icon>{{ showMore ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                                </v-btn>
                            </v-card-actions>
                        
                            <v-expand-transition>
                                <div v-show="showMore">
                                    <v-card-text class="py-0">
                                        <v-row>
                                            <v-col class="px-0">
                                                <table class="px-2 w-100">
                                                    <tr v-for="item in currentData.items" :key="item.fieldKey">
                                                        <td class="w-50">
                                                            <p>{{item.title}}</p>
                                                        </td>
                                                        <td class="w-50 pl-2">
                                                            <p v-if="item.type && item.type === 'date'">{{ item.value | moment('M/D/YYYY hh:mm A')}}</p>
                                                            <p v-else>{{ item.value }}</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-btn id="refresh" class="mx-2" fab dark small color="primary" :title="$t('supertag-settings-refresh')" @click="refreshCurrentData()">
                                            <v-icon dark>mdi-refresh</v-icon>
                                        </v-btn>
                                    </v-card-actions>
                                </div>
                            </v-expand-transition>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-dialog persistent v-model="showSaveDialog" max-width="900">
            <v-card v-if="!applyNowStep1 && !applyNowStep2">
                <v-btn color="primary" text fab outlined x-small dark class="float-right mt-1 mr-1" title="close" @click="showSaveDialog = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-text class="pt-3" v-html="cloudSynNotSupported ? $t('supertag-settings-save-not-cloud') : $t('supertag-settings-save')"></v-card-text>
                <v-card-actions v-if="cloudSynNotSupported">
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        color="secondary"
                        @click="showSaveDialog = false"
                        class="px-8"
                        >{{$t('cancel')}}
                    </v-btn>
                    <v-btn
                        depressed
                        color="secondary"
                        @click="confirmSave"
                        class="px-8"
                        >{{$t('save')}}
                    </v-btn>
                </v-card-actions>
                <v-card-actions v-if="!cloudSynNotSupported">
                    <v-spacer></v-spacer>
                    <v-btn depressed color="primary" @click="confirmSave">
                        <v-icon>mdi-calendar</v-icon>
                        {{ cloudSynNotSupported ? 'save' : $t('supertag-settings-next-check') }}
                    </v-btn>
                    <v-btn height="32" depressed color="secondary" @click="applyNow" class="px-8 float-right">
                        <v-icon>mdi-download</v-icon>
                        {{ $t('supertag-settings-apply-now') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
            <v-card v-if="applyNowStep1">
                <v-btn color="primary" text fab outlined x-small dark class="float-right mt-1 mr-1" title="close" @click="showSaveDialog = false; applyNowStep1 = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-text class="pt-3" v-html="$t('supertag-settings-apply-now-step-1')"></v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text depressed color="secondary" @click="applyNowStart">
                        {{ $t('yes') }}
                    </v-btn>
                    <v-btn depressed color="secondary" @click="confirmSave" class="px-8 float-right small-text">
                        {{ $t('supertag-settings-no-device') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
            <v-card v-if="applyNowStep2">
                <v-btn color="primary" text fab outlined x-small dark class="float-right mt-1 mr-1" title="close" @click="showLastAlert($t('supertag-settings-saved'));">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-text class="pt-3">
                    <img class="cloud-sync-img" src="http://mediaupload-us-east1.s3.amazonaws.com/images/cloudSync.jpeg">
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text depressed color="secondary" @click="showLastAlert($t('supertag-settings-saved'))">
                        {{ $t('cancel') }}
                    </v-btn>
                    <v-btn depressed color="secondary" @click="showLastAlert($t('supertag-settings-apply-now-finish'))">
                        {{ $t('supertag-settings-apply-finish') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    <confirm-save-modal
            @confirm="onDiscardChanges"
            @cancel="onKeepChanges"
            :dialogModel="discardChanges"
            :dialogBody="$t('supertag-settings-discard')"
            :dialogConfirmBtn="$t('supertag-settings-discard-btn')"
        />
        <confirm-save-modal
            @confirm="cellIdChangeWarningModal = false"
            :dialogModel="cellIdChangeWarningModal"
            :dialogBody="$t('supertag-settings-cell-id-warning')"
            :dialogConfirmBtn="$t('ok')"
            :dialogConfirmOnly=true
        />
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex';
    import ConfirmSaveModal from '../../components/shared/modals/confirmModal';
    const firmwareVersionCloudSync = "1.3.3";

    export default {
        name: "Settings",
        components: {
            ConfirmSaveModal
        },
        data(){
            return{
                showMore: false,
                supertags: [],
                supertagConfig: null,
                currentData: null,
                selectedSupertag: null,
                loc_slider: null,
                loc_interval: null,
                hb_interval: null,
                availableTechs: [],
                selectedLeft: [],
                selectedRight: [],
                showSaveDialog: false,
                hasChanges: false,
                hasLocationIntervalChanged: false,
                discardChanges: false,
                cellIdChangeWarningModal: false,
                navigateTo: null,
                applyNowStep1: false,
                applyNowStep2: false,
                notSaved: false,
                cloudSynNotSupported: true,
                defaultLocInterval: 30*60, // 30 Minutes
                defaultHbInterval: 24*60*60, // 24 Hours
                cellNetworkId: 'cell_id',
            }
        },
        beforeRouteLeave: function(to, from, next) {
            //if the user leave the page without saving changes
            if(this.hasChanges){
                this.discardChanges = true;
                this.navigateTo = to;
            }else{
                next();
            }
        },
        computed: {
            ...mapGetters('site', ['currentSiteId']),
            ...mapGetters('supertag', ['getInitialSupertag']),
            convertLocInterval(){
                if (this.hasLocationIntervalChanged) {
                    this.loc_interval = this.loc_slider;
                }
                if(this.loc_slider < 60){
                    return this.$t('supertag-settings-minutes', {minutes : this.loc_interval});
                }else{
                    const duration = this.$moment.duration(this.loc_interval, 'minutes');
                    const locIntervalHours = Math.floor (duration.asHours());
                    const locIntervalMinutes = duration.minutes();

                    if(this.loc_slider >= 60 && this.loc_slider < 120){
                        if (locIntervalMinutes) {
                            return this.$t('supertag-settings-hr-minutes', {hr : locIntervalHours, m: locIntervalMinutes});
                        } else {
                            return this.$t('supertag-settings-hr', {hr : locIntervalHours});
                        }
                    }else{
                        if (locIntervalMinutes) {
                            return this.$t('supertag-settings-hrs-minutes', {hrs : locIntervalHours, m: locIntervalMinutes});
                        } else {
                            return this.$t('supertag-settings-hrs', {hrs : locIntervalHours});
                        }
                    }
                }
            }
        },
        watch:{
            currentSiteId(){
                this.selectedSupertag = null;
                this.hasChanges = false;
                this.hasLocationIntervalChanged = false;
                this.loc_interval = null;
                this.hb_interval = null;
                this.stTechs = [];
                this.currentData = null;
                this.fetchTags();
            },
            selectedSupertag(newTag, oldTag){
                this.previousTag = oldTag;
            }
        },
        mounted() {
            if(this.currentSiteId){
                this.fetchTags();
            }
            if(this.getInitialSupertag){
                this.selectedSupertag = {value: this.getInitialSupertag.id, label: this.getInitialSupertag.name};
                this.clearInitialSupertag();
                this.onSupertagChange();
            }
        },
        methods: {
            ...mapActions('supertag', ['getSupertags', 'getSupertag', 'getSupertagCurrentData', 'saveSupertag', 'clearInitialSupertag']),
            async fetchTags(){
                try{
                    this.supertags = await this.getSupertags(this.currentSiteId);
                }catch(error){
                    this.$toasted.show(error, { 
                        position: "bottom-right",
                        className: ['toast-error'], 
                        duration : 5000
                    });
                }
            },
            async onSupertagChange(){
                if(this.hasChanges){
                    this.discardChanges = true;
                }else{
                    this.hasChanges = false;
                    this.hasLocationIntervalChanged = false;
                    this.availableTechs= [{ networkId: 'gps', sequenceId: 1, label: 'GPS', icon: 'mdi-map-marker-radius-outline'},
                                        { networkId: 'wifi', sequenceId: 2, label: 'WIFI', icon: 'mdi-wifi'}];
                    this.supertagConfig = await this.getSupertag(this.selectedSupertag.value);
                    this.currentData = await this.getSupertagCurrentData(this.selectedSupertag.value);

                    this.cloudSynNotSupported = (this.currentData) ? (this.currentData.highlightItems.find( item => item.fieldKey === 'firmwareVersion').value < firmwareVersionCloudSync) : true;

                    //remove from availablesTechs the ones that are already assigned
                    this.availableTechs = this.availableTechs.filter(val => this.supertagConfig.connectivity.findIndex(item => item.networkId === val.networkId) === -1);

                    const locIntervalSeconds = this.supertagConfig.locationInterval || this.defaultLocInterval;
                    const hbIntervalSeconds = this.supertagConfig.heartBeatInterval || this.defaultHbInterval;
  
                    // TODO Update variable names to camel case
                    this.loc_interval = Math.round((locIntervalSeconds / 60) * 100) / 100; ; //convert to minutes, round to 2 decimal places
                    this.loc_slider = this.loc_interval;
                    this.hb_interval = hbIntervalSeconds / 3600; //convert to hrs
                }
            },
            moveToRight(){
                if(this.selectedLeft.length > 0){
                    this.hasChanges = true;
                    this.selectedLeft.forEach(item => { this.supertagConfig.connectivity.push(this.availableTechs[item]); }); //add techs to the supertag techs
                    this.availableTechs = this.availableTechs.filter(val => this.supertagConfig.connectivity.findIndex(item => item.networkId === val.networkId) === -1); //remove the selected techs from left container
                    this.selectedLeft = [];
                }
            },
            moveToLeft(){
                if(this.selectedRight.length > 0){
                    let techsToMoveLeft = [];
                    this.selectedRight.forEach(item => { techsToMoveLeft.push(this.supertagConfig.connectivity[item]); }); //add techs to the availables techs
                    if (techsToMoveLeft.find(tech => tech.networkId === this.cellNetworkId)) {
                        this.cellIdChangeWarningModal = true;
                        return;
                    }
                    this.hasChanges = true;
                    this.availableTechs = this.availableTechs.concat(...techsToMoveLeft);
                    this.supertagConfig.connectivity = this.supertagConfig.connectivity.filter(val => this.availableTechs.findIndex(item => item.networkId === val.networkId) === -1); //remove the selected supertag techs from right container
                    this.selectedRight = [];
                }
            },
            moveUp(){
                if(this.selectedRight.length === 1 && this.selectedRight[0] !== 0){
                    this.hasChanges = true;
                    var aux =  Object.assign({}, this.supertagConfig.connectivity[this.selectedRight[0]-1]);
                    this.supertagConfig.connectivity[this.selectedRight[0]-1] = this.supertagConfig.connectivity[this.selectedRight[0]];
                    this.$set(this.supertagConfig.connectivity, this.selectedRight[0], aux);
                    this.$set(this.selectedRight, 0, this.selectedRight[0]-1);
                }
            },
            moveDown(){
                //just one selected and not the last one
                if(this.selectedRight.length === 1 && this.selectedRight[0] !== this.supertagConfig.connectivity.length-1){
                    this.hasChanges = true;
                    var aux =  Object.assign({}, this.supertagConfig.connectivity[this.selectedRight[0]+1]);
                    this.supertagConfig.connectivity[this.selectedRight[0]+1] = this.supertagConfig.connectivity[this.selectedRight[0]];
                    this.$set(this.supertagConfig.connectivity, this.selectedRight[0], aux);
                    this.$set(this.selectedRight, 0, this.selectedRight[0]+1);
                }
            },
            onLocationIntervalChange() {
                this.hasLocationIntervalChanged = true;
                this.hasChanges = true;
            },
            async confirmSave(showSuccessMsg=true){
                try{
                    if(showSuccessMsg){
                        this.showSaveDialog = false;
                    }
                    if(this.loc_interval !== null){
                        this.supertagConfig.locationInterval = this.loc_interval * 60; //convert minutes to seconds
                    }
                    if(this.hb_interval !== null){
                        this.supertagConfig.heartBeatInterval = this.hb_interval * 3600; //convert hrs to seconds
                    }
                    this.supertagConfig.connectivity.forEach((item, index) => {
                        item.sequenceId = index + 1;
                    });
                    this.hasChanges = false;
                    this.hasLocationIntervalChanged = false;
                    this.supertagConfig = await this.saveSupertag(this.supertagConfig);
                    let msg = this.$t('supertag-settings-next-check-saved');
                    if(showSuccessMsg){
                        if(this.applyNowStep1){
                            msg = this.$t('supertag-settings-saved');
                        }
                        this.$toasted.show(msg, { 
                            position: "bottom-right",
                            className: ['toast-success'], 
                            duration : 5000
                        });
                    }
                    this.applyNowStep1 = false;
                    this.notSaved = false;
                }catch(error){
                    this.$toasted.show(error.data.message ? error.data.message : error.data.error_description, { 
                        position: "bottom-right",
                        className: ['toast-error'], 
                        duration : 5000
                    });
                    this.applyNowStep1 = false;
                    this.notSaved = true;
                }
            },
            applyNow(){
                this.applyNowStep1 = true;
            },
            async applyNowStart(){
                await this.confirmSave(false);
                this.applyNowStep1 = false;
                if(!this.notSaved){
                    this.applyNowStep2 = true;
                }else{
                    this.showSaveDialog = false;
                }
            },
            showLastAlert(msg){
                this.applyNowStep1 = false;
                this.applyNowStep2 = false;
                this.showSaveDialog = false;
                this.$toasted.show(msg, { 
                    position: "bottom-right",
                    className: ['toast-success'], 
                    duration : 5000
                });
            },
            async refreshCurrentData(){
                this.currentData = await this.getSupertagCurrentData(this.selectedSupertag.value);
            },
            onDiscardChanges(){
                this.discardChanges = false;
                this.hasChanges = false;
                this.hasLocationIntervalChanged = false;
                if(this.navigateTo !== null){
                    this.$router.push(this.navigateTo);
                }else{
                    this.onSupertagChange();
                }
            },
            onKeepChanges(){
                this.discardChanges = false;
                this.selectedSupertag = this.previousTag;
                this.previousTag = null;
                this.navigateTo = null;
            },
            decrement(){
                this.hasChanges = true;
                this.hasLocationIntervalChanged = true
                if(this.loc_interval <= 60){
                    this.loc_interval -= 1;
                }else{
                    if(this.loc_interval > 60){
                        this.loc_interval -= 60;
                    }
                }
                this.loc_slider = this.loc_interval;
            },
            increment(){
                this.hasChanges = true;
                this.hasLocationIntervalChanged = true
                if(this.loc_interval < 60){
                    this.loc_interval += 1;
                }else{
                    if(this.loc_interval >= 60){
                        this.loc_interval += 60;
                    }
                }
                this.loc_slider = this.loc_interval;
            }
        }
    }
</script>
<style lang="scss" scoped>
    .custom-card{
        overflow-y: auto;
    }
    .cloud-sync-img {
        width: 100%;
        margin: auto;
        display: block;
    }
    #list-pick-container{
        min-width: 460px;
        float: left;
        @media (max-width: 525px){
            >.v-card{
                width: auto!important;
            }
        }
    }
    .move-to{
        height: 230px;
        width: 80px;
        float: left;
        >div:first-child{
            margin-top: 75px;
            margin-bottom: 15px;
        }
        @media (max-width: 525px){
            width: 55px;
        }
    }
    .v-list-item__title{
        text-transform: uppercase;
        font-size: 0.8rem;
    }
    .v-list-item__icon{
        margin-right: 10px!important;
        @media (max-width: 525px){
            margin-right: 0px!important;
        }
        i.v-icon{
            font-size: 1.2rem;
        }
    }
    .v-subheader{
        color: var(--v-primary-base);
        font-weight: bold;
    }
    #currentData .v-card__title{
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.375rem;
        margin-right: 10px;
    }
    #currentData .v-card__text{
        height: calc(100vh - 420px);
        min-height: 250px;
        overflow-y: auto;
    }
    #config p{
        text-transform: uppercase;
    }
    .headline {
        height: 48px;
        font-size: 18px !important;
        font-weight: 600;
        color: #3B5762;
    }
    .v-card__text {
        padding-top: 35px!important;
    }
    .small-text{
        font-size: 0.8rem;
    }
    table p { word-break: break-word; }
    @media (max-width: 525px){
        .v-list{
            padding-right: 0px;
        }
    }

</style>