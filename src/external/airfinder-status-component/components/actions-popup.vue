<template>
  <div class="center-content">
    <v-menu
      bottom
      left
      :close-delay="closeDelay"
      :open-on-hover="true"
      :close-on-click="true"
      :close-on-content-click="true"
      :offset-x="true"
    >
      <template v-slot:activator="{ on }">
        <v-btn class="center-content w-100 btn-actions" icon v-on="on">
          <v-icon ref="icon" class="icon-color">mdi-dots-horizontal</v-icon>
        </v-btn>
      </template>
      <v-list>
        <template v-for="(item, index) in ownActions">
          <v-list-item v-if="item.visible" :key="index" @click="item.fn(row)">
            <v-icon small class="mr-2">mdi-{{ item.icon }}</v-icon>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  props: ['actions', 'row', 'iconColor', 'closeDelay'],
  data() {
    return {
      ownActions: [],
    };
  },
  watch: {
    row: function () {
      this.setOwnActions();
    },
  },
  mounted() {
    this.setOwnActions();
  },
  methods: {
    setOwnActions() {
      if (this.actions && this.actions.length > 0) {
        this.ownActions = [];
        this.actions.map((action) => {
          let ownAction = {};
          Object.assign(ownAction, action);
          if (ownAction.condition) {
            switch (ownAction.condition.operator) {
              case '===':
                if (
                  this.row[ownAction.condition.field] ===
                  ownAction.condition.value
                ) {
                  ownAction.visible = true;
                } else {
                  ownAction.visible = false;
                }
                break;
              default:
                break;
            }
          } else {
            if (ownAction.enabledIf) {
              ownAction.visible = true;
              ownAction.enabledIf.forEach((e) => {
                if (!this.row[e]) {
                  ownAction.visible = false;
                }
              });
            } else {
              ownAction.visible = true;
            }
          }
          this.ownActions.push(ownAction);
        });
      }
      if (this.iconColor) {
        this.$refs.icon.$el.style.cssText =
          'color:' + this.iconColor + '!important;';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.icon-color {
  color: #b8bdc7 !important;
}
.v-list-item .v-list-item__title {
  color: var(--v-primary-darken2);
  font-size: 14px;
}
.btn-actions {
  border: none;
  background: transparent;
}
.center-content {
  display: block !important;
  margin: auto;
}

.w-100 {
  width: 100% !important;
}
</style>