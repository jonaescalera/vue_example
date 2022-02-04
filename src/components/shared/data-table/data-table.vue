<template>
  <div v-if="showTable" v-observe-visibility="visibilityChanged">
    <v-row v-if="settings.actionsPanel">
      <v-col
        class="pl-1 pr-1 ml-5"
        v-show="checkedRows.length > 0"
        id="actions-panel"
      >
        <ActionsPanel
          @on-delete="onDeleteSelectedRows"
          @on-hide-deselected="onHideDeselected"
          @on-export="onExport"
          :key="actionKey"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div
          v-if="getWindowWidth > breakpoint" 
          v-bind:class="{extensibleTableContainer: resizeRef !== undefined,
                withActions: checkedRows.length > 0,
                [customTableContainerClass]: customTableContainerClass,
              }"
          class="tableContainer default-scroll-bar"
          v-bind:style="{ maxWidth: tableContainerWidth }"
          ref="tableContainer">
          <table v-bind:class="{resizableTable: resizeRef !== undefined}">
            <thead ref="thead">
              <tr>
                <th
                  class="checkbox"
                  slot="header"
                  v-bind:class="{
                    hide: !settings.actionsPanel && !settings.singleSelect,
                  }"
                >
                  <div v-if="settings.actionsPanel">
                    <img
                      :src="checkedAll ? uncheckAll : uncheckedIcon"
                      @click="checkAll"
                      v-model="checkedAll"
                    />
                  </div>
                </th>
                <th
                  v-for="(col, index) in mutableColumns"
                  :class="name + col.field"
                  :key="index"
                  @drop="dropTh"
                  @dragstart="dragTh"
                  draggable="true"
                  :width="col.width ? col.width : ''"
                  :title="col.name"
                  class="p-relative"
                >
                  <span style="user-select: none;" @click="sort(col, index)">
                    {{ col.name }}
                  </span>
                  <v-icon
                    @click="sort(col, index)"
                    v-if="settings.sorting"
                    class="sort-icon"
                    v-text="
                      col.order != undefined
                        ? col.order
                          ? 'mdi-menu-up'
                          : 'mdi-menu-down'
                        : 'mdi-menu-swap'
                    "
                  ></v-icon>
                </th>
                <th
                  v-if="settings.moreActions"
                  class="more-actions"
                >
                  <v-menu
                    bottom
                    left
                    :close-delay="100"
                    :open-on-hover="true"
                    :close-on-click="true"
                    :close-on-content-click="true"
                    :offset-x="true"
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn class="center-content w-100 restore-data-table" dark icon v-on="on">
                        <img :src="combinedShapeIcon" />
                      </v-btn>
                    </template>
                    <v-list  v-if="resizeRef">
                      <v-list-item @click="restoreWidths">
                        <v-icon small class="mr-2">mdi-restore</v-icon>
                        <v-list-item-title>{{ $t('restore-columns') }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </th>
                </tr>
            </thead>
            <!-- the only way I found to pass a dynamic class and have it scoped in the data-table component.
              The class is declared in data-table but bind from the parent component as prop -->
            <tbody
              ref="tbody"
            >
              <tr v-if="rows.length === 0">
                <td class="text-center">
                  {{ instructions ? $t('table-instructions') : $t('table-no-rows') }}
                </td>
              </tr>
              <tr
                v-for="(row, indexRow) in rows"
                :key="indexRow"
                :class="row.hide ? 'hide' : ''"
              >
                <td
                  class="checkbox"
                  v-bind:class="{
                    hide: !settings.actionsPanel && !settings.singleSelect,
                  }"
                >
                  <div
                    v-if="settings.actionsPanel || settings.singleSelect"
                    :class="row.checked ? 'checked' : ''"
                  >
                    <img
                      :src="row.checked ? checkedMarkIcon : uncheckedIcon"
                      @click="checkRow(row)"
                      v-model="row.checked"
                    />
                  </div>
                </td>
                <td
                  v-for="(col, colIndex) in mutableColumns"
                  :key="colIndex"
                  :title="col.type === 'data' ? row[col.field] : ''"
                  v-bind:class="[
                    {
                      'border-highlighted':
                        colIndex === 0 &&
                        !settings.actionsPanel &&
                        !settings.singleSelect,
                      capitalize: col.capitalizeStyle,
                    },
                    name + col.field,
                  ]"
                  :width="col.width ? col.width : ''"
                >
                  <!-- get the data from single value, example data = name -->
                  <template v-if="col.type === 'data'">
                    {{ row[col.field] }}</template
                  >
                  <!-- get the data value from object, exmaple data = user.name -->
                  <template v-if="col.type === 'objectData'">
                    {{
                      getValueFromStringObjectProperty(row, col.field)
                    }}</template
                  >
                  <!-- render a component -->
                  <template
                    v-else-if="
                      col.type === 'render' || col.type === 'renderObject'
                    "
                  >
                    <component
                      :params="row"
                      :renderParams="col.renderParams ? col.renderParams : null"
                      :field="
                        col.type === 'renderObject'
                          ? addObjectEntry(row, col.field)
                          : col.field
                      "
                      :is="col.cellRenderer"
                      @previewItem="previewItem"
                    >
                    </component>
                  </template>
                  <template v-else-if="col.type === 'date'"
                    ><span v-if="row[col.field]">{{
                      row[col.field] | moment(col.format)
                    }}</span></template
                  >
                  <template v-else-if="col.type === 'bool'">
                    {{ row[col.field] ? $t('yes') : $t('no') }}
                  </template>
                  <template v-else-if="col.type === 'gmap'">
                    <v-btn v-if="row[col.latField] && row[col.lngField]" icon target="_blank" :href="'http://maps.google.com/maps?t=k&q=loc:'+row[col.latField]+','+row[col.lngField]">
                      <v-icon>mdi-link</v-icon>
                    </v-btn>
                  </template>
                </td>
                <td v-if="settings.moreActions" class="more-actions">
                  <ActionsPopupComponent
                    :actions="settings.moreActions"
                    :row="row"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <table id="mobileTable" v-if="mobileView">
          <tbody
            v-bind:class="{
              [customTableContainerClass]: customTableContainerClass,
              iPlus: getWindowWidth <= iPlus,
            }"
          >
            <tr
              v-for="(row, indexR) in rows"
              :key="indexR"
              class="v-data-table__mobile-table-row"
            >
              <td
                v-for="(col, indexC) in mutableColumns"
                :key="indexC"
                class="v-data-table__mobile-row"
                v-bind:class="{ hide: ((col.type === 'gmap') && (!row[col.latField] || !row[col.lngField])) || ((col.type !== 'gmap') && !row[col.field]) }"
              >
                <v-row>
                  <v-col
                    v-if="settings.moreActions && indexC === 0"
                    cols="12"
                    class="py-0 mb-1 text-right"
                  >
                    <span
                      v-for="(action, index) in settings.moreActions"
                      :key="index"
                    >
                      <v-icon
                        v-if="
                          action.enabledIf
                          ? isEnabled(action.enabledIf, row)
                            ? true
                            : false
                          : action.condition 
                            ? executeCondition(action.condition, row)
                              ? true
                              : false
                            : true
                        "
                        @click="action.fn(row)"
                        class="ml-2"
                        small
                        color="secondary"
                        >mdi-{{ action.icon }}</v-icon
                      >
                    </span>
                  </v-col>
                  <v-col cols="5" class="py-0 text-ellipsis">
                    {{ col.name }}
                  </v-col>
                  <v-col cols="7" class="text-right py-0">
                    <!-- get the data from single value, example data = name -->
                    <template v-if="col.type === 'data'">
                      {{ row[col.field] }}</template
                    >
                    <!-- get the data value from object, exmaple data = user.name -->
                    <template v-if="col.type === 'objectData'">
                      {{
                        getValueFromStringObjectProperty(row, col.field)
                      }}</template
                    >
                    <!-- render a component -->
                    <template
                      v-else-if="
                        col.type === 'render' || col.type === 'renderObject'
                      "
                    >
                      <component
                        :params="row"
                        :renderParams="
                          col.renderParams ? col.renderParams : null
                        "
                        :field="
                          col.type === 'renderObject'
                            ? addObjectEntry(row, col.field)
                            : col.field
                        "
                        :is="col.cellRenderer"
                        @previewItem="previewItem"
                      >
                      </component>
                    </template>
                    <template v-else-if="col.type === 'date'">
                      <span v-if="row[col.field]">
                        {{ row[col.field] | moment(col.format) }}
                      </span>
                    </template>
                    <template v-else-if="col.type === 'bool'">
                      {{ row[col.field] ? $t('yes') : $t('no') }}
                    </template>
                    <template v-else-if="col.type === 'gmap'">
                      <v-btn x-small icon target="_blank" :href="'http://maps.google.com/maps/search/?api=1&query='+row[col.latField]+','+row[col.lngField]">
                        <v-icon>mdi-link</v-icon>
                      </v-btn>
                    </template>
                  </v-col>
                </v-row>
              </td>
            </tr>
          </tbody>
        </table>
        <confirm-modal
          @confirm="confirmDelete"
          @cancel="confirmationDeleteSelectionDialog = false"
          :dialogModel="confirmationDeleteSelectionDialog"
          :dialogBody="
            ($t(confirmDeleteModalBody) || $t('delete-selection-default')) +
            ' (' +
            assetsNumberToDelete +
            ')'
          "
          :dialogTitle="
            $t(confirmDeleteModalTitle) || $t('delete-selection-title-default')
          "
        />
      </v-col>
    </v-row>
    <v-row>
      <Pagination
        v-bind:class="{ 'mobile mt-6': mobileView }"
        v-if="totalRows > 0 && !settings.noPagination"
        :rowsCount="rowsCount"
        :page="page"
        :size="pageSize"
        @paginationChange="paginationChange"
      />
    </v-row>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import ActionsPopupComponent from './custom-cells/actions-popup';
