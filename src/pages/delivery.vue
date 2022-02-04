<template>
  <div id="delivery" ref="delivery">
    <v-row>
      <v-col class="custom-card px-0 pa-0">
        <v-row class="mb-3" style="height: 40px;">
          <search-bar 
            v-if="(!getIsMobileIpadPortrait || (getIsMobileIpadPortrait && !getMapVisible))" 
            :searchText="searchTerm" 
            :cleanText="cleanText"
            :placeholder="$t('delivery-placeholder')" 
            @clearClicked="clearSearchClicked" 
            @onSearchBarKeyUp="searchTyped" 
            @searchText="searchBarFilter" 
          />
        </v-row>
        <DataTable
          v-show="!getMapVisible"
          :visible="getMapVisible"
          :settings="settings"
          :resizeRef="deliveryRef"
          name="delivery"
          :columns="columnDefs"
          :rows="deliveries"
          :totalRows="6"
          :page="1"
          :pageSize="10"
          :customTableContainerClass="'withoutFilters'"
          @onPaginationChange="onPaginationChange"
          @onSort="onSorting"
        ></DataTable>            
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import dummy from "../assets/data/dummy"
import SearchBar from "../components/search-bar/search-bar";
import DataTable from "../components/shared/data-table/data-table";

export default {

  data() {
    return {
      getMapVisible: false,
      deliveryRef: null,
      searchTerm: '',
      cleanText: false,
      deliveries: dummy.deliveries,
      settings: {
        sorting: true,
      },
      columnDefs: [
        { 
          name: this.$i18n.t('date'), 
          field: "date", 
          type: "data"
        }, 
        {
          name: this.$i18n.t('route'),
          field: "route",
          type: "data",
          width: "15%"
        },
        { 
          name: this.$i18n.t('cart'), 
          field: "cart",
          type: "data"
        },
        { 
          name: this.$i18n.t('rpc'), 
          field: "rpc",
          type: "data"
        },
        { 
          name: this.$i18n.t('upc'), 
          field: "upc",
          type: "data"
        }
      ]
    }
  },
  components: {
    SearchBar,
    DataTable
  },
  computed: {
    ...mapGetters('layout', ['getWindowWidth', 'getIsMobileIpadPortrait', 'isSidebarMini']),
  },
  mounted(){
    this.deliveryRef = this.$refs.delivery; 
  },
  methods: {
    clearSearchClicked() {

    },
    searchTyped() {

    },
    searchBarFilter() {

    },
    onPaginationChange() {

    },
    onSorting() {

    }
  }
}
</script>

<style scoped>
.delivery-table{
  width: 100%;
  padding-left: 14px;
  padding-right: 5px;
}
</style>