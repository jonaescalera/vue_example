<template>
  <div id="tableau" class="dashboard frame">
    <v-row v-if="url" class="card-no-footer-height">
      <iframe :src="url"></iframe>
    </v-row>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import AuthService from '../services/auth';

export default {
  data() {
    return {
      url: null,
      viewName: null
    };
  },
  computed: {
    ...mapGetters('site', ['currentSiteId']),
  },
  watch: {
    currentSiteId(id) {
      this.setupDashboard(id);
    },
    $route(to, from) {
      this.viewName = to.params.view;
      this.setupDashboard();
    }
  },
  mounted() {
    this.viewName = this.$route.params.view;
    this.setupDashboard();
  },
  methods: {
    async setupDashboard() {
      this.url = undefined;
      try {
        const token = await AuthService.getTableauToken();
        this.url = `https://data.airfinder.com/trusted/${token}/views/${this.viewName}?:showShareOptions=false`;
      } catch (error) {}
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  margin-top: -24px;
}

.frame iframe {
  width: 100%;
  height: 100vh;
}
</style>