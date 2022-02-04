<template>
    <v-dialog persistent v-model="dialogModel" max-width="350">
        <v-card>
            <v-card-title v-bind:class="{'headline': dialogTitle}">{{ dialogTitle }}</v-card-title>
            <v-card-text v-if="!customMessage" v-html="$t('permanent-removal-confirmation', {name: nameToDelete})" class="mt-3"></v-card-text>
            <v-card-text v-if="customMessage" class="mt-3">{{ customMessage }}</v-card-text>
            <v-text-field
                class="px-5"
                :label="nameToDelete"
                tabindex="10"
                v-model="inputText"
                :dense="true"
                autofocus
                @paste="handleOnPaste"
                outlined
                color="secondary"
                ></v-text-field>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn height="32" text color="secondary" @click="cancel" class="primary--text font-weight-bold">{{ $t('cancel') }}</v-btn>
                <v-btn :disabled='inputText.trim() !== nameToDelete' depressed color="error" @click="confirm" class="px-8 float-right">{{$t('delete') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data() {
        return {
            inputText: ''
        }
    },
    watch: {
        dialogModel: function (model) {
            if (!model) {
                this.inputText = '';
            }
        }
    },
    props: [
        'dialogModel',
        'dialogTitle',
        'nameToDelete',
        'customMessage'
    ],
    methods: {
        confirm() {
            this.$emit('confirm');       
        },
        cancel() {
            this.$emit('cancel');       
        },
        handleOnPaste(e) {
            e.preventDefault();
            return false;
        }
    }
}
</script>

<style scoped>
  .headline {
    height: 48px;
    font-size: 18px !important;
    font-weight: 600;
    color: #3B5762;
  }
</style>