import ActionsPanel from './utilities/actions-panel';
import Pagination from './utilities/pagination.vue';
import ConfirmModal from '../modals/confirmModal';
import constants from '../../../constants/resolutions-constants';
import { orderBy } from 'natural-orderby';

const SIDEBAR_DELAY = 300;
const INTERVAL_TIME = 500;
const MAX_COL_WIDTH = 600;
const MIN_COL_WIDTH = 50;

export default {
  components: {
    ActionsPopupComponent,
    ActionsPanel,
    Pagination,
    ConfirmModal,
  },
  data() {
    return {
      uncheckedIcon: require('../../../assets/img/icons/unchecked.svg'),
      checkedMarkIcon: require('../../../assets/img/icons/white-check.png'),
      uncheckAll: require('../../../assets/img/icons/checkbox-deselect.svg'),
      combinedShapeIcon: require('../../../assets/img/icons/combined-shape.svg'),
      checkedAll: false,
      checkedRows: [],
      sortBy: null,
      sortedColIndex: -1,
      sortDirection: '',
      confirmationDeleteSelectionDialog: false,
      assetsNumberToDelete: 0,
      actionKey: true,
      breakpoint: constants.IPAD_PORTRAIT,
      iPlus: constants.IPHONE_8_PLUS,
      dragFrom: null,
      dragTo: null,
      mutableColumns: [],
      renderedColElements: false,
      showTable: true,
      tableContainerWidth: null,
      isTableVisible: false
    };
  },
  props: [
    'name',
    'resizeRef',
    'settings',
    'columns',
    'customTableContainerClass',
    'rows',
    'page',
    'pageSize',
    'maxHeight',
    'totalRows',
    'instructions',
    'confirmDeleteModalTitle',
    'confirmDeleteModalBody',
  ],
  watch: {
    resizeRef() {
      setTimeout(() => {
        this.tableContainerWidth = this.resizeRef.clientWidth - 28 + 'px';
        this.applySavedOrder();
        this.applySavedWidths();
      }, SIDEBAR_DELAY);
    },
    columns(columns) {
      //some columns were removed or added
      if(this.mutableColumns.length !== columns.length){
        this.mutableColumns = columns;
        this.restoreWidths();
      }else{
        this.mutableColumns = columns;
      }
    },
    rows(newRows, oldRows) {
      if (this.rows.filter((row) => row.checked === true).length === 0) {
        this.checkedRows = [];
        this.checkedAll = false;
        this.actionKey = !this.actionKey;
      }
      this.$nextTick(() => {
        //the first time the page is loaded we need to set the column's width in order to works the resize.
        if(oldRows.length === 0 && this.isTableVisible){
          this.saveTableWidthsAndOrder();
        }
        this.applySavedWidths();        
      });
    },
    isSidebarMini() {
      if (this.resizeRef) {
        // need to wait for sidebar to be collapsed in orded to pick up the proportional width of parent card.
        setTimeout(() => {
          this.tableContainerWidth = this.resizeRef.clientWidth - 28  + 'px';
        }, SIDEBAR_DELAY);
      }
    },
    getWindowWidth() {
      if (this.resizeRef) {
        this.tableContainerWidth = this.resizeRef.clientWidth - 28 + 'px';
      }
    }
  },
  computed: {
    ...mapGetters('layout', ['getWindowWidth', 'isSidebarMini']),
    rowsCount() {
      return this.totalRows;
    },
    mobileView() {
      return this.getWindowWidth <= this.breakpoint;
    }
  },
  mounted() {
    this.$nextTick(() => {
      //after tbody element is rendered we can modify its mx height
      if (this.maxHeight && this.$refs.tbody) {
        this.$refs.tableContainer.style.maxHeight = this.maxHeight;
      }
      this.mutableColumns = this.columns;
      let interval = setInterval(() => {
        if (this.resizeRef) {
          this.setResizableColumns();
        }
        if(this.renderedColElements){
          clearInterval(interval);
        }
      }, INTERVAL_TIME);
    });
    if (this.settings.actionsPanel || this.settings.singleSelect) {
      this.rows.forEach((row) => {
        this.$set(row, 'checked', false);
        this.$set(row, 'hide', false);
      });
    }
  },
  methods: {
    ...mapMutations('layout', ['setRightContainerComponent']),
    visibilityChanged(e) {
      this.isTableVisible = e;
    },
    previewItem(item) {
      this.setRightContainerComponent({
        comp: this.settings.rowPreview,
        item: item,
      });
    },
    dragTh(ev) {
      if (ev && ev.srcElement.nodeName === 'TH') {
        this.dragFrom = ev.srcElement;
      }
    },
    dropTh(ev) {
      if (ev && (ev.srcElement.nodeName === 'TH' || ev.srcElement.nodeName === 'SPAN' || ev.srcElement.nodeName === 'BUTTON')) {
        if (ev.srcElement.nodeName === 'SPAN' || ev.srcElement.nodeName === 'BUTTON') {
          this.dragTo = ev.srcElement.offsetParent;
        } else {
          this.dragTo = ev.srcElement;
        }
        if (this.dragFrom !== this.dragTo) {
          let colFrom, colTo;
          for (let index = 0; index < this.mutableColumns.length; index++) {
            const col = this.mutableColumns[index];
            if (this.name + col.field === this.dragFrom.classList[1]) {
              colFrom = col;
              colFrom.index = index;
            }
            if (this.name + col.field === this.dragTo.classList[1]) {
              colTo = col;
              colTo.index = index;
            }
          }
          if (colTo.index < colFrom.index) {
            this.mutableColumns.splice(colTo.index, 0, colFrom);
            this.mutableColumns.splice(colFrom.index + 1, 1);
          } else {
            this.mutableColumns.splice(colTo.index + 1, 0, colFrom);
            this.mutableColumns.splice(colFrom.index, 1);
          }
          this.$nextTick(() => {
            if(this.resizeRef){
              this.setResizableColumns();
              this.applySavedWidths();
            }
            this.saveTableWidthsAndOrder();
          });
        }
      }
      this.dragTo = null;
      this.dragFrom = null;
    },
    setResizableColumns() {
      for (let h = 0; h < this.mutableColumns.length; h++) {
        let col = this.mutableColumns[h];
        let elements = document.getElementsByClassName(this.name + col.field);
        if (elements && !this.renderedColElements) {
          this.renderedColElements = true;
        }
        for (let i = 0; i < elements.length; i++) {
          let el = elements[i];
          if (el.tagName === 'TH') {
            for (let j = 0; j < el.childNodes.length; j++) {
              if (el.childNodes[j].className === 'resize-grip') {
                el.childNodes[j].remove();
              }
            }
            let thElm;
            let startOffset;
            let grip = document.createElement('div');
            grip.classList = ['resize-grip'];
            grip.innerHTML = '&nbsp;';
            grip.style.top = 0;
            grip.style.right = 0;
            grip.style.bottom = 0;
            grip.style.paddingLeft = 0;
            grip.style.width = '10px';
            grip.style.position = 'absolute';
            grip.style.cursor = 'col-resize';
            grip.addEventListener('mousedown', function (e) {
              e.preventDefault();
              e.stopPropagation();
              thElm = el;
              startOffset = el.offsetWidth - e.pageX;
            });
            el.appendChild(grip);
            let self = this;
            let currentWitdh;
            document.addEventListener('mousemove', function (e) {
              if (thElm) {
                if (e.pageX < window.innerWidth && (startOffset + e.pageX) < MAX_COL_WIDTH && (startOffset + e.pageX) > MIN_COL_WIDTH)  {
                  currentWitdh = startOffset + e.pageX + 'px';
                  el.style.width = currentWitdh;
                }
              }
            });
            document.addEventListener('mouseup', function (e) {
              if (thElm && currentWitdh) {
                elements.forEach((element) => {
                  element.style.width = currentWitdh;
                });
                self.saveTableWidthsAndOrder();
              }
              currentWitdh = undefined;
              thElm = undefined;
            });
          } 
        }
      }
    },
    saveTableWidthsAndOrder() {
      if (!this.mobileView) {
        let widths = [];
        this.mutableColumns.forEach((col)=>{
          let elem = document.getElementsByClassName(this.name + col.field)[0];
          let width = elem ? elem.clientWidth : 0;
          if (width !== 0) {
            widths.push(
              {
                name: this.name + col.field,
                width: width,
                pos: this.mutableColumns.indexOf(col)
              }
            )
          } 
        });
        localStorage.setItem('tableWidth' + this.name, JSON.stringify(widths));
      }
    },
    applySavedWidths() {
      let savedWidths = localStorage.getItem('tableWidth' + this.name);
      if (savedWidths) {
        let widths = JSON.parse(savedWidths);
        widths.forEach((width)=>{
          let elements = document.getElementsByClassName(width.name);
          elements.forEach((el)=>{
            if (width.width !== 0) {
              el.style.width = width.width + 'px';
            }
          })
        })
      }
    },
    applySavedOrder() {
      let savedWidths = localStorage.getItem('tableWidth' + this.name);
      if (savedWidths) {
        let widths = JSON.parse(savedWidths);
        widths.forEach((width)=>{
          let selCol = this.mutableColumns.find(col => width.name === this.name + col.field);
          selCol.newPos = width.pos;
        })
        this.mutableColumns = orderBy(this.mutableColumns, [c=>c.newPos], ["asc"]);
      }
    },
    restoreWidths() {
      localStorage.removeItem('tableWidth' + this.name);
      this.showTable = false;
      this.$nextTick(() => {
        this.showTable = true;
        this.$nextTick(()=>{
          this.setResizableColumns();
          this.saveTableWidthsAndOrder();
          this.applySavedWidths();
        })
      })
    },
    checkAll() {
      this.checkedAll = !this.checkedAll;
      this.rows.forEach((row) => {
        row.checked = this.checkedAll;
      });
      if (this.checkedAll) {
        this.checkedRows = this.rows;
      } else {
        this.checkedRows = [];
      }
    },
    selectRow(row) {
      row.checked = !row.checked;
      if (this.checkedRows && this.checkedRows.id !== row.id) {
        this.checkedRows.checked = !this.checkedRows.checked;
      }
      this.checkedRows = row.checked ? row : [];
      this.$emit('onRowSelected', row.checked ? row : null);
    },
    checkRow(row) {
      if (this.settings.singleSelect) {
        this.selectRow(row);
      } else {
        row.checked = !row.checked;
        this.checkedAll = false;
        this.checkedRows = this.rows.filter((row) => {
          return row.checked === true;
        });
      }
    },
    onHideDeselected(hide) {
      if (hide) {
        this.rows.filter((row) => {
          if (!row.checked) this.$set(row, 'hide', true);
        });
      } else {
        this.rows.filter((row) => {
          if (row.hide) this.$set(row, 'hide', false);
        });
      }
    },
    onExport() {
      this.$emit('onExport', this.checkedRows);
    },
    onDeleteSelectedRows() {
      this.assetsNumberToDelete = this.checkedRows.length;
      this.confirmationDeleteSelectionDialog = true;
    },
    confirmDelete() {
      this.confirmationDeleteSelectionDialog = false;
      this.$emit('onDeleteSelection', this.checkedRows);
    },
    //returns the value of a string object property
    getValueFromStringObjectProperty(obj, field) {
      let values = field.split('.');
      let aux = {};
      for (let index = 0; index < values.length; index++) {
        const property = values[index];
        if (index === 0) {
          aux = obj[property];
        } else {
          aux = aux[property];
        }
      }
      return aux;
    },
    addObjectEntry(obj, field) {
      obj[field] = this.getValueFromStringObjectProperty(obj, field);
      return field;
    },
    sort(col, index) {
      if (this.settings.sorting) {
        if (!col.order) {
          this.$set(col, 'order', true);
        } else {
          this.$set(col, 'order', !col.order);
        }

        if (this.sortedColIndex != -1 && this.sortedColIndex != index) {
          this.mutableColumns[this.sortedColIndex].order = undefined;
        }
        this.sortedColIndex = index;
        this.sortDirection = col.order ? 'asc' : 'dsc';
        this.sortBy = col.field;
        this.$emit(
          'onSort',
          '&sortBy=' + this.sortBy + '&sort=' + this.sortDirection
        );
      }
    },
    paginationChange(pagination) {
      this.$emit('onPaginationChange', {
        page: pagination.page,
        pageSize: pagination.size,
      });
    },
    executeCondition(condition, row){
        switch (condition.operator) {
          case 'CONTAINS':
            if(condition.value.includes(row[condition.field])){
              return true;
            }else{
              return false;
            }
          default:
            break;
        }
    },
    isEnabled(fields, row) {
      let enable = true;
      fields.forEach((f) => {
        if (!row[f]) {
          enable = false;
        }
      });
      return enable;
    },
  }
};
</script>

