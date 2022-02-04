import { supertagTok } from '../constants/supertag'

class Tag {
  normalize = (tagData) => {
    const data = tagData.assetInfo.metadata.props

    data.lastEventTime = this.normalizeTime(data.lastEventTime);
    const latitudeTime = this.normalizeTime(data.latitude_time);
    const locationTime = this.normalizeTime(data.locationTime);

    //supertag converted in indoor tag => remove lat and long in order to not show it on the map with an old location
    if(supertagTok.includes(data.app_tok) && data.latitude && data.longitude && (locationTime > latitudeTime)){
      data.latitude = null;
      data.longitude = null;
    }

    let location = {};
    const mt = +data.lastMsgType;
    if (data.isHelp && mt === 3) {
      location = { macAddress: data.location0 }
    } else if (!data.isHelp) {
      location = { macAddress: data.location0 }
    }
    let notSeenInDays = null;
    if (data.lastEventTime) {
      let tagDate = new Date(data.lastEventTime);
      notSeenInDays = Math.round((new Date().getTime() - tagDate.getTime()) / (1000 * 3600 * 24));
    }
    return {
      id: tagData.nodeAddress,
      href: tagData.self.href,
      account: { id: data.accountId },
      appTok: tagData.registrationToken,
      site: { id: data.siteId },
      category: { id: data.categoryId },
      group: data.groupId_0 && {
        id: data.groupId_0
      },
      macAddress: data.macAddress,
      name: data.description,
      area: { id: data.areaId },
      areaName: data.areaName,
      lastMsgType: parseInt(data.lastMsgType),
      location,
      locationName: data.locationName,
      location0: data.location0,
      zoneName: data.zoneName,
      categoryName: data.categoryName,
      groupName: data.groupName,
      field1: data.field1,
      field2: data.field2,
      battery: data.batteryStatus,
      batteryStatus: (data.batteryCapacity_mAh || data.batteryConsumed_mAh || data.batteryVoltage) ? parseInt(data.batteryStatus) : null,
      lastEventTime: data.lastEventTime ? data.lastEventTime : null,
      notSeenInDays: notSeenInDays,
      latitude:
        data.latitude &&
        +data.latitude,
      longitude:
        data.longitude &&
        +data.longitude,
      registrationToken: tagData.registrationToken,
      source: data.positionSource || 'gps',
      positionName: data.positionName,
      isLost: data.isLost !== 'false',
      locationTime,
      latitudeTime,
      showPlayBtn: false,
      xCoordinate: data.xCoordinate,
      yCoordinate: data.yCoordinate,
      zCoordinate: data.zCoordinate,
      xConfidence: data.xConfidence,
      yConfidence: data.yConfidence,
      zConfidence: data.zConfidence,
      lastAf3EventTime: data.t_ingest ? new Date(parseInt(data.t_ingest)) : null
    };
  }

  normalizeForCsv = (data, columns) => {
    let obj = {};
    obj[columns.find(obj => obj.field === 'name').name] = data.name;
    obj['Mac Address'] = data.macAddress,
    obj['Area'] = data.areaName;
    obj['Zone'] =  data.zoneName;
    obj['Location Name'] = data.locationName;
    obj['Location'] = data.location0;
    obj['Latitude'] = data.latitude;
    obj['Longitude'] = data.longitude;
    obj[columns.find(obj => obj.field === 'categoryName').name] = data.categoryName;
    obj[columns.find(obj => obj.field === 'groupName').name] = data.groupName;
    obj[columns.find(obj => obj.field === 'field1').name] =  data.field1;
    obj[columns.find(obj => obj.field === 'field2').name] =  data.field2;
    let auxDate = new Date(data.lastEventTime);
    auxDate = ('0' + (auxDate.getMonth()+1)).slice(-2) + '/' + ('0' + auxDate.getDate()).slice(-2) + '/' + auxDate.getFullYear() + ' ' + ('0' + auxDate.getUTCHours()).slice(-2) + ':' + ('0' + auxDate.getUTCMinutes()).slice(-2) + ':' + ('0' + auxDate.getUTCSeconds()).slice(-2);
    obj['Last Seen'] = data.lastEventTime ? auxDate : '';
    return obj;
  }

  normalizeHistory = history => {
    let d = history.time;
    if (typeof (d) === 'string') {
      d = d.concat('Z')
    }
    return {
      latitude: history.latitude
        ? +history.latitude
        : undefined,
      longitude: history.longitude
        ? +history.longitude
        : undefined,
      id: history.uuid,
      time: new Date(d),
      etype: history.positionSource || 'gps'
    };
  };

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

}

export default Tag;