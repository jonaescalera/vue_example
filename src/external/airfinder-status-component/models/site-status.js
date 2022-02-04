import { convertToTitleCase } from "../utils/case-conversion";

class SiteStatus {
  normalizeDeviceStatus = (input) => {
    const total = input.total;
    const rows = input.rows.map((deviceStatus) => {
      // Convert assetType string to title case, ex. ACCESS_POINT to Access Point
      let assetType = convertToTitleCase(deviceStatus.assetType);
      if (assetType && assetType.indexOf("_") !== -1) {
        assetType = assetType.split("_").join(" ");
      }
  
      let redAssets = '';
      let greenAssets = '';
      let grayAssets = '';
  
      if (assetType === 'Tag') {
        redAssets = greenAssets = grayAssets = '-';
      } else {
        // Calculate percentage of RED, GREEN and GRAY devices
        const totalAssets = deviceStatus.totalCount;
        const redCount = deviceStatus.healthStatusCount.RED;
        const redPercentage = totalAssets
          ? Math.round((redCount / totalAssets) * 100)
          : 0;
        redAssets = `${redCount} (${redPercentage}%)`;
  
        const greenCount = deviceStatus.healthStatusCount.GREEN;
        const greenPercentage = totalAssets
          ? Math.round((greenCount / totalAssets) * 100)
          : 0;
        greenAssets = `${greenCount} (${greenPercentage}%)`;
  
        const grayCount = deviceStatus.healthStatusCount.GRAY;
        const grayPercentage = totalAssets
          ? Math.round((grayCount / totalAssets) * 100)
          : 0;
          grayAssets = `${grayCount} (${grayPercentage}%)`;
      }
  
      return {
        ...deviceStatus,
        assetType,
        healthStatusCount: {
          ...deviceStatus.healthStatusCount,
          redAssets,
          greenAssets,
          grayAssets
        }
      };
    });

    return {
      rows,
      total,
    };
  }

  normalizeUnprovisionedLocationBeaconStatus = (input) => {
    const total = input.total;
    const rows = input.rows.map((locationBeacon) => {
      locationBeacon.highlight = locationBeacon.maxRssi > -26 ? "blue" : "";
      if (locationBeacon.maxRssi) {
        locationBeacon.maxRssi = `${locationBeacon.maxRssi} dBm`;
      }
      if (locationBeacon.averageRssi) {
        locationBeacon.averageRssi = `${locationBeacon.averageRssi} dBm`;
      }
      return locationBeacon;
    });

    return {
      rows,
      total,
    };
  }

  normalizeUnprovisionedAccessPointStatus = (input) => {
    const total = input.total;
    const rows = input.rows.map((accessPoint) => {
      accessPoint.highlight = accessPoint.maxRssi > -26 ? "blue" : "";
      if (accessPoint.maxRssi) {
        accessPoint.maxRssi = `${accessPoint.maxRssi} dBm`;
      }
      if (accessPoint.averageRssi) {
        accessPoint.averageRssi = `${accessPoint.averageRssi} dBm`;
      }
      return accessPoint;
    });

    return {
      rows,
      total,
    };
  }

  normalizeGatewayStatus = (input) => {
    const total = input.total;
    const rows = input.rows.map((gateway) => {
      const properties = gateway.properties;
      if (properties) {
        if (properties.health) {
          properties.health = convertToTitleCase(
            properties.health
          );
        }
        gateway.highlight = parseHealth(properties.health);
      }
      return gateway;
    });

    return {
      rows,
      total,
    };
  }

  normalizeAccessPointStatus = (input) => {
    const total = input.total;
    const rows = input.rows.map((accessPoint) => {
      const properties = accessPoint.properties;
      if (properties) {
        if (properties.health) {
          properties.health = convertToTitleCase(
            properties.health
          );
        }
        accessPoint.highlight = parseHealth(properties.health);
      }
      return accessPoint;
    });

    return {
      rows,
      total,
    };
  }

  normalizeLocationBeaconStatus = (input) => {
    const total = input.total;
    const rows = input.rows.map((locationBeacon) => {
      const properties = locationBeacon.properties;
      if (properties) {
        if (properties.health) {
          properties.health = convertToTitleCase(properties.health);
        }
        locationBeacon.highlight = parseHealth(properties.health);
      }
      return locationBeacon;
    });

    return {
      rows,
      total,
    };
  }

  normalizeTagStatus = (input) => {
    const total = input.total;
    const rows = input.rows.map((tag) => {
      const properties = tag.properties;
      if (properties) {
        if (properties.health) {
          properties.health = convertToTitleCase(properties.health);
        }
      }
      return tag;
    });

    return {
      rows,
      total,
    };
  }
}

function parseHealth(inputHealth) {
  switch(inputHealth.toLowerCase()) {
    case "red":
      return "red";

    case "green":
      return "green";

    case "gray":
      return "gray";

    default:
      return ""
  }
}

export default SiteStatus;