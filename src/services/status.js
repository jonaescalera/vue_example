import axiosHelper from '../utils/axios';

export default (() => {
  const networkAssetPathV2 = "networkAsset/airfinder/v2";
  const statusPath = `${networkAssetPathV2}/status`;
  const sitePath = 'networkAsset/airfinder/site/';

  async function getNetworkConnectionStatus(siteId) {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${statusPath}?siteId=${siteId}`);
    return response.data;
  }

  async function getDeviceStatus(siteId) {
    const url = statusPath.concat("?siteId=", siteId);

    const r = await axiosHelper
      .getNetworkAsset()
      .get(url);

    const totalRecordsHeader = r.headers["total_records"];
    const totalRows = totalRecordsHeader ? Number(totalRecordsHeader) : 0;
    const data = r.data;

    return { rows: data, total: totalRows };
  }

  async function getDevicesCount(siteId) {
    const url = networkAssetPathV2.concat("/count?siteId=", siteId);

    const response = await axiosHelper
      .getNetworkAsset()
      .get(url);

    return response.data;
  }

  async function getUnprovisionedLocationBeaconStatus(
    siteId,
    page,
    size,
    orderBy,
    sortBy
  ) {
    const url = networkAssetPathV2.concat(
      "/locations/unprovisioned?siteId=",
      siteId,
      "&page=",
      page.toString(),
      "&size=",
      size ? size.toString() : "",
      "&orderBy=",
      orderBy,
      "&sortBy=",
      sortBy
    );

    const r = await axiosHelper
      .getNetworkAsset()
      .get(url);

    const totalRecordsHeader = r.headers["total_records"];
    const totalRows = totalRecordsHeader ? Number(totalRecordsHeader) : 0;
    const data = r.data;

    return { rows: data, total: totalRows };
  }

  async function getUnprovisionedAccessPointStatus(
    siteId,
    page,
    size,
    orderBy,
    sortBy
  ) {
    const url = networkAssetPathV2.concat(
      "/accessPoints/unprovisioned?siteId=",
      siteId,
      "&page=",
      page.toString(),
      "&size=",
      size ? size.toString() : "",
      "&orderBy=",
      orderBy,
      "&sortBy=",
      sortBy
    );

    const r = await axiosHelper
      .getNetworkAsset()
      .get(url);

    const totalRecordsHeader = r.headers["total_records"];
    const totalRows = totalRecordsHeader ? Number(totalRecordsHeader) : 0;
    const data = r.data;

    return { rows: data, total: totalRows };
  }

  async function getGatewayStatus(
    siteId,
    page,
    size,
    orderBy,
    sortBy
  ) {
    const url = statusPath.concat(
      "/gateways?",
      generateParamsString(
        siteId,
        page,
        size,
        orderBy,
        sortBy,
      ),
    );

    const r = await axiosHelper
      .getNetworkAsset()
      .get(url);
      const totalRecordsHeader = r.headers["total_records"];
      const totalRows = totalRecordsHeader ? Number(totalRecordsHeader) : 0;
      const data = r.data.map(row => {
        row.properties.nameSearchField = row.properties.name? row.properties.name.toLowerCase() : '';
        row.properties.nodeSearchField = row.properties.macAddress? row.properties.macAddress.replaceAll('-', '').toLowerCase():'';
      return row;
    });

    return { rows: data, total: totalRows };
  }

  async function getAccessPointStatus(
    siteId,
    page,
    size,
    orderBy,
    sortBy
  ) {
    const url = statusPath.concat(
      "/accessPoints?",
      generateParamsString(
        siteId,
        page,
        size,
        orderBy,
        sortBy,
      ),
    );

    const r = await axiosHelper
      .getNetworkAsset()
      .get(url);

    const totalRecordsHeader = r.headers["total_records"];
    const totalRows = totalRecordsHeader ? Number(totalRecordsHeader) : 0;
    const data = r.data.map(row => {
      row.properties.nameSearchField = row.properties.name? row.properties.name.toLowerCase() : '';
        row.properties.nodeSearchField = row.properties.macAddress? row.properties.macAddress.replaceAll('-', '').toLowerCase():'';
      return row;
    });

    return { rows: data, total: totalRows };
  }

  async function getLocationBeaconStatus(
    siteId,
    page,
    size,
    orderBy,
    sortBy
  ) {
    const url = statusPath.concat(
      "/locations?",
      generateParamsString(
        siteId,
        page,
        size,
        orderBy,
        sortBy,
      ),
    );

    const r = await axiosHelper
      .getNetworkAsset()
      .get(url);

    const totalRecordsHeader = r.headers["total_records"];
    const totalRows = totalRecordsHeader ? Number(totalRecordsHeader) : 0;
    const data = r.data.map(row => {
      row.properties.nameSearchField = row.properties.name? row.properties.name.toLowerCase() : '';
      row.properties.nodeSearchField = row.properties.macAddress? row.properties.macAddress.replaceAll('-', '').toLowerCase():'';
      return row;
    });

    return { rows: data, total: totalRows };
  }

  async function getTagStatus(
    siteId,
    page,
    size,
    orderBy,
    sortBy
  ) {
    const url = statusPath.concat(
      "/tags?",
      generateParamsString(
        siteId,
        page,
        size,
        orderBy,
        sortBy,
      ),
    );

    const r = await axiosHelper
      .getNetworkAsset()
      .get(url);

    const totalRecordsHeader = r.headers["total_records"];
    const totalRows = totalRecordsHeader ? Number(totalRecordsHeader) : 0;
    const data = r.data.map(row => {
      row.properties.nameSearchField = row.properties.name? row.properties.name.toLowerCase() : '';
      row.properties.nodeSearchField = row.properties.macAddress? row.properties.macAddress.replaceAll('-', '').toLowerCase():'';
      return row;
    });

    return { rows: data, total: totalRows };
  }

  async function getSiteInfo(siteId) {
    const url = sitePath.concat(siteId);

    const r = await axiosHelper
      .getNetworkAsset()
      .get(url);

    return r.data;
  }

  function generateParamsString(
    siteId,
    page,
    size,
    orderBy,
    sortBy,
  ) {
    let params = 'siteId='.concat(siteId);
    if (page) {
      params = params.concat("&page=", page.toString());
    }
    if (size) {
      params = params.concat("&size=", size.toString());
    }
    if (orderBy) {
      params = params.concat("&orderBy=", orderBy);
    }
    if (sortBy) {
      params = params.concat("&sortBy=", sortBy);
    }
    return params;
  }

  async function restartDevice(deviceType, nodeAddress) {
    const payload = {
      nodeAddress: nodeAddress,
      nodeType: deviceType
    }
    const response = await axiosHelper.getClientEdge().post('/v2/restartCommand',payload);
    return response;
  }

  return {
    getNetworkConnectionStatus,
    getSiteInfo,
    getDeviceStatus,
    getDevicesCount,
    restartDevice,
    getUnprovisionedLocationBeaconStatus,
    getUnprovisionedAccessPointStatus,
    getGatewayStatus,
    getAccessPointStatus,
    getLocationBeaconStatus,
    getTagStatus,
  };
})();