<style lang="scss" scoped>
.tableContainer{
  &:not(.extensibleTableContainer){
    width: calc(100% - 10px);
  }
  overflow: auto;
  height: calc(100vh - 327px);
  &.withActions {
    height: calc(100vh - 384px);
  }
  &.withoutFilters {
    height: calc(100vh - 266px);
  }
  &.withActions.withoutFilters {
    height: calc(100vh - 446px);
  }
  &.withFilters {
    height: calc(100vh - 318px);
  }
  &.withActions.withFilters {
    height: calc(100vh - 375px);
  }
}
table {
  width: 100%;
  border-collapse: collapse;
  thead {
    @-moz-document url-prefix() { 
      position: sticky;
      top: 0;
      z-index: 5;
    }
    tr{
        position: sticky;
        top: 0;
        z-index: 5;
      }
    th {
      text-align: left;
      height: 51px !important;
      border: 1px solid #7c8d95;
      background-color: var(--v-info-base);
      background-clip: padding-box;
      color: white;
      font-size: 0.75rem;
      text-transform: uppercase;
      padding-left: 12px;
      cursor: pointer;
    }
  }
  th,
  td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &.more-actions {
      text-align: center;
      width: 50px;
      padding-left: 0;
      padding-top: 7px;
      padding-bottom: 7px;
    }
    &.capitalize {
      text-transform: capitalize;
    }
  }
}

