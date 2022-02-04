<template>
    <v-dialog persistent v-model="dialogModel" max-width="350">
        <v-card>
            <v-card-title class="d-inline-block" v-bind:class="{'headline': dialogTitle}">{{ dialogTitle }}</v-card-title>
            <v-card-text class="mt-3">{{ dialogBody }}</v-card-text>
            <slot></slot>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-if="!dialogConfirmOnly" height="32" text color="secondary" @click="cancel" class="primary--text font-weight-bold">{{ $t('cancel') }}</v-btn>
                <v-btn depressed color="secondary" @click="confirm" class="px-8 float-right">{{ dialogConfirmBtn ? dialogConfirmBtn : $t('yes') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: [
        'dialogModel',
        'dialogTitle',
        'dialogBody',
        'dialogConfirmBtn',
        'dialogConfirmOnly'
    ],
    methods: {
        confirm() {
            this.$emit('confirm');       
        },
        cancel() {
            this.$emit('cancel');       
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