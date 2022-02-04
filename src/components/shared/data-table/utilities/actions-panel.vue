<template>
  <div id="table-actions">
    <hr class="hr-selection-row" />
    <span id="assets-list-delete" @click="handleOnDelete">
      <v-icon
        small
        class="primary--text ml-5 mr-1 pb-1"
        color="secondary"
        v-text="'mdi-trash-can-outline'"
      ></v-icon>
      {{$t('assets-page-option-delete')}}
    </span>
    <!-- <span class="option-disabled">
      <v-icon small class="primary--text ml-5 mr-1 pb-1" v-text="'mdi-link-off'"></v-icon>
      {{$t('assets-page-option-disassociate')}}
    </span>
    <span class="option-disabled">
      <v-icon small class="primary--text ml-5 mr-1 pb-1" v-text="'mdi-plus'"></v-icon>
      {{$t('assets-page-option-group')}}
    </span> -->
    <span id="assets-list-hide" @click="onHideDeselected">
      <v-icon
        small
        class="primary--text ml-5 mr-1 pb-1"
        color="secondary"
        v-text=" hide ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
      ></v-icon>
      {{$t( hideText )}}
    </span>
    <span id="assets-list-export" @click="$emit('on-export')">
      <v-icon small class="primary--text ml-5 mr-1 pb-1" color="secondary" v-text="'mdi-close-box'"></v-icon>
      {{$t('assets-page-option-export')}}
    </span>
  </div>
</template>
<script>
export default {
  name: 'panel',
  data() {
    return {
      hide: false,
      hideText: 'assets-page-option-hide-deselected',
    };
  },
  methods: {
    onHideDeselected() {
      this.hide = !this.hide;
      if (this.hide) this.hideText = 'assets-page-option-show-all';
      else this.hideText = 'assets-page-option-hide-deselected';
      this.$emit('on-hide-deselected', this.hide);
    },
    handleOnDelete() {
      this.$emit('on-delete');
    },
  },
};
</script>
<style lang="scss" scoped>
#table-actions {
  font-size: 13px;
  cursor: pointer;
  color: var(--v-primary-darken2);
}

.hr-selection-row {
  border: 0;
  width: 98%;
  height: 12px;
  box-shadow: inset 0 12px 5px -10px #bbbbbb;
}

.option-disabled {
  color: gray;
  cursor: not-allowed;
}
</style>