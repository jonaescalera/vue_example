<template>
  <div>
    <v-alert
      id="activate-alert"
      class="text-center"
      :value="!!message"
      transition="scale-transition"
    >
      {{ message }}
    </v-alert>

    <v-alert
      id="activate-support-info"
      class="support text-center mt-1"
      :value="!!message"
      transition="scale-transition"
    >
      <i18n path="activate-support-message">
        <a href="mailto:support@link-labs.com">
          support@link-labs.com
        </a>
      </i18n>
    </v-alert>
  </div>
</template>

<script>
export default {
  props: ['message'],
};
</script>

<style type="text/css" scoped>
.v-alert {
  color: red !important;
  font-size: 12px;
  padding: 0px;
  margin: 0px;
}
.v-alert.support {
  color: var(--v-primary-darken2) !important;
}
</style>
