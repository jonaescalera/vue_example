class Area {
  normalizeInfo = (areaData) => {
		const data = areaData.assetInfo.metadata.props    		
    return {
      name: data.name,
      areaLocation: data.areaLocation && data.areaLocation.toLowerCase(),
      zoneCount: data.zoneCount,
			locationCount: data.locationCount,
			indoorMapping: data.indoorMapping,
			id: areaData.id, 
			site: areaData.site,
			polygon: data.polygon
    };
  }

	normalizeFile = payload => {
		let nwCorner = (((((payload || {}).assetInfo || {}).metadata || {}).props || {}).nwCorner || '').split(',');
		let seCorner = (((((payload || {}).assetInfo || {}).metadata || {}).props || {}).seCorner || '').split(',');
		return {
			id: payload.id,
			name: payload.name,
			account: payload.account && {
				id: /\/([^/]*)$/i.exec(payload.account.href)[1],
				href: payload.account.href
			},
			file: {
				href: payload.self.href,
				imgData: payload.data ? `data:image/png;base64,${payload.data}` : ''
			},
			nwCorner: {
				lat: +nwCorner[1],
				lng: +nwCorner[0]
			},
			seCorner: {
				lat: +seCorner[1],
				lng: +seCorner[0]
			}
		};
	};

}

export default Area;
