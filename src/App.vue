<template>
  <!-- added prevent drag and drop to avoid redirecting upon dropping files in the app -->
  <div @drop.prevent @dragover.prevent id="app">
    <loader-indicator />
    <component v-if="layout" :is="layout">
      <router-view></router-view>
    </component>
    <router-view v-if="!layout"></router-view>
  </div>
</template>

<script>
import LoaderIndicator from './layouts/shared/loading-indicator';
import { mapActions, mapGetters, mapMutations } from 'vuex';
export default {
  name: 'app',
  computed: {
    ...mapGetters('ga', ['getUserId']),
    layout() {
      return this.$route.meta.layout ? this.$route.meta.layout : '';
    },
  },
  components: {
    'loader-indicator': LoaderIndicator,
  },
  watch: {
    $route(to, from) {
      //discard toasts on navigation
      this.$toasted.clear();
    },
  },
	created() {
    this.resetLoadingCount();
    const userId = this.getUserId;
    if (userId) {
      // since google analytics and Chameleon scripts are included in index.html, 
      // some time is needed before this scripts are loaded in order to be initialized 
      // with the corresponding id in place
      let interval = setInterval(() => {        
        if (window.ga && window.chmln) {
          this.setCurrentUserId(userId);
          clearInterval(interval);
        }
      }, 1000);
    }
  },
  methods: {
    ...mapActions('ga', ['setCurrentUserId']),
    ...mapMutations('layout',['resetLoadingCount'])
  }
}
</script>
<style lang="scss">
@import 'assets/styles/common.scss';
@import 'assets/styles/animations.scss';
@import 'assets/styles/vuetify-custom.scss';
</style>
