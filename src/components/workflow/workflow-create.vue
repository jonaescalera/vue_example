<template>
    <v-dialog v-model="openForm" width="800" scrollable>
        <v-stepper v-model="step" non-linear>
            <v-stepper-header>
                <v-stepper-step color="secondary" editable :complete="step > 1" step="1" :rules="[nameRule]">{{ $t('workflow-column-name') }}</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step color="secondary" :editable="$v.configValue.$dirty ? true : false" :complete="step > 2" step="2" :rules="[typeRule]">{{ $t('workflow-column-type') }}</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step color="secondary" :editable="$v.criterion.$each[0].operation.$dirty ? true : false" :complete="step > 3" step="3" :rules="[regionRule]">{{ $t('workflow-region') }}</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step color="secondary" :editable="$v.criterion.$each[0].value.$dirty ? true : false" :complete="step > 4" step="4" :rules="[tagsRule]">{{ $t('workflow-column-tags') }}</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step color="secondary" :editable="$v.tagCriterion.$dirty ? true : false" :complete="step > 5" step="5">{{ $t('workflow-notifications') }}</v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
                <v-stepper-content step="1">
                    <div class="mb-12 mt-2">
                        <p>{{ $t('workflow-name') }}</p>
                        <v-text-field
                            id="wf-name"
                            :label="$t('workflow-name-label')"
                            v-model="configValue"
                            :error-messages="nameErrors"
                            :dense="true"
                            color="secondary"
                            outlined
                            required
                            :hint="$t('workflow-name-label-hint')"
                            persistent-hint
                        ></v-text-field>
                    </div>
                    <div class="text-right">
                        <v-btn id="wf-cancel-step1" class="mr-2" text @click="closeWizard" color="secondary">{{ $t('cancel') }}</v-btn>
                        <v-btn id="wf-continue-step1" color="secondary" @click="stepOne">{{ $t('continue') }}</v-btn>
                    </div>
                </v-stepper-content>

                <v-stepper-content step="2">
                    <div class="mb-12 mt-2 ml-2">
                        <p>{{ $t('workflow-type') }}</p>
                        <v-radio-group v-model="$v.criterion.$each[0].operation.$model" :error-messages="reqErrors($v.criterion.$each[0].operation)">
                            <v-radio
                                id="wf-type-entry"
                                color="secondary"
                                :label="!currentSite.isAf3 ? $t('workflow-type-label-1') : $t('workflow-type-label-1-af3')"
                                :value="workflows.TYPE_ENTRY">
                            </v-radio>
                            <v-radio
                                id="wf-type-exit"
                                color="secondary"
                                :label="!currentSite.isAf3 ? $t('workflow-type-label-2') : $t('workflow-type-label-2-af3')"
                                :value="workflows.TYPE_EXIT">
                            </v-radio>
                            <v-radio
                                v-if="!currentSite.isAf3"
                                id="wf-type-delivery"
                                color="secondary"
                                :label="$t('workflow-type-label-3')"
                                :value="workflows.TYPE_DELIVERY">
                            </v-radio>
                        </v-radio-group>
                    </div>
                    <div class="text-right">
                        <v-btn id="wf-cancel-step2" class="mr-2" text color="secondary" @click="closeWizard">{{ $t('cancel') }}</v-btn>
                        <v-btn id="wf-continue-step2" color="secondary"  @click="stepTwo" >{{ $t('continue') }}</v-btn>
                    </div>
                </v-stepper-content>

                <v-stepper-content step="3">
                    <div class="mb-12 mt-2">
                        <p>{{ currentSite.isAf3 ? $t('workflow-to-watch-af3') : $t('workflow-to-watch') }}</p>
                         <v-autocomplete
                            id="wf-regions"
                            :label="$t('workflow-to-watch-label')"
                            v-model="$v.criterion.$each[0].property.$model"
                            :items="regions"
                            :dense="true"
                            item-text="label"
                            item-value="value"
                            :error-messages="reqErrors($v.criterion.$each[0].property)"
                            @change="handleRegion"
                            outlined
                            color="secondary"
                        ></v-autocomplete>
                        <div v-if="regionItems.length > 0">
                            <v-card tile id="regionList">
                                <v-list :dense="true">
                                    <v-list-item-group v-model="$v.criterion.$each[0].value.$model" color="secondary">
                                        <v-list-item
                                        v-for="(item, i) in regionItems"
                                        :key="i"
                                        :value="item.id"
                                        >
                                        <v-list-item-content>
                                            <v-list-item-title v-text="item.value"></v-list-item-title>
                                            <v-list-item-subtitle v-if="criterion[0].property == workflows.REGIONS_LOCATION">{{ $t('workflow-mac-address') }}: {{ item.macAddress }}</v-list-item-subtitle>
                                        </v-list-item-content>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                            </v-card>
                            <p class="error--text">{{ reqErrors($v.criterion.$each[0].value) }}</p>
                        </div>
                        <p v-if="(regionItems.length === 0 && $v.criterion.$each[0].property.$model) && !fetchingRegion" class="error--text">{{ $t('workflow-empty-region') }}</p>
                    </div>
                    <div class="text-right">
                        <v-btn id="wf-cancel-step3" class="mr-2" text color="secondary" @click="closeWizard">{{ $t('cancel') }}</v-btn>
                        <v-btn id="wf-continue-step3" color="secondary" @click="stepThree">{{ $t('continue') }}</v-btn>
                    </div>
                </v-stepper-content>

                <v-stepper-content step="4">
                    <div class="mb-12 mt-2">
                        <p v-if="currentSiteLabels">{{ $t('workflow-tags') }} {{currentSiteLabels.group}}, {{currentSiteLabels.category}}, {{currentSiteLabels.field1}}, {{currentSiteLabels.field2}}</p>
                        <v-autocomplete
                            id="wf-tags"
                            :label="$t('workflow-tags-label')"
                            v-model="tagCriterion"
                            :items="tagsCriteria"
                            :dense="true"
                            item-text="label"
                            item-value="value"
                            :error-messages="reqErrors($v.tagCriterion)"
                            @change="handleTagCriteria"
                            color="secondary"
                            outlined
                        ></v-autocomplete>
                        <div v-if="tags.length > 0">
                            <v-card tile id="criteriaList">
                                <v-list :dense="true">
                                    <v-list-item-group v-model="$v.criterion.$each[1].value.$model" color="secondary">
                                        <v-list-item
                                        v-for="item in tags"
                                        :key="item.id"
                                        :value="item.id"
                                        >
                                        <v-list-item-content>
                                            <v-list-item-title v-text="item.value"></v-list-item-title>
                                        </v-list-item-content>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                            </v-card>
                            <p class="error--text">{{ reqErrors($v.criterion.$each[1].value) }}</p>
                        </div>
                        <v-text-field
                            id="wf-criteria-field"
                            color="secondary"
                            v-if="tagCriterion == workflows.CRITERIA_FIELD1 || tagCriterion == workflows.CRITERIA_FIELD2"
                            :label="$t('workflow-field')"
                            v-model="$v.criterion.$each[1].value.$model"
                            :error-messages="reqErrors($v.criterion.$each[1].value)"
                            :dense="true"
                            outlined
                            required
                            persistent-hint
                        ></v-text-field>
                    </div>
                    <div class="text-right">
                        <v-btn id="wf-cancel-step4" class="mr-2" text color="secondary" @click="closeWizard">{{ $t('cancel') }}</v-btn>
                        <v-btn id="wf-continue-step4" color="secondary" @click="stepFour">{{ $t('continue') }}</v-btn>
                    </div>
                </v-stepper-content>
                <v-stepper-content step="5">
                    <div class="mb-12 mt-2">
                        <p>{{ $t('workflow-emails') }}</p>
                        <div class="emailContainer pt-2">
                            <div v-for="(item, i) in $v.emails.$each.$iter" :key="i" class="emailInput">
                                <v-text-field
                                    :id='"wf-email-"+i'
                                    :label="$t('workflow-emails-label')"
                                    v-model="item.value.$model"
                                    :error-messages="emailsError(i)"
                                    :dense="true"
                                    color="secondary"
                                    outlined
                                    required
                                    persistent-hint
                                ></v-text-field>
                                <v-btn :id='"add-email-"+i' class="mx-2 float-right" fab dark small color="secondary" :title="$t('workflow-emails-title')" @click="addEmail" v-if="i == emails.length-1">
                                    <v-icon dark>mdi-plus</v-icon>
                                </v-btn>
                                <v-btn :id='"remove-email-"+i' class="ml-2" fab dark small color="secondary" :title="$t('workflow-emails-title')" @click="deleteEmail(i)" v-if="i > 0">
                                    <v-icon dark>mdi-minus</v-icon>
                                </v-btn>
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <v-btn id="wf-cancel-step5" class="mr-2" text color="secondary" @click="closeWizard">{{ $t('cancel') }}</v-btn>
                        <v-btn id="wf-save" color="secondary" :disabled="$v.$invalid" @click="createWF">{{ $t('save') }}</v-btn>
                    </div>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
    </v-dialog>
