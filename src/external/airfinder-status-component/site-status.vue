<template>
  <div>
    <div class="refresh-button">
      <h2 v-if="header">{{ header }}</h2>
      <button class="button is-link is-small" @click="refreshAll()">Refresh</button>
    </div>

    <div class="site">
      <grid
        :columns="deviceStatusColumns"
        :rows="deviceStatus.rows"
        :header="deviceStatusHeader"
        :isLoading="deviceLoading"
        :isSortable="false"
        :totalRows="deviceStatus.total"
        :allowExport="true"
        exportButtonLabel="Export All"
        :exportDisabled="
          deviceLoading ||
            gatewayLoading ||
            accessPointLoading ||
            locationBeaconLoading ||
            tagLoading
        "
        @export="exportAll"
        class="grid site-status"
      ></grid>
      <grid
        :columns="unprovisionedLocationBeaconStatusColumns"
        :rows="unprovisionedLocationBeaconStatus.rows"
        defModalId="unprovisionedLocationBeacon-modal"
        :header="unprovisionedLocationBeaconStatusTitle"
        :isSortable="true"
        :isLoading="deviceLoading || unprovisionedLocationBeaconLoading"

        :allowExport="true"
        @export="exportUnprovisionedLocationBeaconStatus"

        @onFilter="getFilteredUnprovisionedLocationBeaconStatus"
        :totalRows="unprovisionedLocationBeaconStatus.total"
        class="grid"
        ref="unprovisionedLocationBeaconTable"
      ></grid>
      <grid
        :columns="unprovisionedAccessPointStatusColumns"
        :rows="unprovisionedAccessPointStatus.rows"
        defModalId="unprovisionedAccessPoint-modal"
        :header="unprovisionedAccessPointStatusTitle"
        :isSortable="true"
        :isLoading="deviceLoading || unprovisionedAccessPointLoading"

        :allowExport="true"
        @export="exportUnprovisionedAccessPointStatus"

        @onFilter="getFilteredUnprovisionedAccessPointStatus"
        :totalRows="unprovisionedAccessPointStatus.total"
        class="grid"
        ref="unprovisionedAccessPointTable"
      ></grid>
      <grid
        :columns="gatewayStatusColumns"
        :rows="gatewayStatus.rows"
        :actions="gatewayStatusOptions"
        defModalId="gateway-modal"
        :header="gatewayStatusTitle"
        :isSortable="true"
        :isLoading="deviceLoading || gatewayLoading"
        :allowExport="true"
        @export="exportGatewayStatus"
        @onFilter="getFilteredGatewayStatus"
        :totalRows="gatewayStatus.total"
        class="grid"
        ref="gatewayTable"
      ></grid>
      <grid
        :columns="accessPointStatusColumns"
        :rows="accessPointStatus.rows"
        :actions="accessPointStatusOptions"
        defModalId="accessPointModal-modal"
        :header="accessPointStatusTitle"
        :isSortable="true"
        :isLoading="deviceLoading || accessPointLoading"
        :allowExport="true"
        @export="exportAccessPointStatus"
        @onFilter="getFilteredAccessPointStatus"
        :totalRows="accessPointStatus.total"
        class="grid"
        ref="accessPointTable"
      ></grid>
      <grid
        :columns="locationBeaconStatusColumns"
        :rows="locationBeaconStatus.rows"
        defModalId="locationBeaconStatus-modal"
        :header="locationBeaconStatusTitle"
        :isSortable="true"
        :isLoading="deviceLoading || locationBeaconLoading"
        :allowExport="true"
        @export="exportLocationBeaconStatus"
        @onFilter="getFilteredLocationBeaconStatus"
        :totalRows="locationBeaconStatus.total"
        class="grid"
        ref="locationBeaconTable"
      ></grid>
      <grid
        :columns="tagStatusColumns"
        :rows="tagStatus.rows"
        :header="tagStatusTitle"
        :isSortable="true"
        :isLoading="deviceLoading || tagLoading"
        :allowExport="true"
        @export="exportTagStatus"
        @onFilter="getFilteredTagStatus"
        :totalRows="tagStatus.total"
        class="grid"
        ref="tagTable"
      ></grid>
    </div>
  </div>
