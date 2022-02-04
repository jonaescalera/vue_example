<template>
  <div>
    <v-list-item
      :key="item.title"
      link
      @click="deactiveSubLinks(item)"
      :to="item.toLink"
      :dense="true"
      v-bind:class="{
            'ma-2 mt-4 regular-link': !mini, 'mt-4': mini, 
            'regular-link-not-hover': !mini && item.subMenuItems && !item.collapsed, 
            'v-list-item--active': hasSubmenuActive(item.subMenuItems) && item.active}"
      color="primary"
      v-show="(item.condition ? evalCondition(item) : true)"
    >
      <!-- if sidebar is collapsed we show a popover to display submenuitems -->
      <v-menu
        :disabled="!item.subMenuItems"
        :absolute="false"
        :open-on-hover="true"
        :close-on-click="true"
        :close-on-content-click="true"
        :offset-x="true"
        v-if="mini"
      >
        <template v-slot:activator="{ on }">
          <div v-bind:title="$t(item.title)" v-on="on">
            <v-icon class="mini-link-icon" v-text="item.icon" medium></v-icon>
            <v-icon
              v-if="item.subMenuItems"
              class="mini-link-icon-arrow"
              v-text="'mdi-chevron-right'"
            ></v-icon>
          </div>
        </template>
        <v-list v-if="item.subMenuItems">
          <v-list-item v-if="item.subMenuItems.length === 0 && item.emptySubmenuInfo">
            {{$t(item.emptySubmenuInfo)}}
          </v-list-item>
          <v-list-item
            v-else
            class="submenu-link"
            v-for="(subItem, index) in item.subMenuItems"
            v-show="(subItem.condition ? evalCondition(subItem) : true) && ((!currentSite.isAf3) || (currentSite.isAf3 && !subItem.hideForAf3))"
            :key="index"
            v-bind:class="[{'submenu-item-name-active-mini': subItem.active && item.active}, {'warn-high': subItem.classWarn === 'high'}, {'warn-mid': subItem.classWarn === 'mid'}]"
            @click="onNavigate(subItem), activeSubLink(item, subItem)"
          >{{ subItem.string_name ? subItem.string_name : $t(subItem.name, { value: subItem.amount }) }}</v-list-item>
        </v-list>
      </v-menu>
      <!-- if sidebar is NOT collapsed we show an accordion -->
      <template v-else>
        <v-list-item-icon class="mr-2">
          <v-icon v-text="item.icon" medium></v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <div
            @click="onMainLinkSelected(item)"
            v-if="item.subMenuItems"
            class="submenu-title-clicker"
          ></div>
          <v-list-item-title
            v-bind:class="{ 'sub-menu-item-title': item.subMenuItems }"
          >{{$t(item.title)}}</v-list-item-title>
          <v-icon
            v-if="item.subMenuItems && !item.collapsed"
            class="regular-link-arrow"
            v-text="'mdi-chevron-up'"
          ></v-icon>
          <v-icon
            v-if="item.subMenuItems && item.collapsed"
            class="regular-link-arrow"
            v-text="'mdi-chevron-down'"
          ></v-icon>
          <div class="submenu-list" v-if="item.subMenuItems && !item.collapsed">
            <div
              class="mr-2 w-auto submenu-item-name"
              v-for="(subItem, index) in item.subMenuItems"
              v-show="(subItem.condition ? evalCondition(subItem) : true) && ((!currentSite.isAf3) || (currentSite.isAf3 && !subItem.hideForAf3))"
              :key="index"
              @click="onNavigate(subItem), activeSubLink(item, subItem)"
              v-bind:class="[{'submenu-item-name-active': subItem.active && item.active}, {'warn-high': subItem.classWarn === 'high'}, {'warn-mid': subItem.classWarn === 'mid'}]"
            >
            <v-icon
            small
            class="mr-1"
            v-if="subItem.classWarn === 'high'"
            v-text="'mdi-close-circle'"
          ></v-icon>
          <v-icon
            small
            class="mr-1"
            v-if="subItem.classWarn === 'mid'"
            v-text="'mdi-alert'"
          ></v-icon>{{ subItem.string_name ? subItem.string_name : $t(subItem.name, { value: subItem.amount }) }}</div>
          </div>
        </v-list-item-content>
      </template>
    </v-list-item>
    <confirm-modal 
      @confirm="noItemsModal = false"
      dialogConfirmOnly="true"
      :dialogModel="noItemsModal"
      :dialogBody="modalMsg"
      :dialogConfirmBtn="$t('ok')"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ConfirmModal from '../../components/shared/modals/confirmModal'

