class Supertag {
    normalizeConfig = (supertagConfig) => {
        // order connectivity
        supertagConfig.connectivity.sort(function (a, b) {
            if (a.sequenceId > b.sequenceId) {
            return 1;
            }
            if (a.sequenceId < b.sequenceId) {
            return -1;
            }
            // a must be equal to b
            return 0;
      });
      // Cell protocol is also a failover, will always remain selected
      if (!supertagConfig.connectivity.find(tech => tech.networkId === 'cell_id')) {
        supertagConfig.connectivity.push({ networkId: 'cell_id', sequenceId: supertagConfig.connectivity.length + 1});
      }
      let techsList = null;
      supertagConfig.connectivity.forEach(element => {
        element['label'] = element.networkId === 'cell_id' ? 'CELL ID' : element.networkId;
        element['icon'] = element.networkId === 'gps' ? 'mdi-map-marker-radius-outline' : element.networkId === 'cell_id' ? 'mdi-antenna' : element.networkId === 'wifi' ? 'mdi-wifi' : '';
        techsList = techsList ? techsList + ', ' + element['label'].toUpperCase() : element['label'].toUpperCase();
      });
      supertagConfig['techsList'] = techsList;
      return supertagConfig;
    };

    normalizeCurrentData = (currentData) => {
      let currentMappedData = [];
      let currentHighlightData = [];
      let connectivityOrder = [];
      let majorVersion, minorVersion, tagVersion, lat, latName, long, longName, batConsumed, batCapacity;
      majorVersion = minorVersion = tagVersion = lat = latName = long = longName = batConsumed = batCapacity;
      const findSpec = currentData.find((item) => item.fieldKey === 'msgSpecVersion');
      if (findSpec.value === '02') {
        currentData.map(item => {
          switch (item.fieldKey) {
            case 'fwVersionMajor':
              majorVersion = item.value;
              break;
            case 'fwVersionMinor':
              minorVersion = item.value;
              break;
            case 'fwVersionTag':
              tagVersion = item.value;
              break;
            case 'latitude':
              lat = this.roundToDecimal(parseFloat(item.value), 4);
              latName = item.title;
              break;
            case 'longitude':
              long = this.roundToDecimal(parseFloat(item.value), 4);
              longName = item.title;
              break;
            case 'cellOrder':
              if(!currentMappedData.find(item => item.fieldKey === 'outdoorLocationOrder')){
                this.addOutdoorOrder(currentMappedData);
              }
              connectivityOrder.push({'value': 'CELL ID', 'sequenceId': parseInt(item.value), fieldKey: item.fieldKey});
              break;
            case 'gpsOrder':
              if(!currentMappedData.find(item => item.fieldKey === 'outdoorLocationOrder')){
                this.addOutdoorOrder(currentMappedData);
              }
              connectivityOrder.push({'value': 'GPS', 'sequenceId':parseInt(item.value), fieldKey: item.fieldKey});
              break;
            case 'wifiOrder':
              if(!currentMappedData.find(item => item.fieldKey === 'outdoorLocationOrder')){
                this.addOutdoorOrder(currentMappedData);
              }
              connectivityOrder.push({'value': 'WIFI', 'sequenceId': parseInt(item.value), fieldKey: item.fieldKey});
              break;
            case 'accelerometerEnable':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': item.value === "true" ? 'ON' : 'OFF'
              })
              break;
  
            case 'app_tok':
            case 'cellRsrp':
            case 'cellRsrq':
            case 'deviceType':
            case 'hwId':
            case 'imei':
            case 'networkToken':
            case 'noSymMessagesCached':
            case 'siteId':
            case 'siteName':
            case 'virtualAccessPoint':
            case 'macAddress':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': item.value
              })
              break;
            case 'msgSpecVersion':
              currentHighlightData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': item.value.replace(/^0+/, '')
              })
              break;
            case 'lastMsgType':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': item.value.replace(/^0x0+/, '')
              })
              break;
            //time
            case 'lastEventTime':
              currentHighlightData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': this.normalizeTime(item.value),
                'type': 'date'
              })
              break;
            case 'lastProvisioned':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': this.normalizeTime(item.value),
                'type': 'date'
              })
              break;
            case 'latitude_time':
              currentMappedData.push({
                'title': 'Lat/Long Time',
                'fieldKey': item.fieldKey,
                'value': this.normalizeTime(item.value),
                'type': 'date'
              })
              break;
            case 'batteryCapacity_mAh':
              batCapacity = item.value;
              currentMappedData.push({
                'title': 'Battery Capacity (Nominal)',
                'fieldKey': item.fieldKey,
                'value': this.roundToDecimal(parseInt(item.value) * 0.75, 0) + ' ' + item.unit
              })
              break;
            case 'batteryConsumed_mAh':
              batConsumed = item.value;
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': this.roundToDecimal(parseInt(item.value), 0) + ' ' + item.unit
              })
              break;
            case 'cachedMessagesEnable':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': item.value === "true" ? 'YES' : 'NO'
              })
              break;
            case 'celsius':
            case 'fahrenheit':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': parseFloat(item.value).toFixed(2) + ' ' + item.unit
              })
              break;
            case 'noApLocationUpdateRate':
            case 'noApHeartbeatInterval':
            case 'noSymLocationUpdateRate':
            case 'noSymHeartbeatInterval':
            case 'networkScanInterval':
            case 'networkLostTimeout':
            case 'heartbeatInterval':
            case 'gpsTimeout':
              currentMappedData.push({'title': item.title, 'fieldKey': item.fieldKey, 'value': this.convertTime(item.value)});
              break;
  
            default:
              break;
          }
          return null;
        });
      } else {
        currentData.map(item => {
          switch (item.fieldKey) {
            case 'fwVersionMajor':
              majorVersion = item.value;
              break;
            case 'fwVersionMinor':
              minorVersion = item.value;
              break;
            case 'fwVersionTag':
              tagVersion = item.value;
              break;
            case 'latitude':
              lat = this.roundToDecimal(parseFloat(item.value), 4);
              latName = item.title;
              break;
            case 'longitude':
              long = this.roundToDecimal(parseFloat(item.value), 4);
              longName = item.title;
              break;
            case 'cellOrder':
              if(!currentMappedData.find(item => item.fieldKey === 'outdoorLocationOrder')){
                this.addOutdoorOrder(currentMappedData);
              }
              connectivityOrder.push({'value': 'CELL ID', 'sequenceId': parseInt(item.value), fieldKey: item.fieldKey});
              break;
            case 'gpsOrder':
              if(!currentMappedData.find(item => item.fieldKey === 'outdoorLocationOrder')){
                this.addOutdoorOrder(currentMappedData);
              }
              connectivityOrder.push({'value': 'GPS', 'sequenceId':parseInt(item.value), fieldKey: item.fieldKey});
              break;
            case 'wifiOrder':
              if(!currentMappedData.find(item => item.fieldKey === 'outdoorLocationOrder')){
                this.addOutdoorOrder(currentMappedData);
              }
              connectivityOrder.push({'value': 'WIFI', 'sequenceId': parseInt(item.value), fieldKey: item.fieldKey});
              break;
            case 'accelerometerEnable':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': item.value === "true" ? 'ON' : 'OFF'
              })
              break;

            case 'app_tok':
            case 'cellRsrp':
            case 'cellRsrq':
            case 'deviceType':
            case 'hwId':
            case 'imei':
            case 'networkToken':
            case 'siteId':
            case 'siteName':
            case 'virtualAccessPoint':
            case 'macAddress':
            case 'maxMessagesCached':
            case 'networkLostMaxCount':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': item.value
              })
              break;
            case 'msgSpecVersion':
              currentHighlightData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': item.value.replace(/^0+/, '')
              })
              break;
            case 'lastMsgType':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': item.value.replace(/^0x0+/, '')
              })
              break;
            //time
            case 'lastEventTime':
              currentHighlightData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': this.normalizeTime(item.value),
                'type': 'date'
              })
              break;
            case 'lastProvisioned':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': this.normalizeTime(item.value),
                'type': 'date'
              })
              break;
            case 'latitude_time':
              currentMappedData.push({
                'title': 'Lat/Long Time',
                'fieldKey': item.fieldKey,
                'value': this.normalizeTime(item.value),
                'type': 'date'
              })
              break;
            case 'batteryCapacity_mAh':
              batCapacity = item.value;
              currentMappedData.push({
                'title': 'Battery Capacity (Nominal)',
                'fieldKey': item.fieldKey,
                'value': this.roundToDecimal(parseInt(item.value) * 0.75, 0) + ' ' + item.unit
              })
              break;
            case 'batteryConsumed_mAh':
              batConsumed = item.value;
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': this.roundToDecimal(parseInt(item.value), 0) + ' ' + item.unit
              })
              break;
            case 'cachedMessagesEnable':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': item.value === "true" ? 'YES' : 'NO'
              })
              break;
            case 'celsius':
            case 'fahrenheit':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': parseFloat(item.value).toFixed(2) + ' ' + item.unit
              })
              break;

            case 'gpsTimeout':
            case 'noSymHeartbeatInterval':
            case 'noSymLocationUpdateRate':
            case 'lbModeHeartbeatInterval':
            case 'lbModeLocUpdateRate_Moving':
            case 'stModeHeartbeatInterval':
            case 'stModeLocUpdateRate_Moving':
            case 'PRO_0_symModeHeartbeatInterval':
            case 'PRO_0_networkScanInterval_Moving':
              currentMappedData.push({'title': item.title, 'fieldKey': item.fieldKey, 'value': this.convertTime(item.value)});
              break;
            case 'PRO_0_accelerometerEnable':
              currentMappedData.push({
                'title': item.title,
                'fieldKey': item.fieldKey,
                'value': item.value === "true" ? 'YES' : 'NO'
              })
              break;

            default:
              break;
          }
          return null;
        });
      }

      let order = currentMappedData.find(item => item.fieldKey === 'outdoorLocationOrder');
      if(order){
        order.value = this.orderConnectivity(connectivityOrder);
      }

      if (lat && long && latName && longName) {
        currentMappedData.splice(14, 0, {
          'title': latName + '/' + longName,
          'fieldKey': 'latLong',
          'value': lat + ', ' + long
        });
      }
      
      if(batConsumed && batCapacity){
        let percentage = Math.round((((batCapacity * 0.75) - batConsumed )*100) / (batCapacity * 0.75));
        currentHighlightData.push({
          'title': 'Battery Remaining',
          'fieldKey': 'batteryRemaining',
          'value': percentage + "% " + "(" + Math.round((batCapacity - batConsumed)) + "mAh)"
        });
      }

      currentHighlightData.push({
        'title': 'Firmware version',
        'fieldKey': 'firmwareVersion',
        'value': majorVersion + '.' + minorVersion + '.' + tagVersion
      });

      
      return {'items': currentMappedData, 'highlightItems': currentHighlightData};
    }

    convertTime = (value) =>{
      let display;
      if (value < 60) {
        display = value + ' sec';
      } else if (value < 60 * 60) {
        value = this.roundToDecimal(value / 60, 2);
        display = value + ' min';
      } else {
        value = this.roundToDecimal(value / 60 / 60, 2);
        display = value + ' hr';
      }
      return (value > 1) ? display + 's' : display;
    }

    roundToDecimal = (value, decimal = 0) => {
      const multiplier = Math.pow(10, decimal);
      return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
    }

    normalizeTime = (dateTime) => {
      if (typeof (dateTime) === 'string') {
        // api does not return TZ, everything is in UTC
        if(!dateTime.includes('Z')){
          dateTime = dateTime.concat('Z');
        }
        return dateTime;
      }
      return null;
    }

    addOutdoorOrder = (currentMappedData) => {
      currentMappedData.push({
        'title': 'Outdoor location order',
        'fieldKey': 'outdoorLocationOrder',
        'value': null
      });
    }

    orderConnectivity = (connectivities) => {
      const skipped = connectivities.filter(item => item.sequenceId === 0); //skip these items for ordering
      let forOrdering = connectivities.filter(item => item.sequenceId !== 0);
      forOrdering.sort(function (a, b) {
        if (a.sequenceId > b.sequenceId) {
        return 1;
        }
        if (a.sequenceId < b.sequenceId) {
        return -1;
        }
        // a must be equal to b
        return 0;
      });
      
      forOrdering = forOrdering.concat(skipped.filter(item => item.fieldKey === "cellLocationOrder")); //just order equal 0 and fieldKey equal CELL ID goes to last

      const orderDisplayString = forOrdering.map(n=>n.value).join(', ');

      return orderDisplayString || 'None';
    }
  }
  
export default Supertag;