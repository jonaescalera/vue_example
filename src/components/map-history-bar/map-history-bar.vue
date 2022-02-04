<template>
  <div style="height: 100%" ref="mainContainer">
    <slot></slot>
    <div class="date-bar-container">
      <div class="d-flex">
        <v-btn-toggle v-model="dateOption" tile class="btn-toggle">
          <v-btn :value="dateOptions.custom">{{ $t('assets-date-option-custom') }}</v-btn>
        </v-btn-toggle>
        <v-btn-toggle
          class="btn-toggle"
          v-model="dateOption"
          v-if="dateOption !== dateOptions.custom"
          tile
        >
          <v-btn @click="onChangeDateOption(dateOptions.today)" :value="dateOptions.today">{{ $t('assets-date-option-today') }}</v-btn>
          <v-btn
            @click="onChangeDateOption(dateOptions.yesterday)"
            :value="dateOptions.yesterday"
          >{{ $t('assets-date-option-yesterday') }}</v-btn>
          <v-btn
            @click="onChangeDateOption(dateOptions.thisWeek)"
            :value="dateOptions.thisWeek"
          >{{ $t('assets-date-option-this-week') }}</v-btn>
          <v-btn
            @click="onChangeDateOption(dateOptions.lastWeek)"
            :value="dateOptions.lastWeek"
          >{{ $t('assets-date-option-last-week') }}</v-btn>
          <v-btn
            @click="onChangeDateOption(dateOptions.lastSeen)"
            :value="dateOptions.lastSeen"
          >{{ $t('last-seen') }}</v-btn>
        </v-btn-toggle>
        <v-btn
          v-if="dateOption !== dateOptions.custom"
          class="date-bar-btn primary--text"
          color="primaryLight"
          depressed
          @click="onHistoryCancel"
        >{{ $t('cancel') }}</v-btn>
        <div class="d-flex" v-if="dateOption === dateOptions.custom">
          <VueCtkDateTimePicker
            id="history-start-date-picker"
            class="date-control"
            v-model="historyStartDate"
            :label="$t('assets-history-start-date')"
            no-header
            no-button
          />
          <VueCtkDateTimePicker
            id="history-end-date-picker"
            class="date-control"
            v-model="historyEndDate"
            :label="$t('assets-history-end-date')"
            no-header
            no-button
            no-shortcuts
          />
          <v-btn
            class="date-bar-btn"
            color="primary"
            depressed
            @click="onHistorySubmit"
            :disabled="invalidDates"
          >{{ $t('submit') }}</v-btn>
          <v-btn
            class="date-bar-btn primary--text"
            color="primaryLight"
            depressed
            @click="onHistoryCancel"
          >{{ $t('cancel') }}</v-btn>
        </div>
      </div>
      <div v-if="dateOption !== dateOptions.custom">
        <label
          class="date-display-label"
        >{{historyStartDateDisplayValue}} - {{historyEndDateDisplayValue}}</label>
      </div>
    </div>

    <!-- SUPER TAG EVENT LIST START -->
    <vue-draggable-resizable
      v-if="historyEventListData.length"
      :resizable="false"
      :parent="true"
      :z="1"
      :w="165"
      :h="'auto'"
      :max-height="350"
      :x="historyListXPos"
      :y="historyListYPos"
      :onDrag="onHistoryListDrag"
      class="event-list-wrapper"
    >
      <div class="event-list-container" ref="eventListContainer">
        <ul class="event-list">
          <li
            class="event-list-item"
            v-for="(event, index) in historyEventListData"
            :ref="'historyEventIndex'+index"
            :key="index"
            :class="{ selected: index === currentHistoryEventIndex }"
            @click="onSelectHistoryEvent(index)"
          >
            <div class="d-flex">
              <span>
                <img class="legend-icon" :src="tagIcons[event.source]" /> 
              </span>
              <span>
              {{ event.d | moment('M/D/YYYY hh:mm A') }}
              </span>
            </div>
            <v-divider></v-divider>
          </li>
        </ul>
      </div>
    </vue-draggable-resizable>
    <!-- SUPER TAG EVENT LIST END-->

    <!-- HISTORY NOT AVAILABLE MESSAGE START-->
    <div class="map-message-container" v-if="showHistoryNotAvailableMessage">
      <div>{{ $t('assets-page-no-history-message') }}</div>
    </div>
    <!-- HISTORY NOT AVAILABLE MESSAGE END -->
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import { scrollMixin } from '../../mixins/scrollParentToChild';
import {
  createMarker,
  removeMarker,
  drawHistory,
  clearLayers,
  addPolygonToMap,
  addPolygonsSourceToMap,
  addFillPolygonAndLineToMap,
} from '../../utils/map';
const networkAssetPath = `${process.env.VUE_APP_NETWORK_ASSETS_URL}/networkAsset/airfinder/`;

