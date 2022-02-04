<template>
  <div>
    <div class="ag-grid-status">
      <div class="py-2">
        <div class="grid-header">
          <div class="reportStatus">
            <div v-if="typeof header === 'string'">
              <strong>{{ header }}</strong>
            </div>
            <template v-else>
              <div v-for="item in header" :key="item">
                <strong>{{ item }}</strong>
              </div>
            </template>
          </div>
          <div class="controls">
            <div v-if="allowExport">
              <button
                @click="!isLoading && !exportDisabled && $emit('export')"
                :disabled="isLoading || exportDisabled"
              >
                {{ exportButtonLabel || "Export" }}
              </button>
            </div>
            <div v-if="defModalId">
              <div class="px-2">
                <img
                  class="help-icon"
                  src="../assets/img/help-icon.svg"
                  @click="showModal = true"
                />
              </div>

              <div v-if="defModalId" :id="defModalId" class="modal" :class="{'is-active': showModal}">
                <div class="modal-background"></div>
                <div class="modal-card">
                  <header class="modal-card-head">
                    <p class="modal-card-title">Definitions</p>
                    <img class="help-icon" src="../assets/icons/cross.svg" @click="showModal = false">
                  </header>
                  <section class="modal-card-body">
                    <table>
                      <tr>
                        <th>Color</th>
                        <th class="table-header-defintion">Definition</th>
                      </tr>
                      <tbody>
                        <tr>
                          <td>Red</td>
                          <td>
                            <span style="display:inline-block;">
                              Several Heartbeats missed; device is likely offline.
                              Check for device changes, loss of power, or poor
                              signal coverage.
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>Green</td>
                          <td>
                            <span style="display:inline-block;">
                              Device is actively sending heartbeats.
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>Gray</td>
                          <td>
                            <span style="display:inline-block;">
                              No traffic history detected for device. Verify
                              device is installed, has power, and mac address is
                              correct.
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>Blue</td>
                          <td>
                            <span style="display:inline-block;">
                              Unprovisioned device is likely in the same room as
                              the device name given. (LB Name for Unprovisioned
                              Access Points, AP Name for Unprovisioned Location
                              Beacons)
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table class="second-table">
                      <tr>
                        <th>Parameter</th>
                        <th class="table-header-defintion">Definition</th>
                      </tr>
                      <tbody>
                        <tr>
                          <td>HBER</td>
                          <td>
                            <strong>Heartbeat Error Rate:</strong>
                            <br />
                            <br />
                            <span style="display:inline-block;">
                              0% means 0 of the last 4 messages from the device
                              were missed. An error rate of 25% indicates 1 of the
                              last 4 heartbeat messages was not received. A HBER
                              with an &quot;*&quot; next to it indicates the
                              device has never sent a heartbeat to the system.
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td>RSRQ</td>
                          <td>
                            <strong>Reference Signal Received Quality:</strong>
                            <br />
                            <br />
                            <span style="display:inline-block;">
                              RSRQ = (N * RSRP) / RSSI measured over the same
                              bandwidth. RSRQ is a C/I type of measurement and it
                              indicates the quality of the received reference
                              signal. The RSRQ measurement provides additional
                              information when RSRP is not sufficient to make a
                              reliable handover or cell re-selection decision.
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td>RSRP</td>
                          <td>
                            <strong>Reference Signal Received Power:</strong>
                            <br />
                            <br />
                            <span style="display:inline-block;">
                              RSRP is the power of the LTE Reference Signals
                              spread over the full bandwidth and narrowband. A
                              minimum of -20 dB SINR (of the S-Synch channel) is
                              needed to detect RSRP/RSRQ.
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td>RSSI</td>
                          <td>
                            <strong>Received Signal Strength Indicator:</strong>
                            <br />
                            <br />
                            <span style="display:inline-block;">
                              For Location Beacons and Access Points, RSSI is an
                              estimated measure of power level that a device is
                              receiving from an Access Point or Gateway,
                              respectively. At low values (larger negative value)
                              signal wireless data rates get slower and/or
                              transmissions cannot get through.
                            </span>
                            <br />
                            <br />
                            <span style="display:inline-block;">
                              For Gateways, the carrier RSSI measures the average
                              total received power observed only in OFDM symbols
                              containing reference symbols for antenna port 0. The
                              total received power of the carrier RSSI includes
                              the power from co-channel serving &amp; non-serving
                              cells, adjacent channel interference, thermal noise,
                              etc.
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td>Avg</td>
                          <td>
                            <strong>
                              Average:
                            </strong>
                            <br />
                            <br />
                            <span style="display:inline-block;">
                              Average is calculated from the last 10 samples.
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <data-table
        :height="this.gridHeight"
        :rows="rows"
        :columns="columns"
        :actions="actions"
        :isSortable="isSortable"
        :totalRows="totalRows"
        :isLoading="isLoading"
        @getFilteredData="getFilterData"
        ref="dataTable"
      >
      </data-table>
    </div>
  </div>
</template>

<script>
import DataTable from "./data-table.vue";

export default {
  components: {
    DataTable
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
    defModalId: {
      type: String,
      default: "",
    },
    header: {
      type: [String, Array],
      default: "",
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    totalRows: {
      type: Number,
      default: null,
    },
    isSortable: {
      type: Boolean,
      default: false,
    },
    allowExport: {
      type: Boolean,
      default: false,
    },
    exportDisabled: {
      type: Boolean,
      default: false,
    },
    exportButtonLabel: {
      type: String,
      default: "",
    },
    actions: null
  },
  data: function () {
    return {
      gridHeight: this.height || "250px",
      showModal: false,
    };
  },
  methods: {
    getFilterData(size, page, orderBy, sortBy) {
      this.$emit("onFilter", size, page, orderBy, sortBy);
    },
    refresh() {
      this.$refs.dataTable.refresh();
    }
  },
}
</script>

<style lang="scss" scoped>
@import "../styles/bulma/sass/utilities/_all.sass";
@import "../styles/bulma/sass/components/modal.sass";

.ag-grid-status {
  .grid-header {
    display: flex;
    justify-content: space-between;
  }
  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .reportStatus {
    display: flex;
    flex-direction: column;
  }
}

.help-icon {
  width: 20px;
  cursor: pointer;
}

table {
  width: 100%;
}

table,
th,
td {
  border: 1px solid black;
  border-collapse: collapse;
}

th,
td {
  padding: 5px;
}
th {
  text-align: left;
  min-width: 100px;
}
.table-header-defintion {
  text-align: center;
}
.second-table {
  margin-top: 1em;
}
.modal-card-title {
  margin-bottom: 0px;
}
</style>
