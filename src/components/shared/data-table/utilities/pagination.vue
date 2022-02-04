<template>
   <v-row id="pagination" class="mt-5">
       <v-col>
           <div class="float-right pagination-text">
                <span>{{$t('pagination-viewing')}}&nbsp;</span>
                <span class="font-weight-bold">{{getViewingOf}}&nbsp;</span>
                <span>{{$t('pagination-viewing-of')}}&nbsp;</span> 
                <span class="font-weight-bold">{{getTotalRows}}</span>
           </div>
        </v-col>
        <v-col md="3" cols="9">
            <v-pagination 
                v-model="currentPage"
                :length="pageCount"
                :total-visible="7"
                color="secondary"
                @input="changedPageNumber"
            >         
            </v-pagination>
        </v-col>
        <v-col>
            <div class="float-left dropdown font-weight-bold d-sm-none d-md-block">
              <v-select
                  id="per-page"
                  :items="rowsPerPage"    
                  :label="'' + getSize "
                  dense
                  solo 
                  @change="changedRowsPerPage"
                  suffix="per page" >
              </v-select> 
            </div>
            <div class="float-left ml-3">
              <v-text-field
                id="goto-page"
                v-model="goToPage"
                :label="$t('pagination-go-to-page')"
                outlined
                type="number"
                :dense="true"
                v-on:keyup.enter="onGoToPage"
                color="secondary"
              ></v-text-field>
            </div>
        </v-col> 
    </v-row>
</template>

<script>
  export default {
    data: function(){
      return {
        currentPage: 1,
        rowsPerPage: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        goToPage: null
      }
    },
    props:['rowsCount', 'page', 'size'],
    watch: {
      page(newValue) {
        this.currentPage = newValue;
      }
    },
    mounted(){
        this.currentPage = this.page;
    },
    computed:{
      getSize(){
        return this.size;
      },
      getTotalRows(){
        return this.rowsCount;       
      },
      pageCount() {
        return Math.ceil(this.getTotalRows / this.size);
      },
      getViewingOf(){
        const from = ((Number(this.currentPage) - 1) * Number(this.size)) + 1;
        const to = (Number(from) - 1) + Number(this.size);
        return `${this.getTotalRows>0?from:0}-${to>=this.getTotalRows?this.getTotalRows:to}`;
      }
    },
    methods:{
      changedRowsPerPage(option){
        let size = option;
        if (this.currentPage > Math.ceil(this.getTotalRows / size)) {
          this.currentPage = Math.ceil(this.getTotalRows / size);
        }
        this.goToPage = null;
        this.$emit('paginationChange', {'page': this.currentPage, 'size': size});
      },
      changedPageNumber(page){
        this.currentPage = page;
        this.goToPage = null;
        this.$emit('paginationChange', {'page': this.currentPage, 'size': this.size});
      },
      onGoToPage(){
        if(this.goToPage){
          if(this.goToPage < 1){
            this.goToPage = 1;
          }else{
            if(this.goToPage > this.pageCount){
              this.goToPage = this.pageCount;
            }
          }
          if(this.currentPage !== this.goToPage){
            this.currentPage = parseInt(this.goToPage);
            this.$emit('paginationChange', {'page': this.currentPage, 'size': this.size});
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
#pagination{
  background-color: #ffffff;
}
.dropdown{
  width: 140px; 
  margin-top: 3px;
  font-size: 10px;
  color: var(--v-primary-darken2);
}
.pagination-text{
  color: var(--v-primary-darken2);
  margin-top: 15px;
  font-size: 10px;
}

@media (max-width: 812px) {
  #pagination .col:nth-child(3){
    display:none;
  }
}
@media (max-width: 414px) {
  .pagination-text span:first-child {
    display:none;
  }
}
</style>