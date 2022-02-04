<template>
    <v-dialog v-model="openForm" width="413" scrollable>
        <v-card id="userEdit">
            <v-card-title class="secondary">{{ $t('workflow-edit') }}</v-card-title>
            <v-card-text>
                <v-form @submit.stop.prevent id="wfEditForm" ref="wfForm" class="mt-6">
                    <v-text-field
                        id="wf-name"
                        :label="$t('workflow-column-name')"
                        v-model="name"
                        :error-messages="nameErrors"
                        :dense="true"
                        color="secondary"
                        outlined
                        required
                        :hint="$t('workflow-name-label-hint')"
                    ></v-text-field>
                    <v-checkbox
                        id="wf-enabled"
                        v-model="enabled"
                        color="secondary"
                        :label="$t('workflow-column-enabled')"
                        class="mt-0"
                    ></v-checkbox>
                    <div class="emailContainer pt-2">
                        <div v-for="(item, i) in $v.emails.$each.$iter" :key="i" :id='"email"+i' class="emailInput">
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
                            <v-btn :id='"add-email-"+i' class="mx-2 mr-1 mt-1 float-right" fab dark x-small color="secondary" :title="$t('workflow-emails-title')" @click="addEmail" v-if="i == emails.length-1">
                                <v-icon dark>mdi-plus</v-icon>
                            </v-btn>
                            <v-btn :id='"remove-email-"+i' class="mt-1 ml-2" fab dark x-small color="secondary" :title="$t('workflow-emails-title')" @click="deleteEmail(i)" v-if="i > 0">
                                <v-icon dark>mdi-minus</v-icon>
                            </v-btn>
                        </div>
                    </div>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <div class="text-right w-100">
                    <v-btn id="wf-edit-cancel" text color="secondary" @click="openForm = false">{{ $t('cancel') }}</v-btn>
                    <v-btn id="wf-edit-save" depressed color="secondary" @click="editTheWorkflow">{{ $t('save') }}</v-btn>
                </div>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import { required, maxLength, email } from 'vuelidate/lib/validators'
import { mapActions } from 'vuex'

export default {
    data() {
        return {
            openForm: false,
            workflow: null,
            name: null,
            enabled: null,
            emails: []
        }
    },
    validations: {
      name: {required, maxLength: maxLength(200)},
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
    computed:{
        nameErrors(){
            return (!this.$v.name.required) ? this.$t('error-required') : (!this.$v.name.maxLength) ? this.$t('workflow-max-length-error') : null;
        }
    },
    methods: {
        ...mapActions('workflow', ['editWorkflow']),
        openModal(row){
            this.workflow = row;
            this.$v.$reset();
            this.name = row.name;
            this.enabled = row.enabled;
            let emailList = row.notify.split(', ');
            this.emails = [],
            emailList.forEach((email, index) => {
                this.emails.push({value: email, type: "email", id: index})
            });
            this.openForm = true;
        },
        addEmail(){
            this.emails.push({value: "", type: "email", id: this.emails.length});
        },
        deleteEmail(index){
            this.emails.splice(index, 1);
        },
        emailsError(index){
            return (!this.$v.emails.$each[index].value.required) ? this.$t('error-required') : (!this.$v.emails.$each[index].value.email) ? this.$t('error-email-invalid'): null;
        },
        async editTheWorkflow(){
            try{
                if(!this.$v.$invalid){
                    let body = {
                        enabled: this.enabled,
                        actionProperties: this.emails
                    }
                    if (this.workflow.name !== this.name) {
                        body.configValue = this.name;
                    }
                    await this.editWorkflow({id: this.workflow.id, body: body});
                    this.$toasted.show(this.$t('workflow-edited'), { 
                        position: "bottom-right",
                        className: ['toast-success'], 
                        duration : 3000
                    });
                    this.openForm = false;
                    this.$emit('editionFinished');
                }
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
<style lang="scss" scoped>
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
            width: 76%;
        }
    }
</style>