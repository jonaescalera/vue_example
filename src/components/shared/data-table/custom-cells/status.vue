<template>
    <div class="fit-content">
      <v-chip
        v-if="params[field] !== null"
        v-bind:class="{ 'status-active': params[field] }"
        class=""
        text-color="white"
        >
        <div class="chip-text" v-if="params[field]"><img v-bind:src="greenCheck"/>
            <div class="d-inline-block status-text-chip">{{ renderParams.isTrue }}</div>
        </div>
        <div class="chip-text" v-else><img class="mt-1" v-bind:src="greyX"/>
            <div class="d-inline-block status-text-chip">{{ renderParams.isFalse }}</div>
        </div>
      </v-chip>
      <span v-else>
        --
      </span>
    </div>
</template>

<script> 
    export default {
    	props: ['params', 'field', 'renderParams'],
        data() {
          return {
            greyX: require('../../../../assets/img/icons/grey-x.svg'),
            greenCheck: require('../../../../assets/img/icons/green-check.svg')
          }
        }
    };
</script>

<style lang="scss" scoped> 
 .status-text-chip {
    margin-left: 19px;
    margin-top: 2px;
    margin-right: 2px;
 }
 .fit-content{
 	width: fit-content;
 }
</style>