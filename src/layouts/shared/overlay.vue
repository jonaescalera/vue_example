<template>
  <div id="overlay" @click="touched" v-bind:class="{ 
    'overlay-custom': getOverlay === 'visible', 
    'overlay-not-init': getOverlay === '', 
		'closed-overlay': getOverlay === 'notVisible' }">
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
export default {
  computed: {
    ...mapGetters('layout', ['getOverlay'])
  },
  methods: {
    ...mapMutations('layout', ['destroyOverlay', 'closeOverlay']),
    touched() {
      this.closeOverlay;
    }
  },
  beforeDestroy() {
    this.destroyOverlay; 
  },
}
</script>

<style lang="scss" scoped>
  .overlay-not-init {
    display: none;
  }
  .overlay-custom {
    position: absolute;
    background-color: rgb(33, 33, 33);
    opacity: 0.2;
    z-index: 7;
    width: 100vw;
    height: 100vh;
    animation-fill-mode: forwards;
		animation-name: fade-in;
		animation-duration: .5s;
  }
  .closed-overlay {
    position: absolute;
    background-color: rgb(33, 33, 33);
    z-index: 2;
    width: 100vw;
    height: 100vh;
    animation-fill-mode: forwards;
		animation-name: fade-out;
    animation-duration: .5s;
  }
  @keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 0.4; }
  }
  @keyframes fade-out {
		0% { opacity: 0.4; }
    99% { opacity: 0; }
    100% { opacity: 0; z-index: 0; }
    
	}
	
</style>