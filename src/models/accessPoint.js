class AccessPoint {
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
			installationPictureId: props.installationPictureId,
			locationPictureId: props.locationPictureId,
			otherPictureId: props.otherPictureId,
		};
	};
}

export default AccessPoint;