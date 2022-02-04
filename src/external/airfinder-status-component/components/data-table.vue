<template>
  <div>
    <div ref="loading" class="overlay-grid">
      <div class="loader-custom"></div>
    </div>
    <div class="table-container" :style="{ 'max-height': this.gridHeight }">
      <table
        ref="myTable"
        :class="{ 'small-font': isSortable }"
        class="tableFixHead"
      >
        <thead>
          <tr>
            <th
              v-for="(col, index) in columns"
              :key="index"
              @click="[isSortable ? sort(col, index) : '']"
            >
              {{ col.headerName }}
              <img
                class="sort-icon"
                :src="
                  col.order !== undefined
                    ? col.order
                      ? sortIconUp
                      : sortIconDown
                    : ''
                "
              />
            </th>
            <th v-if="actions" class="more-actions">
              <img :src="combinedShapeIcon" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in rows"
            :key="index"
            :class="getRowClass(row)"
          >
            <td
              v-for="(col, index) in columns"
              :key="index"
              :title="
                col.tooltipField
                  ? getCellValue(row, col.tooltipField)
                  : getCellValue(row, col.field)
              "
            >
              {{
                col.valueFormatter
                  ? applyFormatter(row, col)
                  : getCellValue(row, col.field)
              }}
            </td>
            <td v-if="actions" class="more-actions">
              <ActionsPopupComponent :actions="actions" :row="row"/>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="!(pageCount <= 1 && size === perPage)"
      id="paginator"
      class="mt-2 mb-5"
    >
      <div class="float-left">
        <span>Show</span>
        <select
          id="perPage-dropdown"
          class="ml-2"
          @change="onChangeRowsPerPage($event)"
        >
          <option value="25" selected>25</option>
          <option value="50">50</option>
          <option value="75">75</option>
        </select>
        <span>&nbsp;entries</span>
      </div>
      <div class="float-right">
        <button
          class="btn-arrow"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <img src="../assets/icons/prev.png" />
        </button>
        <span>&nbsp;Page&nbsp;</span>
        <input
          type="number"
          min="1"
          class="ml-1 font-weight-bold"
          :max="pageCount"
          v-model="currentPage"
          @change="checkInputValue"
        />
        <span>&nbsp;of&nbsp;</span
        ><span class="font-weight-bold"> {{ pageCount }}</span>
        <button
          class="btn-arrow"
          :disabled="currentPage >= pageCount"
          @click="nextPage"
        >
          <img src="../assets/icons/next.png" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  firstPage,
  defaultPerPage,
  defaultSortBy,
  defaultSortDirection
} from "../constants/site-status";
import ActionsPopupComponent from "./actions-popup"