const MAX_RANGE_DATE = 60;

export default {
  components: {
    VueCtkDateTimePicker,
  },
  mixins: [scrollMixin],
  props: {
    map: null,
    tag: null,
    zones: null,
    area: null,
    playHistory: null,
  },
  data() {
    return {
      dateOption: null,
      fetchingHistory: false,
      playingHistory: false,
      historyEventListData: [],
      currentHistoryEventIndex: -1,
      showHistoryNotAvailableMessage: false,
      historyStartDate: this.$moment().startOf('day'),
      historyEndDate: this.$moment(),
      dateOptions: {
        custom: '1',
        today: '2',
        yesterday: '3',
        thisWeek: '4',
        lastWeek: '5',
        lastSeen: '6',
      },
      historyListXPos: 0,
      historyListYPos: 0,
      tagIcons: {
        gps: require('../../assets/img/map/pin_gps.png'),
        wifi: require('../../assets/img/map/pin_wifi.png'),
        cellid: require('../../assets/img/map/pin_cell.png'),
        beacon: require('../../assets/img/map/pin_location.png'),
        heartbeat: require('../../assets/img/map/pin_hb.png')
      },
    };
  },
  mounted() {
    this.onChangeDateOption(this.dateOptions.lastSeen);
    this.dateOption = this.dateOptions.lastSeen;
    this.setDefaultHistoryListPosition();
    window.addEventListener('resize', this.setDefaultHistoryListPosition);
  },
  computed: {
    historyStartDateDisplayValue: function () {
      let startDateDisplay =
        typeof this.historyStartDate === 'string'
          ? this.$moment(this.historyStartDate, 'YYYY-MM-DD hh:mm a')
          : this.historyStartDate;
      startDateDisplay = startDateDisplay.format('M/D/YYYY hh:mm A');
      return startDateDisplay;
    },
    historyEndDateDisplayValue: function () {
      let endDateDisplay =
        typeof this.historyEndDate === 'string'
          ? this.$moment(this.historyEndDate, 'YYYY-MM-DD hh:mm a')
          : this.historyEndDate;
      endDateDisplay = endDateDisplay.format('M/D/YYYY hh:mm A');
      return endDateDisplay;
    },
    invalidDates: function(){
      return this.fetchingHistory || this.historyStartDate === null || this.historyEndDate === null || (new Date(this.historyEndDate) < new Date(this.historyStartDate));
    }
  },
  watch:{
    playHistory: function(newPlayHistory){
      this.onPlayHistory();
    },
    historyEventListData: function(){
      //show or hide the play button on the side list for the selected tag
      if(this.historyEventListData.length > 0){
        this.$emit('showHistoryPlayBtn', true);
      }else{
        this.$emit('showHistoryPlayBtn', false);
      }
    }
  },
  methods: {
    ...mapActions('tag', ['getTagHistory']),
    async onHistorySubmit() {
      this.$emit('onSubmit');

      this.showHistoryNotAvailableMessage = false;
      this.playingHistory = false;
      this.historyEventListData = [];
      if (this.historyStartDate && this.historyEndDate) {
        const startDate =
          typeof this.historyStartDate === 'string'
            ? this.$moment(this.historyStartDate, 'YYYY-MM-DD hh:mm a')
            : this.historyStartDate;

        const endDate =
          typeof this.historyEndDate === 'string'
            ? this.$moment(this.historyEndDate, 'YYYY-MM-DD hh:mm a')
            : this.historyEndDate;

        const endDateMax = startDate.clone().add(MAX_RANGE_DATE, 'days');
        
        if (endDate.diff(endDateMax) > 0) {
          this.$toasted.show(this.$t('assets-date-range-message'), {
            position: 'bottom-right',
            className: ['toast-error'],
            duration: 5000,
          });
          return;
        }

        this.fetchingHistory = true;
        this.currentHistoryEventIndex = -1;
        clearLayers(this.map);
        removeMarker(this.map);

        this.drawArea(this.area);
        this.drawZones(this.area);

        const payload = {
          id: this.tag.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };

        try {
          const tagHistory = await this.getTagHistory(payload);
          this.historyEventListData = tagHistory.historyEventsList;
          this.showHistoryNotAvailableMessage = !tagHistory.historyGeoJson
            .features.length;
          drawHistory(this.map, tagHistory.historyGeoJson, (eventId) => {
            const eventListIndex = this.historyEventListData.findIndex(
              (event) => event.id === eventId
            );
            this.onSelectHistoryEvent(eventListIndex);
          });
          this.fetchingHistory = false;
        } catch (error) {
          this.showHistoryNotAvailableMessage = true;
          this.fetchingHistory = false;
        }
      }
    },
    onHistoryCancel() {
      this.playingHistory = false;
      this.$emit('onCancel');
    },
    onSelectHistoryEvent(index) {
      this.currentHistoryEventIndex = index;
      createMarker(this.historyEventListData[index].coordinates, this.map);
      scrollMixin.methods.scrollParentToChild(
        this.$refs.eventListContainer,
        this.$refs['historyEventIndex' + this.currentHistoryEventIndex][0]
      );
    },
    onPlayHistory() {
      this.playingHistory = !this.playingHistory;
      if (this.playingHistory) {
        this.currentHistoryEventIndex =
          this.currentHistoryEventIndex < 0 ? 0 : this.currentHistoryEventIndex;
        this.startAnimation(this.map, this.historyEventListData);
      }
    },
    startAnimation(map, data) {
      let that = this;

      let animateMarker = () => {
        if (this.currentHistoryEventIndex >= data.length) {
          removeMarker(map);
          that.playingHistory = false;
          this.$emit('playHistoryFinished');
          this.currentHistoryEventIndex = -1;
          return;
        }
        if (!that.playingHistory) {
          return;
        }
        createMarker(data[that.currentHistoryEventIndex].coordinates, map);
        scrollMixin.methods.scrollParentToChild(
          this.$refs.eventListContainer,
          this.$refs['historyEventIndex' + this.currentHistoryEventIndex][0]
        );

        setTimeout(() => {
          requestAnimationFrame(animateMarker);
          that.currentHistoryEventIndex += 1;
        }, 300);
      };
      requestAnimationFrame(animateMarker);
    },
    onChangeDateOption(option) {
      if (option === this.dateOption) {
        return;
      }
      switch (option) {
        case this.dateOptions.today:
          this.historyStartDate = this.$moment().startOf('day');
          this.historyEndDate = this.$moment();
          break;
        case this.dateOptions.yesterday:
          this.historyStartDate = this.$moment()
            .subtract(1, 'day')
            .startOf('day');
          this.historyEndDate = this.$moment().subtract(1, 'day').endOf('day');
          break;
        case this.dateOptions.thisWeek:
          this.historyStartDate = this.$moment().startOf('week').add(1, 'day');
          this.historyEndDate = this.$moment();
          break;
        case this.dateOptions.lastWeek:
          this.historyStartDate = this.$moment()
            .subtract(1, 'week')
            .startOf('week')
            .add(1, 'day');
          this.historyEndDate = this.$moment()
            .subtract(1, 'week')
            .endOf('week')
            .add(1, 'day');
          break;
          case this.dateOptions.lastSeen:
            let week = 7;
            this.historyStartDate = this.$moment()
              .subtract(this.tag.notSeenInDays + week * 2, 'day')
              .startOf('day');
              if (this.tag.notSeenInDays < MAX_RANGE_DATE - (week * 2)) {
                this.historyEndDate = this.$moment();
                } else {
                this.historyEndDate = this.$moment().subtract(this.tag.notSeenInDays , 'day').endOf('day');
              }
          break;
        default:
          break;
      }

      this.onHistorySubmit();
    },
    setDefaultHistoryListPosition() {
      const mainWidth = this.$refs.mainContainer.clientWidth;
      const mainHeight = this.$refs.mainContainer.clientHeight;
      this.historyListXPos = Math.floor(mainWidth - mainWidth * 0.02 - 165); // 2 % from the right, also minus the width of the div
      this.historyListYPos = Math.floor(mainHeight * 0.2); // 20 % from the top
    },
    onHistoryListDrag(x, y) {
      this.historyListXPos = x;
      this.historyListYPos = y;
    },
    drawZones(area) {
      if (area && area.id) {
        const zoneSourceUrl = `${networkAssetPath}zones/geojson?areaId=${area.id}`;
        const sourceId = addPolygonsSourceToMap(this.map, zoneSourceUrl, 'history-zones-airfinder');
        addFillPolygonAndLineToMap(this.map, sourceId, '#eb4986')
      }
    },
    drawArea(area) {
      if (area && area.assetInfo && area.assetInfo.metadata.props.polygon) {
        const sourceId = addPolygonToMap(
          this.map,
          area.assetInfo.metadata.props.polygon,
          `${area.id}-airfinder`
        );
        addFillPolygonAndLineToMap(this.map, sourceId, this.$vuetify.theme.themes.light.secondary);
      }
    },
  },
  beforeDestroy() {
    this.playingHistory = false;
    window.removeEventListener('resize', this.setDefaultHistoryListPosition);
  },
};
</script>

