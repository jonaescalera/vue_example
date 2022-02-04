<template>
  <v-menu
    offset-y
    :close-on-click="false"
    :close-on-content-click="false"
    v-model="menu"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        v-on="on"
        id="filters-dropdown"
        height="32"
        min-width="50"
        :depressed="true"
        :disabled="disabled"
        class="font-weight-bold mr-3 mb-2"
        v-bind:class="!filterApplied && !searchApplied ? 'primary--text' : ''"
        :color="filterApplied || searchApplied ? 'secondary' : 'primaryLight'"
      >
        <v-icon
          small
          :color="filterApplied || searchApplied ? 'white' : 'primary'"
          v-text="'mdi-menu'"
        ></v-icon>
        <span class="ml-2" id="filters-dropdown-text">{{
          $t('assets-page-filters')
        }}</span>
      </v-btn>
    </template>
    <v-card id="filter-dropdown-card" width="370">
      <v-card-text class="dialog-container">
        <div class="d-flex flex-row-reverse">
          <v-btn color="primary" text fab outlined x-small dark class="float-right mt-1 mr-1 closeBtn" title="close" @click="menu = false">
              <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-form id="filters-form" class="filters-form" ref="filterForm">
          <v-row justify="center">
            <v-col cols="11">
              <v-row>
                <v-col v-if="savedFilterForm && savedFilterForm.id" cols="12">
                  <v-text-field
                    :dense="true"
                    v-model="filterForm.name"
                    required
                    outlined
                    :placeholder="$t('assets-page-name-placeholder')"
                    :hide-details="requiredName ? false : true"
                    :error-messages="requiredName"
                  ></v-text-field>
                  <v-divider class="mt-3"></v-divider>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    :dense="true"
                    v-model="searchTerm"
                    @keyup="searchWordTyped"
                    outlined
                    :hide-details="true"
                    :placeholder="$t('assets-page-search-placeholder')"
                  ></v-text-field>
                </v-col>
                <v-col
                  v-for="(filter, index) in filterFields"
                  :key="index"
                  :cols="filter.cols ? filter.cols : '12'"
                >
                  <v-autocomplete
                    v-if="filter.options"
                    :id="'dropdown-form' + filter.field"
                    :label="filter.name"
                    :clearable="true"
                    :placeholder="filter.name"
                    :items="filter.options"
                    item-text="value"
                    :item-value="filter.filterValue ? filter.filterValue : ''"
                    v-model="filterForm[filter.field]"
                    :loading="!filter.optionsLoaded"
                    :dense="true"
                    hide-details
                    outlined
                  ></v-autocomplete>
                  <v-text-field
                    v-else
                    :id="'dropdown-form' + filter.field"
                    :label="filter.name"
                    :placeholder="filter.name"
                    v-model="filterForm[filter.field]"
                    :dense="true"
                    hide-details
                    outlined
                  ></v-text-field>
                  </v-col>

                  <v-col cols="6">
                  <v-select
                    :id="'dropdown-form-battery'"
                    :label="$t('battery')"
                    :clearable="true"
                    :placeholder="$t('battery')"
                    :items="batteryItems"
                    item-value="id"
                    v-model="filterForm.batteryStatus"
                    :dense="true"
                    hide-details
                    outlined
                  >
                    <template slot="selection" slot-scope="{ item }">
                      <img v-if="item.image" :src="item.image" alt="" />
                      <span v-else class="ml-1">{{ batteryNull }}</span>
                    </template>
                    <template slot="item" slot-scope="{ item }">
                      <div>
                        <img v-if="item.image" :src="item.image" />
                        <span v-else class="ml-1">{{ batteryNull }}</span>
                      </div>
                    </template>
                  </v-select>
                </v-col>

                <v-col cols="12">
                  <v-select
                    :id="'dropdown-form-last-seen'"
                    :label="$t('last-seen')"
                    :clearable="true"
                    :placeholder="$t('last-seen')"
                    :items="lastSeenItems"
                    item-value="id"
                    v-model="filterForm.lastSeen"
                    :dense="true"
                    hide-details
                    outlined
                  >
                    <template slot="selection" slot-scope="{ item }">
                      <v-icon :color="item.color" class="last-seen-icon" v-if="item.icon">mdi-{{ item.icon }}</v-icon>
                      <span class="ml-1"> {{$t(item.text)}} </span>
                    </template>
                    <template slot="item" slot-scope="{ item }">
                      <div>
                        <v-icon :color="item.color" class="last-seen-icon" v-if="item.icon">mdi-{{ item.icon }}</v-icon>
                        <span class="ml-1 last-seen-text"> {{$t(item.text)}} </span>
                      </div>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="justify-center">
        <v-btn
          id="reset-button"
          @click="resetForm"
          depressed
          small
          text
          class="caption"
        >
          <v-icon x-small class="mt-1 mr-1">mdi-close</v-icon>
          {{ $t('assets-page-clear-all') }}
        </v-btn>
        <v-btn
          v-if="savedFilterForm && savedFilterForm.id"
          id="update-fav"
          @click="updateFav"
          depressed
          small
          color="primaryLight"
          class="primary--text font-weight-bold"
          >{{ $t('assets-page-save-apply-fav') }}</v-btn
        >

        <v-btn
          v-if="!(savedFilterForm && savedFilterForm.id)"
          id="save-to-fav"
          @click="filterNameDialog = true"
          depressed
          small
          color="primaryLight"
          class="primary--text font-weight-bold"
          >{{ $t('assets-page-save-fav') }}</v-btn
        >

        <v-btn
          v-if="!(savedFilterForm && savedFilterForm.id)"
          id="apply-filter"
          @click="applyFilters"
          depressed
          small
          color="secondary"
          class="primary--text font-weight-bold lighten-2"
          >{{ $t('assets-page-apply') }}</v-btn
        >
      </v-card-actions>
      <v-dialog @keydown.enter="saveToFav" v-model="filterNameDialog" persistent max-width="290">
        <v-card>
          <v-card-title class="headline primary--text">{{
            $t('assets-page-save-fav')
          }}</v-card-title>
          <v-row>
            <v-col class="pa-6">
              <v-text-field
                :dense="true"
                v-model="filterForm.name"
                required
                autofocus
                outlined
                :placeholder="$t('assets-page-name-placeholder')"
                :hide-details="requiredName ? false : true"
                :error-messages="requiredName"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              height="32"
              text
              color="secondary"
              @click="filterNameDialog = false"
              class="primary--text font-weight-bold"
              >{{ $t('cancel') }}</v-btn
            >
            <v-btn
              depressed
              color="secondary"
              @click="saveToFav"
              class="px-8 float-right"
              >{{ $t('save') }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-menu>
</template>

<script>
import { UUID } from '../../../mixins/uuid';
import { mapGetters } from 'vuex';
export default {
  mixins: [UUID],
  props: [
    'filterFields',
    'savedFilterForm',
    'cleanForm',
    'disabled',
    'searchText',
    'searchApplied',
  ],
  data() {
    return {
      batteryItems: [],
      searchTerm: '',
      filterForm: {},
      filterString: '',
      batteryNull: '-- --',
      batteryHalf: require('../../../assets/img/aggrid/battery-half.png'),
      batteryLow: require('../../../assets/img/aggrid/battery-low.png'),
      batteryFull: require('../../../assets/img/aggrid/battery-full.png'),
      menu: false,
      requiredName: '',
      filterApplied: false,
      filterNameDialog: false,
    };
  },
  computed: {
    ...mapGetters('site', ['currentSite']),
    lastSeenItems() {
      if (this.currentSite && (this.currentSite.isAf3 || this.currentSite.isAf2)) {
        return [
          { id: '4', icon: '', color: 'success', text: 'less-than-4-hours' },
          { id: '5', icon: '', color: 'warning', text: '4-to-24-hours' },
          { id: '6', icon: '', color: 'error', text: 'more-than-24-hours' },
          { id: '3', icon: 'close-circle', color: 'error', text: 'never-seen' },
        ]
      } else if(this.currentSite.isEverywhere) {
        return [
          { id: '0', icon: 'check-circle', color: 'success', text: 'less-than-3-days' },
          { id: '1', icon: 'alert', color: 'warning', text: '3-to-14-days' },
          { id: '2', icon: 'close-circle', color: 'error', text: 'more-than-14-days' },
          { id: '3', icon: 'close-circle', color: 'error', text: 'never-seen' },
        ]
      } else {
        return [
          { id: '4', icon: 'check-circle', color: 'success', text: 'less-than-4-hours' },
          { id: '5', icon: 'alert', color: 'warning', text: '4-to-24-hours' },
          { id: '6', icon: 'close-circle', color: 'error', text: 'more-than-24-hours' },
          { id: '3', icon: 'close-circle', color: 'error', text: 'never-seen' },
        ]
      }
    }
  },
  mounted() {
    this.batteryItems = [
      { id: '1', image: this.batteryFull },
      { id: '2', image: this.batteryHalf },
      { id: '0', image: this.batteryLow },
      { id: '-1', image: null },
    ];
    if (this.savedFilterForm) {
      if (this.savedFilterForm.searchTerm) {
        this.searchTerm = this.savedFilterForm.searchTerm
      }
      this.filterApplied = true;
      Object.assign(this.filterForm, this.savedFilterForm);
    }
  },
  watch: {
    savedFilterForm() {
      this.searchTerm = '';
      this.filterForm = {};
      if (this.savedFilterForm && this.savedFilterForm.id) {
        this.savedFilterForm.searchTerm
          ? (this.searchTerm = this.savedFilterForm.searchTerm)
          : null;
          Object.assign(this.filterForm, this.savedFilterForm);
      }
      this.$emit('onSearchTyped', this.searchTerm);
      this.applyFilters();
    },
    cleanForm: function () {
      if (this.cleanForm) {
        this.clearForm()
      }
    },
    searchText(text) {
      this.searchTerm = text;
    },
  },
  methods: {
    clearForm() {
        this.requiredName = '';
        this.searchTerm = '';
        this.filterForm = {};
        this.filterString = '';
        this.filterApplied = false;
    },
    searchWordTyped() {
      this.$emit('onSearchTyped', this.searchTerm);
    },
    saveToFav() {
      if (this.filterForm.name) {
        this.requiredName = '';
        this.filterForm['id'] = UUID.computed.generateUUID();
        this.filterForm.searchTerm = this.searchTerm;
        this.$emit('saveFilter', Object.assign({}, this.filterForm));
        this.filterNameDialog = false;
        this.filterForm.name = '';
      } else {
        this.requiredName = this.$i18n.t('error-filter-no-name');
      }
    },
    updateFav() {
      this.filterForm.searchTerm = this.searchTerm;
      this.$emit('saveFilter', Object.assign({}, this.filterForm));
      this.applyFilters();
    },
    resetForm() {
      this.requiredName = '';
      this.searchTerm = '';
      this.$emit('onSearchTyped', this.searchTerm);
      this.$refs.filterForm.reset();
      if (
        this.savedFilterForm &&
        Object.keys(this.savedFilterForm).length > 0
      ) {
        //means that a fav filter is applied
        this.$emit('deselectFilter', this.savedFilterForm.id);
        this.applyFilters();
      }
    },
    resetSearch() {
      this.requiredName = '';
      this.searchTerm = '';
      this.$emit('onSearchTyped', this.searchTerm);
    },
    applyFilters() {
      let form = this.filterForm;
      this.filterString = '';
      this.requiredName = '';
      if (this.searchTerm) {
        this.filterString = '&search=' + this.searchTerm
      }
      this.filterFields.forEach((item) => {
        if (form[item.field]) {
          this.filterString +=
            '&' +
            item.field +
            '=' +
            item.filterPrefix +
            ':' +
            encodeURIComponent(form[item.field]);
        }
      });
      if (this.filterForm.batteryStatus) {
        this.filterString += '&batteryStatus=eq:'+ this.filterForm.batteryStatus;
      }
      if (this.filterForm.lastSeen) {
        this.setLastSeenParams();
      }
      if (this.filterString !== '') {
        this.filterApplied = true;
      } else {
        this.filterApplied = false;
      }
      this.$emit('applyFilters', {filterString: this.filterString, filterForm: this.filterForm});
      this.menu = false;
    },
    setLastSeenParams() {
      switch (this.filterForm.lastSeen) {
        case "0": //fewer than 3 days
          this.filterString += 
          '&lastEventFrom='+ encodeURIComponent(this.$moment.utc().subtract(3, 'days').format('YYYY-MM-DDTHH:mm:ss')) + 
          '&lastEventTo='+ encodeURIComponent(this.$moment.utc().format('YYYY-MM-DDTHH:mm:ss'));
          break;
        case "1": //3 - 14 days
          this.filterString += 
          '&lastEventFrom='+ encodeURIComponent(this.$moment.utc().subtract(14, 'days').format('YYYY-MM-DDTHH:mm:ss')) + 
          '&lastEventTo='+ encodeURIComponent(this.$moment.utc().subtract(3, 'days').format('YYYY-MM-DDTHH:mm:ss'));
          break;
        case "2": // more than 14 days
          this.filterString += 
          '&lastEventTo='+ encodeURIComponent(this.$moment.utc().subtract(14, 'days').format('YYYY-MM-DDTHH:mm:ss'));
          break;
        case "3": // never seen
          this.filterString += 
          '&lastEventTime=none'
          break;
        case "4": // less than 4 hs
          this.filterString += 
          '&lastEventFrom='+ encodeURIComponent(this.$moment.utc().subtract(4, 'hours').format('YYYY-MM-DDTHH:mm:ss')) + 
          '&lastEventTo='+ encodeURIComponent(this.$moment.utc().format('YYYY-MM-DDTHH:mm:ss'))
          break;
        case "5": // 4 - 24hs
          this.filterString += 
          '&lastEventFrom='+ encodeURIComponent(this.$moment.utc().subtract(24, 'hours').format('YYYY-MM-DDTHH:mm:ss')) + 
          '&lastEventTo='+ encodeURIComponent(this.$moment.utc().subtract(4, 'hours').format('YYYY-MM-DDTHH:mm:ss'));
          break;
        case "6": // more than 24hs
          this.filterString += 
          '&lastEventTo='+ encodeURIComponent(this.$moment.utc().subtract(24, 'hours').format('YYYY-MM-DDTHH:mm:ss'));
          break;
        default:
          break;
      } 
    }
  },
};
</script>
<style lang="scss" scoped>
//media queries
.filter-search {
  padding: 0px 10px 0px 10px !important;
}
// dialogs
.headline {
  height: 48px;
  font-size: 18px !important;
  font-weight: 600;
}
@media (max-width: 812px) {
  #filters-dropdown-text {
    display: none;
  }
}
.dialog-container {
  padding-top: 0;
}
.filters-form {
  margin-top: -20px;
}
.last-seen-icon {
  font-size: 16px;
}
.last-seen-text {
  font-size: 13px;
}
</style>