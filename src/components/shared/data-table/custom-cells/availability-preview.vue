<script>
export default {
  props: ['params', 'field'],
  data() {
    return {
      active: false
    }
  },
  methods: {
    // toggle active variable to see/hide "preview" button
    mouseOver() {
      this.active = true;   
    },
    mouseLeave() {
      this.active = false;   
    },
    openPreview() {
      this.$emit('previewItem',this.params)    
    }
  }
};
</script>

<template>
  <div @mouseover="mouseOver" @mouseleave="mouseLeave" class="mt-2 full-container">
      <div v-if="params.available || params.isOrganization" class="font-weight-bold d-inline-block data-container">
        <img v-if="params.isOrganization" class="mb-2 mr-3" v-bind:src="params.icon" height="20"/>
        <img v-else class="mb-2 mr-3" src="../../../../assets/img/logo-sm.png" height="20"/>
        <div v-bind:class="{ 'organization-table-name': params.isOrganization }" class="text-ellipsis d-inline-block mb-2">
          <v-tooltip top content-class="tooltip" nudge-left>
                <template v-slot:activator="{ on }">
                 <span v-on="on"> {{ params[field] }} </span>
                  </template>
                  <span> {{ params[field] }} </span>
            </v-tooltip>
        </div>
      </div>

      <div class="d-inline-block data-container" v-else>
        <div class="empty-img">
        </div>
        <div v-bind:class="{ 'organization-table-name': params.isOrganization }" class="font-weight-bold d-inline-block text-ellipsis mb-2"> 
            <v-tooltip top content-class="tooltip" >
                <template v-slot:activator="{ on }">
                 <span v-on="on"> {{ params[field] }} </span>
                </template>
                  <span> {{ params[field] }} </span>
            </v-tooltip>
        </div>
      </div>
      <div class="d-inline-block preview-container float-right" v-if="active">
        <button @click="openPreview" class="btn-table-preview"> 
          Preview 
        </button> 
      </div> 
  </div>
</template>

<style lang="scss" scoped>
  .preview-container{
    margin-left: 15px;
    margin-right: 15px;
  }
  .empty-img{
    margin-bottom: -3px; margin-right: 10px; width: 20px; height: 20px; display: inline-block;
  }
  .text-ellipsis{
  	text-overflow: ellipsis;
    overflow: hidden;
    width: calc(100% - 25px);
    white-space: nowrap;
  }
  .custom-card{
  	overflow-y: auto!important;
  }
  .full-container:hover{
    .data-container {width: calc(100% - 103px);}
  }
  .data-container{
    width: 100%;
    
  }
 
  // preview button inside name cell
  .btn-table-preview {
    width: 73px;
    height: 23px;
    border-radius: 6px;
    border: solid 1px #bad6db;
    background-color: #f3f7f8;
    margin-bottom: 2px;
    color: var(--v-primary-base);
    font-size: 0.7rem;
    line-height: normal;
    &:focus {
      box-shadow: none;
    }
  }
  .tooltip{
    height: 29px;
    border-radius: 3px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
    background-color: var(--v-primary-base);
  }
</style>