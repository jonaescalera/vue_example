class Location {
	normalize = data => {
		let props = data.assetInfo.metadata.props;
		const nodeName = data.nodeName;
		return {
			id: data.nodeAddress,
			areaId: props.areaId,
			areaName: props.areaName,
			siteId: props.siteId,
			siteName: props.siteName,
			value: props.name ? props.name : nodeName,
			name: data.nodeName,
			macAddress: props.macAddress,
			point: props.mapPoint ? props.mapPoint.split(',').map(Number) : [],
			checked: false,
			zoneId: props.zoneId,
			zoneName: props.zoneName,
			lastProvisioned: props.lastProvisioned,
			unprovisionedTime: props.unprovisionedTime,
			installedLatitude: props.installedLatitude ? props.installedLatitude : null,
			installedLongitude: props.installedLongitude ? props.installedLongitude : null,
			installationPictureId: props.installationPictureId,
			locationPictureId: props.locationPictureId,
			otherPictureId: props.otherPictureId,
			lastAf3EventTime: props.t_ingest ? new Date(parseInt(props.t_ingest)) : null,
			latitude: props.latitude && +props.latitude,
			longitude: props.longitude && +props.longitude,
			xCoordinate: props.xCoordinate,
			yCoordinate: props.yCoordinate,
			zCoordinate: props.zCoordinate
		};
	};
}

export default Location;