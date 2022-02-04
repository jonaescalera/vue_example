export const LOCATION_TYPES = {
  INDOOR: 'indoor',
  OUTDOOR: 'outdoor'
};

export const LOCATION_OPTIONS = {
  Indoor: {
    value: LOCATION_TYPES.INDOOR,
    label: 'models.area.indoor'
  },
  Outdoor: {
    value: LOCATION_TYPES.OUTDOOR,
    label: 'models.area.outdoor'
  }
};

export const GEO_REFERENCE_TYPES = {
  YES: 'true',
  NO: 'false'
};

export const GEO_REFERENCE_OPTIONS = {
  true: {
    value: GEO_REFERENCE_TYPES.YES,
    label: 'models.area.isGeoReferenced'
  },
  false: {
    value: GEO_REFERENCE_TYPES.NO,
    label: 'models.area.isNonGeoReferenced'
  }
};

export const BOUND_COORDINATES = {
  WEST: -0.08,
  EAST: 0.08,
  NORTH: 0.04,
  SOUTH: -0.04
};