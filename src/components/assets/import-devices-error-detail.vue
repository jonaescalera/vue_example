<template>
  <div>
    <v-dialog
      @click:outside="closeModal"
      @keydown.esc="closeModal"
      v-model="dialog"
      width="60vw"
    >
      <v-card id="viewDeviceModal"> 
        <v-btn color="primary" text fab outlined x-small dark class="float-right mt-1 mr-1 closeBtn" title="close" @click="dialog = false">
            <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-text>
          <v-row>
          <v-col  class="default-scroll-bar error-container ma-3 mt-9 mr-0" v-if="errors && errors.length > 0">
            <div class="item" v-for="(error,i) in errors" :key="i">
              <label>{{ $t('error-line', {index: error.line}) }}</label>
              <div class="text">{{ error.msg }}</div>
            </div>
          </v-col>
        </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      errors: []
    };
  },
  methods: {
    openModal(errors) {
      Object.keys(errors).map((key)=>{
        this.errors.push({line: parseInt(key)+1, msg: errors[key] })
      })
      this.dialog = true;
    },
    closeModal() {
      this.dialog = false;
      this.errors = [];
    }
  },
};
</script>

<style lang="scss" scoped>
#viewDeviceModal {
  min-height: 100px;
}
.closeBtn {
    top: 0px;
    right: 0px;
    position: absolute;
}
.item {
  margin: 15px 0;
  .text {
    font-weight: bold;
  }
}
.error-container {
    display: block;
    overflow: scroll;
}
.title {
    color: var(--v-error-base);
}
</style>