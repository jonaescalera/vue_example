<template>
  <div id="sla-page">
    <v-row>
      <v-col class="custom-card card-no-footer-height">
        <v-row class="ml-1">
          <v-col cols="12" class="d-flex flex-column">
            <div class="d-flex flex-row">
              <div class="d-flex flex-column">
                <VueCtkDateTimePicker
                  id="sla-start-date-picker"
                  :label="$t('select-dates')"
                  format="YYYY-MM-DD"
                  formatted="ll"
                  class="date-control"
                  v-model="dateRange"
                  :only-date="true"
                  :auto-close="true"
                  no-header
                  no-button
                  @input="onDateChange"
                  :range="true"
                  :max-date="maxDate"
                  :custom-shortcuts="datePickerShortcuts"
                />
                <p class="error-message" v-if="isDateError">
                  {{ $t('sla-date-range-error') }}
                </p>
              </div>
              <div v-if="monthArray && monthArray.length" class="d-flex flex-row align-center">
                <v-btn
                  id="sla-export-button"
                  depressed
                  color="secondary"
                  @click="exportData"
                >
                  Export
                </v-btn>
              </div>
            </div>
            <p class="sla-notice">
              *{{ $t('sla-utc-notice') }}
            </p>
          </v-col>
        </v-row>
        <v-row
          class="ml-1 mr-1 sla-result"
          v-if="monthArray && monthArray.length"
        >
          <v-col class="container-calendar">
            <div class="sla-calendar">
              <div class="sla-calendar-head-row-wrapper">
                <div class="sla-calendar-row">
                  <div
                    class="sla-calendar-head-item"
                    v-for="day of weekdays"
                    :key="day"
                  >
                    {{ day }}
                  </div>
                </div>
              </div>
              <div
                class="sla-calendar-body-row-wrapper"
                v-for="(week, weekIndex) in monthArray"
                :key="weekIndex"
              >
                <div class="sla-calendar-row">
                  <div
                    class="sla-calendar-body-item"
                    v-for="(day, dayIndex) in week"
                    :key="dayIndex"
                    :class="{
                      'sla-calendar-out-range': day.outOfRange,
                      'sla-calendar-warning': day.data && !day.data.slaPassed,
                      clickable: !day.outOfRange && day.data,
                    }"
                    @click="!day.outOfRange && day.data && openModal(day)"
                  >
                    <div class="sla-calendar-body-item-head">
                      <span>
                        {{ day.date }}
                        {{ day.displayMonth ? `(${day.month})` : null }}
                      </span>
                    </div>
                    <div
                      v-if="!day.outOfRange"
                      class="sla-calendar-body-item-data"
                    >
                      {{
                        (day.data && day.data.receivedPercentage && `${day.data.receivedPercentage} %`) || '-'
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
          <v-col class="container-summary">
            <p>{{ $t('expected-events') }}: {{ totalExpectedEvents }}</p>
            <p>{{ $t('received-events') }}: {{ totalReceivedEvents }}</p>
            <p>{{ $t('received-events-percentage') }}: {{ totalReceivedPercentage }} %</p>
            <p>{{ $t('average-delay') }}: {{ totalAverageDelay }} s</p>
            <p>{{ $t('sla-passed') }}: {{ slaPassed }}</p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog
      @click:outside="closeModal"
      @keydown.esc="closeModal"
      v-model="showModal"
      width="500"
      scrollable
    >
      <v-card id="deviceCreateEdit" class="sla-day-detail-modal">
        <v-card-title class="headline">
          {{ selectedDayData && selectedDayData.fullDate }}
        </v-card-title>
        <v-card-text class="mt-3">
          <p>{{ $t('expected-events') }}: {{ todayExpectedEvents }}</p>
          <p>{{ $t('received-events') }}: {{ todayReceivedEvents }}</p>
          <p>{{ $t('received-events-percentage') }}: {{ todayReceivedPercentage }} %</p>
          <p>{{ $t('average-delay') }}: {{ todayAverageDelay }} s</p>
          <p>{{ $t('sla-passed') }}: {{ todaySLAPassed }}</p>
          <DataTable
            v-if="showModal"
            :columns="columnDefs"
            :settings="{}"
            :rows="selectedDayResponse && selectedDayResponse.list"
          ></DataTable>
        </v-card-text>
        <v-card-actions>
          <v-col cols="12">
            <v-btn
              depressed
              color="secondary"
              tabindex="3"
              @click="closeModal"
              class="px-8 float-right"
            >
              {{ $t('ok') }}
            </v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import DataTable from '../../components/shared/data-table/data-table.vue';
import { csvMixin } from '../../mixins/csvExport';

export default {
  name: 'Reports',
  components: {
    VueCtkDateTimePicker,
    DataTable,
  },
  data() {
    return {
      dateRange: null,
      isDateError: false,
      datePickerShortcuts: [
        {
          key: 'last30Days',
          label: 'Last 30 Days',
          value: () => {
            return {
              start: this.$moment.utc().add(-29, 'days'),
              end: this.$moment.utc(),
            };
          },
        },
      ],
      monthArray: [],
      maxDate: this.$moment.utc().format('YYYY-MM-DD'),
      totalExpectedEvents: 0,
      totalReceivedEvents: 0,
      totalReceivedPercentage: 0,
      totalAverageDelay: 0,
      slaPassed: false,
      showModal: false,
      selectedDayData: null,
      selectedDayResponse: null,
      todayExpectedEvents: 0,
      todayReceivedEvents: 0,
      todayReceivedPercentage: 0,
      todayAverageDelay: 0,
      todaySLAPassed: false,
      columnDefs: [
        {
          name: this.$t('time'),
          field: 'timeString',
          type: 'data',
        },
        {
          name: this.$t('expected'),
          field: 'expectedUplinksPerHour',
          type: 'data',
        },
        {
          name: this.$t('received'),
          field: 'count',
          type: 'data',
        },
        {
          name: this.$t('average-delay-with-seconds-symbol'),
          field: 'averageDelay',
          type: 'data',
        },
      ],
      weekdays: [],
    };
  },
  mixins: [],
  computed: {
    ...mapGetters('site', ['currentSite']),
  },
  mounted() {
    this.weekdays = [];
    const currentDay = this.$moment().weekday(0);
    for (let i = 0; i < 7; i++) {
      this.weekdays.push(currentDay.format('ddd'));
      currentDay.add(1, 'days');
    }
  },
  methods: {
    ...mapActions('sla', ['getSLAList', 'getHourlySLAList']),
    async onDateChange() {
      this.isDateError = false;
      this.monthArray = [];
      if (this.dateRange && this.dateRange.start && this.dateRange.end) {
        const startDate = this.$moment.utc(this.dateRange.start);
        const endDate = this.$moment.utc(this.dateRange.end);
        const diff = endDate.diff(startDate, 'days') + 1;
        if (diff > 30) {
          this.isDateError = true;
          return;
        }
        const response = await this.getSLAList({
          siteId: this.currentSite.id,
          startDate: this.dateRange.start,
          endDate: this.dateRange.end,
        });
        if (response.summary) {
          this.totalExpectedEvents = response.summary.totalExpectedEvents;
          this.totalReceivedEvents = response.summary.totalReceivedEvents;
          this.totalReceivedPercentage = this.roundAndLimitPercentage(response.summary.percentageOfEventsReceived);
          this.totalAverageDelay = response.summary.totalAverageDelay;
          this.slaPassed = response.summary.slaPassed;
        }
        response.list.map(dayData => {
          const dayObj = this.$moment.utc(dayData.date).set({
            hour: 12,
            minute: 0,
            second: 0,
            millisecond: 0,
          });
          dayData.localDateTime = dayObj.valueOf();
          dayData.receivedPercentage = this.roundAndLimitPercentage(dayData.percentageOfEventsReceived);
          return dayData;
        });
        this.displayCalendar(startDate, endDate, response.list);
      }
    },
    displayCalendar(startDate, endDate, list) {
      startDate = this.$moment.utc(startDate).set({
        hour: 12,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
      const startDateTime = startDate.valueOf();
      endDate = this.$moment.utc(endDate).set({
        hour: 12,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
      const endDateTime = endDate.valueOf();

      const rangeStart = this.$moment
        .utc(startDate)
        .startOf('week')
        .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
      const rangeEnd = this.$moment
        .utc(endDate)
        .endOf('week')
        .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

      const monthArray = [];
      let currentWeek = -1;
      for (
        let currentDay = this.$moment.utc(rangeStart);
        currentDay.diff(rangeEnd, 'days') <= 0;
        currentDay.add(1, 'days')
      ) {
        if (currentDay.weekday() === 0) {
          monthArray.push([]);
          currentWeek++;
        }
        const dayData = {
          fullDate: currentDay.format('YYYY-MM-DD'),
          date: currentDay.date(),
          day: currentDay.format('ddd'),
          month: currentDay.format('MMM'),
          displayMonth: currentDay.date() === 1,
          momentObj: this.$moment.utc(currentDay),
          time: currentDay.valueOf(),
          outOfRange: true,
          data: null,
          slaResponse: null,
        };
        if (dayData.time >= startDateTime && dayData.time <= endDateTime) {
          dayData.outOfRange = false;
        }
        const dayResponse = list.find(
          day => day.localDateTime === dayData.time
        );
        if (dayResponse) {
          dayData.data = {
            receivedPercentage: dayResponse.receivedPercentage,
            slaPassed: dayResponse.slaPassed,
          };
          dayData.slaResponse = dayResponse;
        }
        monthArray[currentWeek].push(dayData);
      }
      monthArray[0][0].displayMonth = true;
      this.monthArray = monthArray;
    },
    async openModal(dayData) {
      const response = await this.getHourlySLAList({
        siteId: this.currentSite.id,
        date: dayData.fullDate,
      });
      this.todayExpectedEvents = response.summary.totalExpectedEvents;
      this.todayReceivedEvents = response.summary.totalReceivedEvents;
      this.todayReceivedPercentage = this.roundAndLimitPercentage(response.summary.percentageOfEventsReceived);
      this.todayAverageDelay = response.summary.totalAverageDelay;
      this.todaySLAPassed = response.summary.slaPassed;
      response.list.map(hourData => {
        hourData.timeString = this.$moment.utc(hourData.time).format('LT');
        hourData.receivedPercentage = this.roundAndLimitPercentage(hourData.percentageOfEventsReceived);
        return hourData;
      });
      this.showModal = true;
      this.selectedDayData = dayData;
      this.selectedDayResponse = response;
    },
    closeModal() {
      this.showModal = false;
      this.selectedDayData = null;
      this.selectedDayResponse = null;
      this.todayExpectedEvents = 0;
      this.todayReceivedEvents = 0;
      this.todayReceivedPercentage = 0;
    },
    exportData() {
      const daysArray = this.monthArray.reduce((acc, weekArray) => {
        acc.push(...weekArray);
        return acc;
      }, []);
      const exportArray = daysArray
        .filter(dayData => !dayData.outOfRange)
        .map(dayData => {
          let result = {
            date: dayData.fullDate,
          };
          if (dayData.slaResponse) {
            result = {
              ...result,
              receivedPercentage: dayData.slaResponse.receivedPercentage,
              received: dayData.slaResponse.totalCount,
              expected: dayData.slaResponse.expectedUplinks,
              averageDelay: dayData.slaResponse.averageDelay,
              slaPassed: dayData.slaResponse.slaPassed,
            }
          } else {
            result = {
              ...result,
              receivedPercentage: '-',
              received: '-',
              expected: '-',
              averageDelay: '-',
              slaPassed: '-',
            }
          }
          return result;
        });
      const formattedSiteName = this.currentSite.value.split(" ").join("-");
      csvMixin.methods.csvExport(exportArray, `SLA_export_${formattedSiteName}_${this.dateRange.start}_to_${this.dateRange.end}`);
    },
    roundAndLimitPercentage(percentage) {
      return percentage <= 100 ? Math.round(percentage) : 100;
    },
  },
  watch: {
    currentSite() {
      this.onDateChange();
    },
  },
};
</script>
<style lang="scss" scoped>
.custom-card{
  overflow-y: auto;
}
.sla-notice {
  color: var(--v-primary-darken2);
  font-size: 12px;
}
p.label {
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: bold;
  margin-bottom: 5px;
}
.date-control {
  padding: 5px 5px 5px 0;
  width: 250px;
  margin: unset;
}
.container-calendar {
  flex: 9 0 75%;
  max-width: 900px;
}
.container-summary {
  flex: 3 0 25%;
}
@media (max-width: 900px) {
  .container-summary {
    order: -1;
    flex: 0 0 100%;
  }
}
.sla-result {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
}
.sla-calendar {
  border-left: 1px solid #d3d3d3;
  border-top: 1px solid #d3d3d3;
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
.sla-calendar-head-row-wrapper {
  position: relative;
  padding-top: 3.571428571%;
  /*
    Cell = 4 : 1 Aspect Ratio
    Row has 7 Cells = 28 : 1 Aspect Ratio
    1 / 28 * 100 = 3.571428571%
  */
}
.sla-calendar-row {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
}
.sla-calendar-head-item {
  flex: 1 0 20px;
  user-select: none;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  color: hsla(0, 0%, 0%, 0.404);
  border-right: 1px solid #d3d3d3;
  border-bottom: 1px solid #d3d3d3;
}
.sla-calendar-body-row-wrapper {
  position: relative;
  padding-top: 10.714285714%;
  /*
    Cell = 4 : 3 Aspect Ratio
    Row has 7 Cells = 28 : 3 Aspect Ratio
    3 / 28 * 100 = 10.714285714%
  */
}
.sla-calendar-body-item {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #d3d3d3;
  border-bottom: 1px solid #d3d3d3;
  user-select: none;
  height: 100%;
  &.sla-calendar-out-range {
    background-color: #f1f1f1;
    cursor: not-allowed;
  }
  &.sla-calendar-warning {
    background-color: #ffe7e7;
  }
  &.clickable {
    cursor: pointer;
  }
}
.sla-calendar-body-item-head {
  padding: 10px 0px 0px;
  line-height: 100%;
  user-select: none;
  text-align: center;
}
.sla-calendar-body-item-data {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.headline {
  height: 48px;
  font-size: 18px !important;
  font-weight: 600;
  color: #3b5762;
}
.error-message {
  color: red;
}
</style>
<style lang="scss">
.sla-day-detail-modal {
  tbody {
    height: 400px !important;
  }
}
</style>