</template>

<script>
import JSZip from "jszip";
import moment from "moment";
import Grid from './components/grid.vue'
import { generateCSVData } from "./utils/export";
import { downloadBlobInBrowser, downloadInBrowser } from "./utils/file";
import {
  DeviceColumns,
  GatewayColumns,
  AccessPointColumns,
  LocationBeaconColumns,
  TagColumns,
  SiteStatusType,
  UnprovisionedLocationBeaconColumns,
  UnprovisionedAccessPointColumns,
  firstPage,
  defaultPerPage,
  defaultSortDirection,
  defaultSortBy,
  defaultGatewaySortDirection,
  defaultGatewaySortBy,
  defaultTagDirection,
  defaultTagSortBy,
  defaultUnprovisionedSortDirection,
  defaultUnprovisionedSortBy,
} from './constants/site-status';
import SiteStatus from './models/site-status';

export default {
  components: {
    Grid
  },
  data: function() {
    return {
      orgName: null,
      site: null,
      deviceStatusTitle: "Device Report",
      deviceStatusHeaderSuffix: "",
      unprovisionedLocationBeaconStatusTitle: "Unprovisioned Location Beacons",
      unprovisionedAccessPointStatusTitle: "Unprovisioned Access Points",
      gatewayStatusTitle: "Gateways",
      accessPointStatusTitle: "Access Points",
      locationBeaconStatusTitle: "Location Beacons",
      tagStatusTitle: "Tags",
      lastStatusFetchTime: new Date(),
      deviceLoading: true,
      unprovisionedLocationBeaconLoading: true,
      unprovisionedAccessPointLoading: true,
      gatewayLoading: true,
      accessPointLoading: true,
      locationBeaconLoading: true,
      tagLoading: true,
      deviceStatus: { rows: [], total: 0 },
      unprovisionedLocationBeaconStatus: { rows: [], total: 0 },
      unprovisionedAccessPointStatus: { rows: [], total: 0 },
      gatewayStatus: { rows: [], total: 0 },
      accessPointStatus: { rows: [], total: 0 },
      locationBeaconStatus: { rows: [], total: 0 },
      tagStatus: { rows: [], total: 0 },
    };
  },
  beforeMount() {
  },
  props:['siteid', 'inputservice', 'header', 'showActions'],
  computed: {
    deviceStatusColumns: function(){
      return DeviceColumns;
    },
    unprovisionedLocationBeaconStatusColumns: function(){
      return UnprovisionedLocationBeaconColumns;
    },
    unprovisionedAccessPointStatusColumns: function(){
      return UnprovisionedAccessPointColumns;
    },
    gatewayStatusColumns: function(){
      return GatewayColumns;
    },
    accessPointStatusColumns: function(){
      return AccessPointColumns;
    },
    locationBeaconStatusColumns: function(){
      return LocationBeaconColumns;
    },
    tagStatusColumns: function(){
      return TagColumns;
    },
    deviceStatusHeader: function() {
      let headers = [];
      if (this.deviceStatusHeaderSuffix) {
        headers.push(
          `${this.deviceStatusTitle} | ${this.deviceStatusHeaderSuffix}`
        );
      } else {
        headers.push(this.deviceStatusTitle);
      }
      let siteIdHeader = "Site ID: ";
      if (this.siteid) {
        siteIdHeader = `${siteIdHeader}${this.siteid}`;
      }
      headers.push(siteIdHeader);

      if (this.orgName) {
        headers.push(`Org Name: ${this.orgName}`);
      }

      let siteNameHeader = "Site Name: ";
      if (this.site && this.site.value) {
        siteNameHeader = `${siteNameHeader}${this.site.value}`;
      }
      headers.push(siteNameHeader);

      return headers;
    },
    siteIdentifier() {
      return this.site && this.site.value
        ? this.site.value.split(" ").join("-")
        : this.siteId;
    },
    accessPointStatusOptions() {
      if (this.showActions) {
        return [
          {
            name: 'Restart',
            icon: 'reload',
            fn: this.onRestartAccessPoint,
          },
        ]
      }
      return null
    },
    gatewayStatusOptions() {
      if (this.showActions) {
        return [
          {
            name: 'Restart',
            icon: 'reload',
            fn: this.onRestartGateway,
          },
        ]
      }
    }
  },
  mounted: function() {
    this.getData();
  },
  watch:{
    siteid(){
      this.getData();
    }
  },
  methods: {
    async getData() {
      if (this.siteid) {
        await Promise.all([
          this.getSiteAndOrgInfo(),
          this.fetchAllStatus()
        ]);
      }
    },
    refreshAll() {
      this.$refs.unprovisionedLocationBeaconTable.refresh();
      this.$refs.unprovisionedAccessPointTable.refresh();
      this.$refs.gatewayTable.refresh();
      this.$refs.accessPointTable.refresh();
      this.$refs.locationBeaconTable.refresh();
      this.$refs.tagTable.refresh();
      this.fetchAllStatus();
    },
    async fetchAllStatus(){
      await this.getDeviceStatus();
      await Promise.all([
        this.getUnprovisionedLocationBeaconStatus(
          firstPage,
          defaultPerPage,
          defaultUnprovisionedSortDirection,
          defaultUnprovisionedSortBy,
        ),
        this.getUnprovisionedAccessPointStatus(
          firstPage,
          defaultPerPage,
          defaultUnprovisionedSortDirection,
          defaultUnprovisionedSortBy,
        ),
        this.getGatewayStatus(
          firstPage,
          defaultPerPage,
          defaultGatewaySortDirection,
          defaultGatewaySortBy,
        ),
        this.getAccessPointStatus(
          firstPage,
          defaultPerPage,
          defaultSortDirection,
          defaultSortBy,
        ),
        this.getLocationBeaconStatus(
          firstPage,
          defaultPerPage,
          defaultSortDirection,
          defaultSortBy,
        ),
        this.getTagStatus(
          firstPage,
          defaultPerPage,
          defaultTagDirection,
          defaultTagSortBy,
        )
      ]);
    },
    async getSiteAndOrgInfo() {
      this.site = null;
      this.orgName = null;
      this.site = await this.inputservice.getSite(this.siteid);
      this.orgName =
        this.site &&
        this.site.assetInfo &&
        this.site.assetInfo.metadata &&
        this.site.assetInfo.metadata.props &&
        this.site.assetInfo.metadata.props.organizationName;
    },
    async getDeviceStatus() {
      this.deviceLoading = true;
      try {
        const response = await this.inputservice.getDeviceStatus(this.siteid);
        this.deviceStatus = new SiteStatus().normalizeDeviceStatus(response);
      } catch (e) {
        this.deviceStatus = { rows: [], total: 0 };
        throw e;
      } finally {
        this.deviceLoading = false;
      }
      this.setDeviceReportHeader();
    },
    async getUnprovisionedLocationBeaconStatus(
      page,
      size,
      orderBy,
      sortBy
    ) {
      try {
        this.unprovisionedLocationBeaconLoading = true;
        const response = await this.inputservice.getUnprovisionedLocationBeaconStatus(
          this.siteid,
          page,
          size,
          orderBy,
          sortBy
        );
        this.unprovisionedLocationBeaconStatus = new SiteStatus().normalizeUnprovisionedLocationBeaconStatus(response);
      } catch (e) {
        this.unprovisionedLocationBeaconStatus = { rows: [], total: 0 };
        throw e;
      } finally {
        this.unprovisionedLocationBeaconLoading = false;
      }
    },
    async getUnprovisionedAccessPointStatus(
      page,
      size,
      orderBy,
      sortBy,
    ) {
      try {
        this.unprovisionedAccessPointLoading = true;
        const response = await this.inputservice.getUnprovisionedAccessPointStatus(
          this.siteid,
          page,
          size,
          orderBy,
          sortBy
        );
        this.unprovisionedAccessPointStatus = new SiteStatus().normalizeUnprovisionedAccessPointStatus(response);
      } catch (e) {
        this.unprovisionedAccessPointStatus = { rows: [], total: 0 };
        throw e;
      } finally {
        this.unprovisionedAccessPointLoading = false;
      }
    },
    async getGatewayStatus(
      page,
      size,
      orderBy,
      sortBy,
    ) {
      this.gatewayLoading = true;
      try {
        const response = await this.inputservice.getGatewayStatus(
          this.siteid,
          page,
          size,
          orderBy,
          sortBy
        );
        this.gatewayStatus = new SiteStatus().normalizeGatewayStatus(response);
      } catch (e) {
        this.gatewayStatus = { rows: [], total: 0 };
        throw e;
      } finally {
        this.gatewayLoading = false;
      }
    },
    async getAccessPointStatus(
      page,
      size,
      orderBy,
      sortBy,
    ) {
      this.accessPointLoading = true;
      try {
        const response = await this.inputservice.getAccessPointStatus(
          this.siteid,
          page,
          size,
          orderBy,
          sortBy
        );
        this.accessPointStatus = new SiteStatus().normalizeAccessPointStatus(response);
      } catch (e) {
        this.accessPointStatus = { rows: [], total: 0 };
        throw e;
      } finally {
        this.accessPointLoading = false;
      }
    },
    async getLocationBeaconStatus(
      page,
      size,
      orderBy,
      sortBy,
    ) {
      this.locationBeaconLoading = true;
      try {
        const response = await this.inputservice.getLocationBeaconStatus(
          this.siteid,
          page,
          size,
          orderBy,
          sortBy
        );
        this.locationBeaconStatus = new SiteStatus().normalizeLocationBeaconStatus(response);
      } catch (e) {
        this.locationBeaconStatus = { rows: [], total: 0 };
        throw e;
      } finally {
        this.locationBeaconLoading = false;
      }
    },
    async getTagStatus(
      page,
      size,
      orderBy,
      sortBy,
    ) {
      this.tagLoading = true;
      try {
        const response = await this.inputservice.getTagStatus(
          this.siteid,
          page,
          size,
          orderBy,
          sortBy
        );
        this.tagStatus = new SiteStatus().normalizeTagStatus(response);
      } catch (e) {
        this.tagStatus = { rows: [], total: 0 };
        throw e;
      } finally {
        this.tagLoading = false;
      }
    },
    setDeviceReportHeader() {
      const currentDateTime = new Date();
      const currentTime = currentDateTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      });
      const currentDate = currentDateTime.toLocaleDateString();
      const timeZoneRegex = /\((.*)\)/;
      const regexResult = timeZoneRegex.exec(currentDateTime.toString());
      if (regexResult && regexResult[1]) {
        const bigTimeZone = regexResult[1];
        const shortTimeZone = bigTimeZone
          .split(" ")
          .map(word => word[0])
          .join("");
        this.deviceStatusHeaderSuffix = `Generated ${currentDate} @ ${currentTime} ${shortTimeZone}`;
      }
    },
    exportUnprovisionedLocationBeaconStatus() {
      this.exportAndDownloadStatus(SiteStatusType.unprovisionedLocationBeacon);
    },
    exportUnprovisionedAccessPointStatus() {
      this.exportAndDownloadStatus(SiteStatusType.unprovisionedAccessPoint);
    },
    exportGatewayStatus() {
      this.exportAndDownloadStatus(SiteStatusType.gateway);
    },
    exportAccessPointStatus() {
      this.exportAndDownloadStatus(SiteStatusType.accessPoint);
    },
    exportLocationBeaconStatus() {
      this.exportAndDownloadStatus(SiteStatusType.locationBeacon);
    },
    exportTagStatus() {
      this.exportAndDownloadStatus(SiteStatusType.tag);
    },
    generateExportTimeString() {
      return moment(this.lastStatusFetchTime)
        .utc()
        .format("YYYY-MM-DDTHH-mm")
        .concat("Z");
    },
    generateExportData(
      tableName,
      rows,
      columns,
      time
    ) {
      const formattedTableName = tableName.split(" ").join("-");
      const fileName = `${formattedTableName}_${this.siteIdentifier}_${time}.csv`;
      const csvData = generateCSVData(rows, columns);
      return {
        fileName,
        data: csvData
      };
    },
    exportStatus(value, time) {
      let exportData = null;
      if (!time) {
        time = this.generateExportTimeString();
      }
      switch (value) {
        case SiteStatusType.summary:
          exportData = this.generateExportData(
            this.deviceStatusTitle,
            this.deviceStatus.rows,
            this.deviceStatusColumns,
            time
          );
          break;

        case SiteStatusType.unprovisionedLocationBeacon:
          exportData = this.generateExportData(
            this.unprovisionedLocationBeaconStatusTitle,
            this.unprovisionedLocationBeaconStatus.rows,
            this.unprovisionedLocationBeaconStatusColumns,
            time
          );
          break;

        case SiteStatusType.unprovisionedAccessPoint:
          exportData = this.generateExportData(
            this.unprovisionedAccessPointStatusTitle,
            this.unprovisionedAccessPointStatus.rows,
            this.unprovisionedAccessPointStatusColumns,
            time
          );
          break;

        case SiteStatusType.gateway:
          exportData = this.generateExportData(
            this.gatewayStatusTitle,
            this.gatewayStatus.rows,
            this.gatewayStatusColumns,
            time
          );
          break;

        case SiteStatusType.accessPoint:
          exportData = this.generateExportData(
            this.accessPointStatusTitle,
            this.accessPointStatus.rows,
            this.accessPointStatusColumns,
            time
          );
          break;

        case SiteStatusType.locationBeacon:
          exportData = this.generateExportData(
            this.locationBeaconStatusTitle,
            this.locationBeaconStatus.rows,
            this.locationBeaconStatusColumns,
            time
          );
          break;

        case SiteStatusType.tag:
          exportData = this.generateExportData(
            this.tagStatusTitle,
            this.tagStatus.rows,
            this.tagStatusColumns,
            time
          );
          break;

        default:
          break;
      }
      return exportData;
    },
    exportAndDownloadStatus(value) {
      const exportData = this.exportStatus(value);
      if (exportData) {
        downloadInBrowser(exportData.data, exportData.fileName);
      }
    },
    async exportAll() {
      const zip = new JSZip();
      const time = this.generateExportTimeString();

      Object.keys(SiteStatusType).forEach(status => {
        const exportData = this.exportStatus(status, time);
        if (exportData) {
          zip.file(exportData.fileName, exportData.data);
        }
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlobInBrowser(
        zipBlob,
        `Site-Status_${this.siteIdentifier}_${time}.zip`
      );
    },
    getFilteredUnprovisionedLocationBeaconStatus(
      size,
      page,
      orderBy,
      sortBy,
    ) {
      this.getUnprovisionedLocationBeaconStatus(page, size, orderBy, sortBy);
    },
    getFilteredUnprovisionedAccessPointStatus(
      size,
      page,
      orderBy,
      sortBy,
    ) {
      this.getUnprovisionedAccessPointStatus(page, size, orderBy, sortBy);
    },
    getFilteredGatewayStatus(
      size,
      page,
      orderBy,
      sortBy,
    ) {
      this.getGatewayStatus(page, size, orderBy, sortBy);
    },
    getFilteredAccessPointStatus(
      size,
      page,
      orderBy,
      sortBy,
    ) {
      this.getAccessPointStatus(page, size, orderBy, sortBy);
    },
    getFilteredLocationBeaconStatus(
      size,
      page,
      orderBy,
      sortBy,
    ) {
      this.getLocationBeaconStatus(page, size, orderBy, sortBy);
    },
    getFilteredTagStatus(
      size,
      page,
      orderBy,
      sortBy,
    ) {
      this.getTagStatus(page, size, orderBy, sortBy);
    },
    onRestartAccessPoint(ap) {
      this.inputservice.restartAccessPoint(ap);
    },
    onRestartGateway(gateway) {
      this.inputservice.restartGateway(gateway);
    }
  }
};
</script>

<style lang="scss" scoped>
.site {
  .site-status {
    .ag-header-cell,
    .ag-cell {
      font-size: 16px;
    }
  }
}
.grid {
  padding: 10px 0px;
}
.refresh-button{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0px;
  margin: 0;
}
</style>