export default {
  props: ["item", "items", "mini"],
  data(){
    return{
      noItemsModal: false,
      modalMsg: null
    }
  },
  components: {
    ConfirmModal
  },
  computed: {
    ...mapGetters('site', ['currentSite']),
    ...mapGetters('organization', ['currentOrganization', 'orgRoles']),
  },
  methods: {
    evalCondition(item){
      let result = true;
      if(Array.isArray(item.condition)){
        item.condition.forEach(condition => {
            result = result && ((!!this[condition.getter] && this[condition.getter] !== undefined) ? (this[condition.getter][condition.property] === condition.value) : false);
        });
        if(result && item.loadSubMenu && (item.subMenuItems[0] && (Object.keys(item.subMenuItems[0]).length === 0))){
          this.loadSubmenu(item);
        }
      }else{
        if(item.subMenuItems){
          result = false;
          item.subMenuItems.forEach(subItem => {
            result = result || this.evalCondition(subItem);
          });
        }
      }
      return result; 
    },
    async loadSubmenu(item){
      let submenu = await this.$store.dispatch(item.loadSubMenu);
      item.subMenuItems = submenu;
    },
    deactiveSubLinks(item) {
      if (!item.subMenuItems) {
        this.items.map(item => {
          if (item.subMenuItems) {
            item.subMenuItems.map(subMenuItem =>
              this.$set(subMenuItem, "active", false)
            );
          }
        });
      }
    },
    hasSubmenuActive(subMenuItems) {
      if (subMenuItems) {
        for (let index = 0; index < subMenuItems.length; index++) {
          if (subMenuItems[index].active) {
            return true;
          }
        }
      }
    },
    onNavigate(item) {
      if(item.param){
        (this.$router.currentRoute.name !== item.toLink || JSON.stringify(this.$router.currentRoute.params) !== JSON.stringify(item.param) ) ? this.$router.push({name: item.toLink, params: item.param}) : null;
      }
      else{
        this.$router.currentRoute.path !== item.toLink ? this.$router.push(item.toLink) : null;
      }
    },
    activeSubLink(item, subItem) {
      if (item && subItem && subItem.toLink) {
        item.subMenuItems.map(submenuItem =>
          this.$set(submenuItem, "active", false)
        );
        this.$set(subItem, "active", true);
      }
    },
    async onMainLinkSelected(item) {
      if(item.collapsed && item.loadSubMenu && item.subMenuItems.length === 0){
          this.noItemsModal = true;
          this.modalMsg = this.$t(item.emptySubmenuInfo);
      }
      if (item.subMenuItems) {
        //there are submenu items, open a panel
        this.$set(item, "collapsed", !item.collapsed);
      }
    }
  }
};
</script>

<style lang='scss' scoped>
.regular-link {
  padding-left: 8px !important;
}
.regular-link-not-hover {
  &:hover {
    background-color: white !important;
  }
}
.v-list .v-list-item--active .v-list-item__title {
  font-weight: 600;
}

.v-list .v-list-item:not(.logout-item):hover {
  background-color: var(--v-primaryLight-base);
  color: var(--v-primary-base) !important;
}
.v-list .v-list-item--active .v-list-item__title {
  font-weight: 600;
}
.v-list-item.v-list-item--dense.v-list-item--link.theme--light.primary--text.mt-4 {
  height: auto;
  padding: 0px;
  .v-list-item.v-list-item--link.theme--dark.se--text {
    height: 40px;
    min-height: 40px;
    margin-bottom: 0px;
    padding: 0px;
  }
}
.v-list-item.theme--light {
  font-size: 12px;
}
.theme--light.v-icon:focus::after {
  opacity: 0;
}
.v-list-item__title {
  font-size: 12px;
}

.regular-link-arrow {
  position: absolute;
  font-size: 17px;
  right: 5px;
  top: 12px;
  height: inherit;
  width: inherit;
}
.submenu-link {
  height: 30px;
  min-height: initial;
  text-transform: capitalize;
  &:hover {
    background-color: var(--v-primaryLight-base);
    cursor: pointer;
  }
}
.submenu-title-clicker {
  position: absolute;
  background-color: transparent;
  height: 40px;
  width: 100%;
  left: 0px;
  top: 0px;
  z-index: 1;
}
.submenu-list {
  margin-top: 20px;
  margin-left: -6px;
}
.sub-menu-item-title {
  margin-top: 6px;
}
.submenu-item-text {
  height: 40px;
  width: 100%;
  margin-top: 17px;
  margin-bottom: 17px;
}
.submenu-item-name {
  height: 30px;
  min-height: auto;
  padding: inherit;
  padding-left: 6px;
  border-radius: 4px;
  text-transform: capitalize;
}
.submenu-item-name-active {
  color: var(--v-primary-base) !important;
  font-weight: bold;
}
.submenu-item-name-active-mini {
  background-color: var(--v-primaryLight-base);
}
.mini-link-icon {
  height: 40px;
  width: 100%;
  padding: 8px;
}
.mini-link-icon-arrow {
  position: absolute;
  top: 13px;
  left: 28px;
  font-size: 15px;
}
.warn-high:before {
  content: '';
  width: 2px;
  height: 30px;
  left: 20px;
  position: absolute;
  background-color: var(--v-error-base);
}
.warn-mid:before {
  content: '';
  width: 2px;
  height: 30px;
  left: 20px;
  position: absolute;
  background-color: var(--v-warning-base);
}
.warn-mid, .warn-high{
  align-items: center;
  display: flex;
}
</style>