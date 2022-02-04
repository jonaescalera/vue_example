<template>
  <div class="error-alert" v-if="error">
    <v-alert :light="true" transition="scale-transition"  type="error" :dense="true" >{{message}}</v-alert>
  </div>
</template>


<script>
export default {
  props:['error'],
  computed:{
    message(){
      if(typeof this.error === "object" && this.error!==null){
        const {response: { data } } =this.error;
        if(data){
          return data.message;
        }
      }
    }
  }
}
</script>

<style scoped>
.error-alert{
  overflow-x: overlay;
}
</style>