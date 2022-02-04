import moment from 'moment';
import { timeSince, daysDifference } from '../utils/time';

export const DeviceColumns = [
  { headerName: "Device Type", field: "assetType" },
  { headerName: "Total", field: "totalCount" },
  {
    headerName: "Red",
    field: "healthStatusCount.redAssets",
    comparator: (a, b) => {
      return a.localeCompare(b, "en-US", {
        numeric: true,
        sensitivity: "base"
      });
    }
  },
  {
    headerName: "Green",
    field: "healthStatusCount.greenAssets",
    comparator: (a, b) => {
      return a.localeCompare(b, "en-US", {
        numeric: true,
        sensitivity: "base"
      });
    }
  },
  {
    headerName: "Gray",
    field: "healthStatusCount.grayAssets",
    comparator: (a, b) => {
      return a.localeCompare(b, "en-US", {
        numeric: true,
        sensitivity: "base"
      });
    }
  },
];

export const UnprovisionedLocationBeaconColumns = [
  { headerName: "LB Mac Address", field: "lbMacAddress" },
  { headerName: "AP Name", field: "apName" },
  { headerName: "AP Mac Address", field: "apMacAddress" },
  {
    headerName: "Last Seen",
    valueFormatter: timeValueFormattor,
    exportValueFormatter: timeExportValueFormattor,
    field: "lbLastSeenTime"
  },
  { headerName: "Max RSSI", field: "maxRssi" },
  { headerName: "Avg RSSI", field: "averageRssi" },
];

export const UnprovisionedAccessPointColumns = [
  { headerName: "AP Mac Address", field: "apMacAddress" },
  { headerName: "LB Name", field: "lbName" },
  { headerName: "LB Mac Address", field: "lbMacAddress" },
  {
    headerName: "Last Seen",
    valueFormatter: timeValueFormattor,
    exportValueFormatter: timeExportValueFormattor,
    field: "apLastSeenTime"
  },
  { headerName: "Max RSSI", field: "maxRssi" },
  { headerName: "Avg RSSI", field: "averageRssi" },
];

export const GatewayColumns = [
  { headerName: "Status", field: "properties.health" },
  { headerName: "Label", field: "properties.name" },
  { headerName: "Device ID", field: "properties.macAddress" },
  {
    headerName: "Last Message",
    field: "properties.lastMessage",
    valueFormatter: timeValueFormattor,
    exportValueFormatter: timeExportValueFormattor
  },
  {
    headerName: "Avg RSRP",
    field: "properties.averageRsrpValue"
  },
  {
    headerName: "Avg RSRQ",
    field: "properties.averageRsrqValue"
  },
  {
    headerName: "Avg RSSI",
    field: "properties.averageRssiValue"
  },
];

export const AccessPointColumns = [
  { headerName: "Status", field: "properties.health" },
  { headerName: "Label", field: "properties.name" },
  { headerName: "Device ID", field: "properties.macAddress" },
  {
    headerName: "Last Hearbeat",
    valueFormatter: timeValueFormattor,
    exportValueFormatter: timeExportValueFormattor,
    field: "properties.lastHeartbeat"
  },
  {
    headerName: "Last RSSI",
    field: "properties.lastRssiValue"
  },
  {
    headerName: "Avg RSSI",
    field: "properties.averageRssiValue"
  },
];

export const LocationBeaconColumns = [
  { headerName: "Status", field: "properties.health" },
  { headerName: "Label", field: "properties.name" },
  { headerName: "Device ID", field: "properties.macAddress" },
  {
    headerName: "Last Hearbeat",
    field: "properties.lastHeartbeat",
    valueFormatter: timeValueFormattor,
    exportValueFormatter: timeExportValueFormattor
  },
  {
    headerName: "Last RSSI",
    field: "properties.lastRssiValue"
  },
  {
    headerName: "Avg RSSI",
    field: "properties.averageRssiValue"
  },
];

export const TagColumns = [
  { headerName: "Label", field: "properties.name" },
  { headerName: "Device ID", field: "properties.macAddress" },
  { headerName: "Battery Voltage", field: "properties.batteryVoltage" },
  {
    headerName: "Last Message",
    field: "properties.lastEventTime",
    valueFormatter: timeValueFormattor,
    exportValueFormatter: timeExportValueFormattor
  },
];

function timeValueFormattor(param) {
  /// format: <hour>:<minute> <PM/AM> on mm/dd/yyyy
  if (param) {
    let apiDateTimeValue = param;
    apiDateTimeValue = moment.utc(param);

    if (daysDifference(apiDateTimeValue) < 7) {
      return timeSince(apiDateTimeValue);
    }
    return apiDateTimeValue.local().format("MM/DD/YYYY hh:mm:ss A");
  }
  return null;
}

function timeExportValueFormattor(param) {
  if (param) {
    return moment.utc(param).local().format("MM/DD/YYYY HH:mm:ss");
  }
  return null;
}

export const SiteStatusType = Object.freeze({
  summary: "summary",
  unprovisionedLocationBeacon: "unprovisionedLocationBeacon",
  unprovisionedAccessPoint: "unprovisionedAccessPoint",
  gateway: "gateway",
  accessPoint: "accessPoint",
  locationBeacon: "locationBeacon",
  tag: "tag",
});

export const firstPage = 1;
export const defaultPerPage = 25;
export const defaultSortBy = "lastHeartbeat";
export const defaultSortDirection = "ASC";

export const defaultGatewaySortBy = "lastMessage";
export const defaultGatewaySortDirection = "ASC";

export const defaultTagSortBy = "lastEventTime";
export const defaultTagDirection = "DSC";

export const defaultUnprovisionedSortBy = "lastSeenTime";
export const defaultUnprovisionedSortDirection = "DSC";

