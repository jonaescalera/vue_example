<template>
  <v-overlay style="z-index: 300" :value="getLoading">
    <v-progress-circular class="custom-loader" indeterminate size="70" width="5" color="secondary"></v-progress-circular>
  </v-overlay>
</template>

<script>
  import { mapGetters } from 'vuex';
  export default {
    computed: {
      ...mapGetters('layout', ['getLoading'])
    }
  };
</script>

<style scoped>
.custom-loader {
  color: var(--v-secondary-darken1);
  position: absolute;
  left: calc(50% - 35px);
  top: 45%;
  z-index: 1000;
}
</style>