export default {
  components: {
    ActionsPopupComponent,
  },
  props: {
    columns: {
      type: Array,
      default: function () {
        return [];
      },
    },
    height: {
      type: String,
      default: "",
    },
    rows: {
      type: Array,
      default: function () {
        return [];
      },
    },
    totalRows: {
      type: Number,
      default: null,
    },
    isSortable: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    actions: null
  },
  computed: {
    pageCount: function () {
      return Math.ceil(this.totalRows / this.size);
    },
  },
  data: function () {
    return {
      gridHeight: this.height || "250px",
      sortIconUp: require("../assets/icons/up-arrow.png"),
      sortIconDown: require("../assets/icons/down-arrow.png"),
      combinedShapeIcon: require("../assets/icons/combined-shape.svg"),
      currentPage: firstPage,
      perPage: defaultPerPage,
      size: defaultPerPage,
      sortBy: defaultSortBy,
      sortDirection: defaultSortDirection,
      sortedColIndex: -1,
    };
  },
  mounted: function () {
    this.isLoadingHandler();
  },
  methods: {
    getCellValue(row, index) {
      if (index.includes(".")) {
        return row[index.split(".", 2)[0]][index.split(".", 2)[1]];
      } else return row[index];
    },
    applyFormatter(row, col) {
      let date = this.getCellValue(row, col.field);
      return col.valueFormatter.call(null, date);
    },

    getRowClass(row) {
      switch(row.highlight) {
        case "red":
          return "red-node";
        
        case "green": 
          return "green-node";
        
        case "gray": 
          return "gray-node";
        
        case "blue": 
          return "blue-node";
        
        default:
          return "";
      }
    },

    sort(col, index) {
      if (col.order == null || col.order == undefined) {
        this.$set(col, "order", true);
      } else {
        this.$set(col, "order", !col.order);
      }
      if (this.sortedColIndex !== -1 && this.sortedColIndex !== index) {
        this.columns[this.sortedColIndex].order = undefined;
      }
      this.sortedColIndex = index;
      this.sortDirection = col.order ? "ASC" : "DSC";
      this.sortBy = col.field;
      this.getFilteredData();
    },

    refresh() {
      this.currentPage = firstPage;
      this.size = defaultPerPage;
      this.sortBy = defaultSortBy;
      this.sortDirection = defaultSortDirection;
      this.columns.forEach(function(item) {
        item['order'] = undefined
      })
    },

    /* CODE PAGINATION AND SORT */
    getFilteredData() {
      let sort = this.sortBy;
      if (this.sortBy.includes(".")) {
        sort = this.sortBy.split(".")[this.sortBy.split(".").length -1];
      }
      this.$emit(
        "getFilteredData",
        this.size,
        this.currentPage,
        this.sortDirection,
        sort
      );
    },

    checkInputValue() {
      if (this.currentPage < 1) {
        this.currentPage = 1;
      } else if (this.currentPage > this.pageCount) {
        this.currentPage = this.pageCount;
      }
      this.getFilteredData();
    },

    onChangeRowsPerPage(selection) {
      if (selection) {
        this.size = selection.target.value;
      }
      if (this.currentPage > Math.ceil(this.totalRows / this.size)) {
        this.currentPage = Math.ceil(this.totalRows / this.size);
      }
      this.getFilteredData();
    },

    nextPage() {
      this.currentPage++;
      this.getFilteredData();
    },

    prevPage() {
      this.currentPage--;
      this.getFilteredData();
    },
    isLoadingHandler() {
      if (this.isLoading) {
        var loaderTop;
        var tableHeight = this.$refs.myTable.clientHeight;
        if (tableHeight < 250) loaderTop = tableHeight / 2;
        else loaderTop = 125;

        this.$refs.loading.style.setProperty(
          "top",
          loaderTop + "px"
        );
        this.$refs.loading.style.setProperty("display", "block");
      } else {
        this.$refs.loading.style.setProperty("display", "none");
      }
    }
  },
  watch: {
    isLoading: 'isLoadingHandler',
  },
}
</script>

<style lang="scss" scoped>
.table-container {
  overflow-y: auto;
}

table {
  width: 100%;
  font-size: 16px;
  &.small-font {
    th,
    tr {
      font-size: 12px;
    }
  }
  &.tableFixHead thead th {
    position: sticky;
    top: 0px;
    box-shadow: inset 0px 1px #bdc3c7, 0 1px #bdc3c7;
  }
}

table th {
  background-color: #f5f7f7;
  color: rgba(0, 0, 0, 0.54);
}

table,
th,
tr {
  border: 1px solid #bdc3c7;
  border-collapse: collapse;
  border-top: none;
}

th,
td {
  padding: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &.more-actions{
    text-align: center;
    width: 100px;
  }
}

tr {
  background-color: #fcfdfe;
}
tr:hover {
  background-color: #f3f6f6;
}

.red-node {
  background-color: #ffcccc !important;
}
.red-node:hover {
  background-color: #ffe0e0 !important;
}

.green-node {
  background-color: #d6f5d6 !important;
}
.green-node:hover {
  background-color: #e6f9e6 !important;
}

.gray-node {
  background-color: #dcdcdc !important;
}
.gray-node:hover {
  background-color: #e6e6e6 !important;
}

.blue-node {
  background-color: #d1f2ff !important;
}
.blue-node:hover {
  background-color: #e0f6ff !important;
}

img.sort-icon {
  height: 12px;
  margin-bottom: 2px;
}
.overlay-grid {
  display: none;
  position: relative;
  height: 0px;
  z-index: 50;
}
.loader-custom {
  margin: auto;
  border: 6px solid #e0e0e0;
  border-radius: 50%;
  border-top: 6px solid #808080;
  width: 40px;
  height: 40px;
  -webkit-animation: spin 1s linear infinite; /* Safari */
  animation: spin 1s linear infinite;
}

.btn-arrow {
  background-color: Transparent;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  overflow: hidden;
  outline: none;
}
#paginator {
  select,
  input[type="number"] {
    font-size: 14px;
  }
  span {
    font-size: 14px;
  }
}
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  width: auto;
  min-width: 22px;
  height: 20px;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

/* Safari */
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@media screen and (max-width: 1024px) {
  td,
  th {
    max-width: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  #perPage-dropdown {
    option {
      font-size: 10px;
      width: 10px;
    }
  }
}
</style>