<style lang="scss" scoped>
// Date Bar Start
.date-bar-container {
  position: absolute;
  z-index: 3;
  margin: 5px 10px 10px 120px;
  border: 1px solid white;
  background-color: white;
  border-radius: 3px;
  .btn-toggle {
    margin: 5px;
  }
}

.date-control {
  padding: 5px;
  width: 250px;
}

.date-bar-btn {
  align-self: center;
  margin-right: 5px;
}
// Date Bar End

.date-display-label {
  margin: 10px 10px 10px 100px;
}

// List Start
.event-list-container {
  background-color: white;
  opacity: 0.8;
  padding: 10px 2px 10px 5px;
  z-index: 1;
  border: 1px solid;
  border-radius: 3px;
  text-align: center;
  overflow-y: auto;
  width: 165px;
  max-height: 350px;
  cursor: move;
  .event-list {
    list-style: none;
    padding: 0px;
    .selected {
      background: radial-gradient(#faff67, transparent);
    }
    .event-list-item {
      padding: 5px;
      cursor: pointer;
      &:hover {
        background: radial-gradient(#76e9ff, transparent);
      }
    }
  }
}
// List End

// Message Bar Start
.map-message-container {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 40%;
  padding: 2px 10px;
  border: 1px solid;
  background-color: white;
  border-radius: 3px;
}
// Message Bar End

.event-list-wrapper {
  position: absolute;
}
.legend-icon {
  padding: 0px 4px;
  height: 16px;
}
</style>