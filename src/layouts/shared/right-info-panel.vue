<template>
  <div id="right-drawer"> 
    <div class="right-container">
      <div class="right-container-header">
        <div class="right-container-title">
          {{ getRightContainerItem.name }}
        </div>
        <v-icon @click="close" color="white" class="mb-4">mdi-close</v-icon>
      </div>

      <!-- we bind any component to the right info panel, also we can pass an object with information
      by the  "$store.getters.getRightContainerItem" which can be taken by the child component by using
      "this.$attrs". 
      
      Note that on every change the object needs to be reassigned. Exmple from orgnization-preview.vue:
      
      export default {
        data() {
          return {
            item: this.$attrs
          }
        },
        updated() {
          this.item = this.$attrs;
        }
      }
      
      -->
      <component 
        v-bind:is="getRightContainerComponent"
        v-bind="getRightContainerItem">
      </component>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  computed:{
    ...mapGetters('layout', ['getRightContainerItem', 'getRightContainerComponent'])
  },
  methods: {
    ...mapMutations('layout', ['closeRightContainer']),
    close() {      
      this.closeRightContainer; 
    }
  }
}
</script>

<style lang="scss" scoped>
.right-container {
  height: 100vh;
  position: absolute;
  background-color: #fff;
  z-index: 1;
  top: 0px;
  width: 450px;
  padding-right: 15px;
  box-shadow: 0 2px 9px 0 rgba(0, 0, 0, 0.5);
}
.right-container-header {
  height: 66px;
  background-color: var(--v-secondary-base);
}
.right-container-title {
  display: inline-block;
  padding-top: 21px;
  padding-left: 25px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  width: 390px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

</style>