thead tr,
tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
  height: 51px;
}

table tbody {
  tr {
    border-bottom: 1px solid #d9dcde;
    border-collapse: collapse;
    &:nth-child(even){
      background-color: #f8f8f9;
    }
    &:hover td{
      background-color: #e1e2e4;
      &:nth-child(1):not(.hide) {
        box-shadow: inset 5px 0 var(--v-secondary-base);
      }
      &.border-highlighted {
        box-shadow: inset 5px 0 var(--v-secondary-base);
      }
    }
  }
  td {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--v-primary-darken2);
    padding: 5px 11px 0px;
    min-width: 50px;
  }
}

.extensibleTableContainer{
  position: relative;
  table.resizableTable{
    tr{
      &:nth-child(even)>td.more-actions, &:nth-child(even)>td.checkbox {
        background-color: #f8f8f9;
        background-clip: padding-box;
      }
      &:nth-child(odd)>td.more-actions, &:nth-child(odd)>td.checkbox {
        background-color: white;
        background-clip: padding-box;
      }
      &:hover td.more-actions, &:hover td.checkbox {
        background-color: #e1e2e4;
        &:nth-child(1):not(.hide) {
          box-shadow: inset 5px 0 var(--v-secondary-base);
        }
        &.border-highlighted {
          box-shadow: inset 5px 0 var(--v-secondary-base);
        }
      }
    }
    th, td{
       &.more-actions {
        position: -webkit-sticky;
        position: sticky;
        right: 0px;
        z-index: 2;
      }
      &.checkbox{
        position: -webkit-sticky;
        position: sticky;
        left: 0;
        z-index: 2;
      }
    }
  }
}
table#mobileTable {
  tbody{
    display: block;
    overflow: scroll;
  }
  tbody.withFilters {
    height: calc(100vh - 324px);
    @media (max-width: 600px) {
      height: calc(100vh - 271px);
    }
    &.withActions{
      height: calc(100vh - 466px);
    }
  }
  tbody.withoutFilters {
    height: calc(100vh - 271px);
  }
  tbody.iPlus {
    height: calc(100vh - 271px);
  }
  tr {
    &:first-child {
      border-top: 1px solid #d9dcde;
    }
    &:hover td {
      box-shadow: inset 5px 0 var(--v-secondary-base);
    }
    td:last-child {
      padding-bottom: 5px;
    }
  }
}
#pagination.mobile {
  margin: 0 -9px;
}
.hide {
  display: none;
}
th.checkbox {
  padding-left: 10px;
}
th.checkbox,
td.checkbox {
  width: 43px;
  div {
    height: 20px;
    width: 20px;
    border-radius: 2px;
    margin-bottom: 7px;
    &.checked {
      background-color: var(--v-primary-base);
      margin-bottom: 0px;
      margin-left: 3px;
    }
    img {
      margin-left: 3px;
      margin-top: 4px;
    }
  }
}

/* end scrollbar */
.sort-icon {
  color: #b8bdc7;
  width: 15px;
  margin-left: 10px;
  height: 15px;
  font-size: 18px;
  padding-left: 0px !important;
}

// custom tbody classes
.import-devices-modal {
  max-height: 250px;
  &.withActions {
    max-height: 250px;
  }
}
.tooltip {
  height: 29px;
  border-radius: 3px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  background-color: var(--v-primary-base);
}
.users-page {
  height: calc(100vh - 190px) !important;
  &.withActions {
    max-height: calc(100vh - 245px);
  }
}
.restore-data-table {
  color: #3b5762 !important;
}
</style>