<template>
  <!-- added prevent drag and drop to avoid redirecting upon dropping files in the app -->
  <div @drop.prevent @dragover.prevent id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  watch: {
    $route() {
      //discard toasts on navigation
      this.$toasted.clear();
    },
  },
}
</script>
<style lang="scss">
@import 'assets/styles/common.scss';
@import 'assets/styles/animations.scss';
@import 'assets/styles/vuetify-custom.scss';
</style>
