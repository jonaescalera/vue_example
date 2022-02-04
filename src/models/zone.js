class Zone {
  normalize = data => {
    let props = data.assetInfo.metadata.props;
    return {
      id: data.id,
      value: props.name,
      name: data.value,
      site: { id: props.siteId },
      area: { id: props.areaId },
      locationCount: +props.locationCount,
      polygon: props.points
        ? props.points
          .split(';')
          .map(point => point.split(',').map(n => +n))
        : []
    };
  };
}

export default Zone;