</template>
<script>

import { required, maxLength, email } from 'vuelidate/lib/validators'
import { mapActions, mapGetters } from 'vuex'
import { WORKFLOWS } from '../../constants/workflows';

export default {
    data() {
        return {
            openForm: false,
            step: 1,
            emails: [],
            regions: [],
            regionItems: [],
            tagsCriteria: [],
            tags: [],
            criterion: [],
            tagCriterion: null,
            configValue: '',
            workflows: WORKFLOWS,
            fetchingRegion: false
        }
    },
    validations: {
        configValue: {required, maxLength: maxLength(200)},
        criterion:{
            $each:{
                operation: { required },
                property: { required },
                type: { required },
                value: { required }
            }
        },
        tagCriterion:{ required },
        emails: {
            $each: {
                value: {
                    required,
                    email
                },
                $trackBy: 'id'
            }
        
        }
    },
    beforeMount(){
        this.initForm();
        this.setRegions();
        this.tagsCriteria = [
            {'value': WORKFLOWS.CRITERIA_ALL, 'label': this.$t('workflow-criteria-all') }, 
            {'value': WORKFLOWS.CRITERIA_GROUP, 'label': this.$t('workflow-criteria-group') }, 
            {'value': WORKFLOWS.CRITERIA_CATEGORY, 'label': this.$t('workflow-criteria-category') }, 
            {'value': WORKFLOWS.CRITERIA_FIELD1, 'label': this.$t('workflow-criteria-field1') }, 
            {'value': WORKFLOWS.CRITERIA_FIELD2, 'label': this.$t('workflow-criteria-field2') }
        ];
        
    },
    watch:{
        currentSiteId(siteId){
            this.setRegions();
            this.initForm();
        }
    },
    computed:{
        ...mapGetters('site', ['currentSite', 'currentSiteId', 'currentSiteLabels']),
        nameErrors(){
            if(this.$v.configValue.$dirty){
                return (!this.$v.configValue.required) ? this.$t('error-required') : (!this.$v.configValue.maxLength) ? this.$t('workflow-max-length-error') : null;
            }
            return null;
        }
    },
    methods: {
        ...mapActions('workflow', ['getGroups', 'getCategories', 'createWorkflow']),
        ...mapActions('area', ['getAreas']),
        ...mapActions('zone', ['getZones']),
        ...mapActions('location', ['getLocationsBySite']),
        openWizard(){
            this.openForm = true;
            this.setCriteriaLabels();
        },
        setCriteriaLabels() {            
            this.tagsCriteria.forEach(criteria => {
                switch (criteria.value) {
                    case WORKFLOWS.CRITERIA_GROUP:
                        this.$set(criteria, 'label', this.currentSiteLabels.group)
                        break;
                case WORKFLOWS.CRITERIA_CATEGORY:
                        this.$set(criteria, 'label', this.currentSiteLabels.category)
                        break;
                case WORKFLOWS.CRITERIA_FIELD1:
                        this.$set(criteria, 'label', this.currentSiteLabels.field1)
                        break;
                case WORKFLOWS.CRITERIA_FIELD2:
                        this.$set(criteria, 'label', this.currentSiteLabels.field2)
                        break;
                    default:
                        break;
                }
            });
        },
        closeWizard(){
            this.openForm = false;
            this.initForm();
        },
        initForm(){
            this.$v.$reset();
            this.criterion = [{type: 'TAG_PROPERTY', operation: null, property: null, value: null}];
            this.emails = [{value: "", type: "email", id: 0}];
            this.configValue = '';
            this.tagCriterion = null;
            this.regionItems = [];
            this.tags = [];
            this.step = 1;
        },
        setRegions() {
            this.regions = [
                {'value': WORKFLOWS.REGIONS_AREA, 'label': this.$t('workflow-area')}, 
                {'value': WORKFLOWS.REGIONS_ZONE, 'label': this.$t('workflow-zone')}
            ];
            if(!this.currentSite.isAf3){
                this.regions.push({'value': WORKFLOWS.REGIONS_LOCATION, 'label': this.$t('workflow-location')});
            }
        },
        nameRule(){
            if(this.$v.configValue.$dirty && this.$v.configValue.$invalid){
                return false;
            }
            return true;
        },
        typeRule(){
            if(this.$v.criterion.$each[0].operation.$dirty && this.$v.criterion.$each[0].operation.$invalid){
                return false;
            }
            return true;
        },
        regionRule(){
            if(this.$v.criterion.$each[0].property.$dirty && this.$v.criterion.$each[0].property.$invalid){
                return false;
            }
            if(this.$v.criterion.$each[0].value.$dirty && this.$v.criterion.$each[0].value.$invalid){
                return false;
            }
            return true;
        },
        tagsRule(){
            if(this.tagCriterion){
                if(this.$v.tagCriterion.$dirty && this.$v.tagCriterion.$invalid){
                    return false;
                }
                if(this.$v.criterion.$each[1] && this.$v.tagCriterion.$dirty){
                    if(this.$v.criterion.$each[1].value.$dirty && this.$v.criterion.$each[1].value.$invalid){
                        return false;
                    }
                }
            }
            if(this.$v.tagCriterion.$dirty && this.tagCriterion === null){
                return false;
            }
            return true;
        },
        stepOne(){
            this.$v.configValue.$touch();
            if(!this.$v.configValue.$invalid){
                this.step = 2;
            }
        },
        stepTwo(){
            this.$v.criterion.$each[0].operation.$touch();
            if(!this.$v.criterion.$each[0].operation.$invalid){
                this.step = 3;
            }
        },
        stepThree(){
            this.$v.criterion.$each[0].property.$touch();
            this.$v.criterion.$each[0].value.$touch();
            if(!this.$v.criterion.$each[0].value.$invalid){
                this.step = 4;
            }
        },
        stepFour(){
            this.$v.tagCriterion.$touch();
            if(this.tagCriterion !== null && this.tagCriterion !== WORKFLOWS.CRITERIA_ALL){
                this.$v.criterion.$each[1].value.$touch();
                if(!this.$v.criterion.$each[1].value.$invalid){
                    this.step = 5;
                }
            }else{
                if(!this.$v.tagCriterion.$invalid){
                    this.step = 5;
                }
            }
        },
        stepFive(){
            this.$v.emails.$touch();
            if(!this.$v.emails.$invalid){
                this.step = 6;
            }
        },
        async handleRegion(){
            this.fetchingRegion = true;
            this.$set(this.criterion[0], 'value', null);
            if(this.criterion[0].property == WORKFLOWS.REGIONS_AREA){
                this.regionItems = await this.getAreas({siteId: this.currentSiteId});
            }else{
                if(this.criterion[0].property == WORKFLOWS.REGIONS_ZONE){
                    this.regionItems = await this.getZones({siteId: this.currentSiteId});
                }else{
                    if(this.criterion[0].property == WORKFLOWS.REGIONS_LOCATION){
                        this.regionItems = await this.getLocationsBySite({siteId: this.currentSiteId});
                    }
                }
            }
            this.fetchingRegion = false;
        },
        async handleTagCriteria(){
            if(this.criterion.length == 2){
                this.criterion.splice(1, 1)
            }
            if(this.tagCriterion !== WORKFLOWS.CRITERIA_ALL){
                this.criterion.push({type: 'TAG_PROPERTY', operation: 'EQUAL', property: this.tagCriterion, value: null});
                if(this.$v.tagCriterion.$dirty){
                    this.$v.criterion.$each[1].value.$touch();
                }
            }
            if(this.tagCriterion == WORKFLOWS.CRITERIA_GROUP){
                this.tags = await this.getGroups({siteId: this.currentSiteId});
            }else if(this.tagCriterion == WORKFLOWS.CRITERIA_CATEGORY){
                this.tags = await this.getCategories({siteId: this.currentSiteId});
            }else if(this.tagCriterion == (WORKFLOWS.CRITERIA_ALL) || this.tagCriterion == (WORKFLOWS.CRITERIA_FIELD1) || this.tagCriterion == (WORKFLOWS.CRITERIA_FIELD2)){
                this.tags = [];
            }
        },
        reqErrors(field){
            if(field.$dirty){
                return (!field.required) ? this.$t('error-required') : null;
            }
            return null;
        },
        emailsError(index){
            if(this.$v.emails.$each[index].$dirty){
                return (!this.$v.emails.$each[index].value.required) ? this.$t('error-required') : (!this.$v.emails.$each[index].value.email) ? this.$t('error-email-invalid') : null;
            }
            return null;
        },
        addEmail(){
            this.emails.push({value: "", type: "email", id: this.emails.length});
        },
        deleteEmail(index){
            this.emails.splice(index, 1)
        },
        async createWF(){
            try{
                if(!this.$v.$invalid){
                    let property = {};
                    if(this.criterion[0].operation === WORKFLOWS.TYPE_DELIVERY){
                        this.criterion[0].operation = WORKFLOWS.TYPE_ENTRY;
                        property = {"siteId": this.currentSiteId, "type": WORKFLOWS.TYPE_AUTOMATIC, "subType": WORKFLOWS.SUBTYPE_DELIVERY}
                    }else{
                        property = {"siteId": this.currentSiteId, "type": WORKFLOWS.TYPE_AUTOMATIC};
                    }
                    let body = {
                        configValue: this.configValue,
                        properties: property,
                        criterion: this.criterion,
                        actionProperties: this.emails
                    }
                    await this.createWorkflow(body);
                    this.$toasted.show(this.$t('workflow-created'), { 
                        position: "bottom-right",
                        className: ['toast-success'], 
                        duration : 3000
                    });
                    this.closeWizard();
                    this.$emit('creationFinished');
                }
            }catch (error){
                this.$toasted.show(error.data.message, { 
                position: "bottom-right",
                className: ['toast-error'], 
                duration : 5000
                });
            }
        },
    }
}
</script>
<style lang="scss" scoped>
    #regionList, #criteriaList{
        margin: 15px 3px;
        height: 200px;
        overflow-y: auto;
    }
    .error--text{
        font-size: 12px;
    }
    .emailContainer{
        max-height: 240px;
        overflow-y: auto;
        &::-webkit-scrollbar-track {
            border-radius: 10px;
            background-color: #fff;
        }
        &::-webkit-scrollbar {
            width: 12px;
            height: 12px;
            margin-left: 2px;
            margin-right: 2px;
            background-color: #fff;
        }
        &::-webkit-scrollbar-thumb {
            border-radius: 10px;
            background-color: #D8D8D8;
            border: 3px solid transparent;
            background-clip: content-box;
        }
    }
    .emailInput{
        width: 100%;
        float: left;
        .v-input{
            float: left;
            width: 85%;
        }
    }
</style>
