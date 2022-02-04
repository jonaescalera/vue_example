import bbox from '@turf/bbox';
import * as turf from '@turf/helpers';
import length from '@turf/length';
import { addKmToLong, addKmToLat } from './calculateLatLng';
import i18n from '../i18n';

const FEET = 3.28084;
const YARD = 1.09361;

/**
  Convert a list into a JS object
  @function listToMap
  @param {List} list List to convert into a map
  @param {String} propName Property to use as key
  @returns {Object}
*/
function listToMap(list, propName = 'id') {
	return list.reduce(
		(map, item) => ({
			...map,
			[item[propName].toLowerCase()]: item
		}),
		{}
	);
};

/**
  Populate a property by obtaining the value from a map
  @function populateFromMap
  @param {List} list List of objects to populate
  @param {String} propertyName Property to populate
  @param {Object} mapByList Map of objects to use to populate
  @param {String} idPropName Property name to match as the key
  @returns {List}
*/
function populateFromMap(
	list,
	propertyName,
	mapByList,
	idPropName = 'id'
) {
	return list.map(item => {
		let value = item[propertyName];
		let propValue =
			value && value[idPropName] && value[idPropName].toLowerCase();
		if (propValue && propValue in mapByList) {
			item[propertyName] = mapByList[propValue]
		}
		return item;
	});
};

function fitPolygon(map, polygon) {
	map.fitBounds(
		bbox({
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: [polygon],
			},
		}),
		{ linear: true, padding: { top: 25, bottom: 25, right: 25, left: 25 } }
	);
}

function pointsToString(points) {
	let val = '';
	if (points) {
		for (let index = 0; index < points.length; index++) {
			const point = points[index];
			val += `${point[0]},${point[1]}`;
			index !== points.length - 1 ? (val += ';') : null;
		}
	}
	return val;
}

function pointsInsidePolygon(points, polygon) {
	let inside = false;
	if (points && polygon) {
		for (let index = 0; index < points.length; index++) {
			inside = false;
			const point = points[index];
			let x = point[0], y = point[1];
			for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
				let xi = polygon[i][0], yi = polygon[i][1];
				let xj = polygon[j][0], yj = polygon[j][1];
				let intersect = ((yi > y) != (yj > y))
					&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
				if (intersect) inside = !inside;
			}
			if (!inside) {
				return inside;
			}
		}
	}
	return inside;
}

function checkExistingPointInDraw(draw, data) {
	let result = draw.get(data.id);
	return !!result;
}

function addPolygonToMap(map, polygon, id, name) {
	const sourceId = `readonly-${id}`;
	map.addSource(sourceId, {
		'type': 'geojson',
		'data': {
			'type': 'Feature',
			'properties': {
				'description': name || ''
			},
			'geometry': {
				'type': 'Polygon',
				'coordinates': [polygon]
			}
		}
	});
	return sourceId;
}

function addPolygonsSourceToMap(map, sourceUrl, id) {
	const sourceId = id;
	const polygonsSource = {
		type: 'geojson',
		data: sourceUrl
	};
	map.addSource(sourceId, polygonsSource);
	return sourceId;
}

function addPointToMap(map, point, id, name) {
	map.addSource(`readonly-${id}`, {
		'type': 'geojson',
		'data': {
			'type': 'Feature',
			'properties': {
				'description': name || '',
				'title': name || ''
			},
			'geometry': {
				'type': 'Point',
				'coordinates': [point[0], point[1]]
			}
		}
	});
}

function addPointTodraw(mapBoxDraw, id, props, point) {
	let feature = {
		id: id,
		type: 'Feature',
		properties: props,
		geometry: { type: 'Point', coordinates: point },
	};
	mapBoxDraw.add(feature);
}

function addLayerNameToMap(map, id) {
	map.addLayer({
		'id': `${id}-labels`,
		'type': 'symbol',
		'source': `readonly-${id}`,
		'layout': {
			'text-field': ['get', 'description'],
			'text-variable-anchor': ['center'],
			'text-allow-overlap': false,
			'text-radial-offset': 0.5,
			'text-justify': 'center'
		}
	});
}
function addLayerNameToMapPoint(map, id) {
	map.addLayer({
		'id': `${id}-labels`,
		'type': 'symbol',
		'source': `readonly-${id}`,
		'layout': {
			'text-field': ['get', 'description'],
			'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
			'text-radial-offset': 0.5,
			'text-justify': 'auto'
		}
	});
}
function addFillLayerToMap(map, id, fillColor) {
	map.addLayer({
		'id': id,
		'type': 'fill',
		'source': `readonly-${id}`,
		'layout': {},
		'paint': {
			'fill-color': fillColor,
			'fill-opacity': 0.3
		}
	});
}
function addFillPolygonAndLineToMap(map, id, fillColor, lineWidth) {
	map.addLayer({
		id: `fill-${id}`,
		type: 'fill',
		source: id,
		paint: {
			'fill-color': fillColor,
			'fill-opacity': 0.1,
		},
	});

	map.addLayer({
		id: `line-${id}`,
		type: 'line',
		source: id,
		paint: {
			'line-width': lineWidth || 3,
			'line-color': fillColor,
		},
	});

	return `line-${id}`;
}

function getMapStyles(id, context) {
	return [
		{
			id: `${id}-draw-polygon-fill`,
			type: 'fill',
			paint: {
				'fill-color': context.$vuetify.theme.themes.light.secondary,
				'fill-outline-color': context.$vuetify.theme.themes.light.secondary,
				'fill-opacity': 0.3,
			},
		},
		{
			id: `${id}-draw-polygon-line`,
			type: 'line',
			paint: {
				'line-width': 3,
				'line-color': context.$vuetify.theme.themes.light.primary,
			},
		},
		{
			id: `${id}-draw-polygon-circle`,
			type: 'circle',
			paint: {
				'circle-radius': 7,
				'circle-color': context.$vuetify.theme.themes.light.primary,
			},
		},
	]
}

function getMapInitOptions(container) {
	return {
		container: container,
		center: [-99.5, 41.8],
		zoom: 3,
		dragPan: true,
		style: 'mapbox://styles/mapbox/streets-v11',
		interactive: true,
	}
}

function getIndoorMapInitOptions(container) {
	return {
        container: container,
        minZoom: 8,
        maxZoom: 14,
        style: {
          version: 8,
          name: 'clean',
          sources: {},
          glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: { 'background-color': 'white' },
            },
          ],
        }
      }
}

function drawAreaIndoorPlan(map, area) {
	const { nwCorner, seCorner } = area;
	const file = area.file[0].preview;
	const areaOverlayLayerId = 'indoor-area-overlay-airfinder';

	if (!map.getLayer(areaOverlayLayerId)) {
		map.addSource(areaOverlayLayerId, {
			type: 'image',
			url: file,
			coordinates: [
				[nwCorner.lng, nwCorner.lat],
				[seCorner.lng, nwCorner.lat],
				[seCorner.lng, seCorner.lat],
				[nwCorner.lng, seCorner.lat]
			]
		});

		map.addLayer(
			{
				id: areaOverlayLayerId,
				source: areaOverlayLayerId,
				type: 'raster'
			}
		);

		fitPolygon(map, [
			[nwCorner.lng, nwCorner.lat],
			[seCorner.lng, nwCorner.lat],
			[seCorner.lng, seCorner.lat],
			[nwCorner.lng, seCorner.lat]
		]);

		map.setMaxBounds([
			[nwCorner.lng - 0.3, seCorner.lat - 0.1],
			[seCorner.lng + 0.3, nwCorner.lat + 0.1],
		]);
	}
}

function setAf3MapZoom(map, floorData, areaFileMapping) {
	if(floorData && areaFileMapping) {
		let scale = floorData.mapDistance / floorData.distance;
		const { nwCorner, seCorner } = areaFileMapping;
		const line = turf.lineString([[nwCorner.lng, nwCorner.lat], [seCorner.lng, seCorner.lat]]);
		const diagonalMeters = length(line) / scale;
		if (diagonalMeters >= 0 && diagonalMeters < 50) {
			map.setMaxZoom(14);
		} else if (diagonalMeters >= 50 && diagonalMeters < 100) {
			map.setMaxZoom(17);
		} else if (diagonalMeters >= 100 && diagonalMeters < 200) {
			map.setMaxZoom(18);
		} else if( diagonalMeters >= 200 && diagonalMeters < 300){
			map.setMaxZoom(19);
		} else if( diagonalMeters >= 300 && diagonalMeters < 400){
			map.setMaxZoom(20);
		}else if( diagonalMeters >= 400 && diagonalMeters < 500){
			map.setMaxZoom(21);
		}else{
			map.setMaxZoom(22);
		}
	}
}

function drawIndoorSquareGrid(map, floorData, areaFileMapping, scale){
	removeSquareGrid(map);
	//save how many km is 1 meter according with the scale and the distance in meters
	let scaleGrid = floorData.mapDistance / floorData.distance; //mapDistance in km between the 2 reference points in the map / distance in meters in the floorplan
	switch(scale){
		case "0"://1 meter
			break;
		case "1": //0.25 centimeters
			scaleGrid = scaleGrid / 4;
			break;
		case "2": //1 YARD
			scaleGrid = scaleGrid / YARD;
			break;
		case "3": //1 FEET
			scaleGrid = scaleGrid / FEET;
			break;
		default: break;
	}
	const { nwCorner, seCorner } = areaFileMapping;
	const originPoint = [floorData.originPointLat, floorData.originPointLng];
	const leftPoint = [nwCorner.lng, originPoint[1]]; //a point from the origin point to the left border of floorplan image
	const rightPoint = [seCorner.lng, originPoint[1]]; //a point from the origin point to the right border of floorplan image
	const topPoint = [originPoint[0], nwCorner.lat]; //a point from the origin point to the top border of floorplan image
	const bottomPoint = [originPoint[0], seCorner.lat]; //a point from the origin point to the bottom border of floorplan image

	//integer number of cells that will fit in the distance from the origin point to the left of the floorplan image		
	let amountCellsLeft = getNumberOfCellToFitInWidth(originPoint, leftPoint, scaleGrid);
	//(amountCells * scaleGrid) is the distance needed to fit an integer number of cells
	// add that distance to the origin point longitude so it will be in an intersection
	const left_lng = addKmToLong(originPoint, (amountCellsLeft * scaleGrid) * (-1));

	let amountCellsRight = getNumberOfCellToFitInWidth(originPoint, rightPoint, scaleGrid);
	const right_lng = addKmToLong(originPoint, ((amountCellsRight * scaleGrid)));

	let amountCellsTop = getNumberOfCellToFitInWidth(originPoint, topPoint, scaleGrid); 
	const top_lat = addKmToLat(originPoint, (amountCellsTop * scaleGrid));

	let amountCellsBottom = getNumberOfCellToFitInWidth(originPoint, bottomPoint, scaleGrid);
	const bottom_lat = addKmToLat(originPoint, ((amountCellsBottom * scaleGrid)) * (-1));
	
	let features = [];
	let lng = left_lng;
	let count = amountCellsLeft * (-1);
	while(count < amountCellsRight){ //grid vertical lines
		features.push({
			type: 'Feature',
			properties: {
				description: count % 5 === 0 ? count : '',
				isVertical: true,
			},
			geometry:{
				type: 'LineString',
				coordinates:[[lng,bottom_lat],[lng,top_lat]]
			}
		});
		count++;
		lng = addKmToLong([lng, bottom_lat], scaleGrid);		
	}
	features.push({
		type: 'Feature',
		properties: {
			description: count % 5 === 0 ? count : '',
			isVertical: true,
		},
		geometry:{
			type: 'LineString',
			coordinates:[[lng,bottom_lat],[lng,top_lat]]
		}
	});
	count = amountCellsBottom * (-1);
	let lat = bottom_lat;
	while(count < amountCellsTop){ //grid horizontal lines
		features.push({
			type: 'Feature',
			properties: {
				description: count % 5 === 0 ? count : '',
				isHorizontal: true,
			},
			geometry:{
				type: 'LineString',
				coordinates:[[left_lng,lat],[right_lng,lat]]
			}
		});
		count++;
		lat = addKmToLat([left_lng, lat], scaleGrid);		
	}
	features.push({
		type: 'Feature',
		properties: {
			description: count % 5 === 0 ? count : '',
			isHorizontal: true,
		},
		geometry:{
			type: 'LineString',
			coordinates:[[left_lng,lat],[right_lng,lat]]
		}
	});
	let paint = {
		'line-color': '#625b5a',
		'line-dasharray': [0.2, 3]
	}
	map.addSource('map-grid-airfinder', {
	  type: 'geojson',
	  data: {
		  features: features,
		  type: "FeatureCollection"
		}
	});
	map.addLayer({
		id: 'map-grid-airfinder',
		type: 'line',
		source: 'map-grid-airfinder',
		paint: paint,
	});
	map.addLayer({
		id: 'grid-numbers-airfinder',
		type: 'symbol',
		source: 'map-grid-airfinder',
		'layout': {
			'text-field': ['get', 'description'],
			'text-variable-anchor': ['center'],
			'text-radial-offset': 0.5,
		}
	});
}

function getNumberOfCellToFitInWidth(from, to, cellSize){
	const line = turf.lineString([from, to]);
	const width = length(line);
	return Math.ceil(width/cellSize);
}

function drawLineBetweenPoints(map, a, b, color){
	removeLineBetweenTwoPoints(map);
	map.addSource('measure-line-airfinder', {
		'type': 'geojson',
		'data': {
			'type': 'Feature',
			'geometry': {
				'type': 'LineString',
				'coordinates': [
					[a.lngLat.lng, a.lngLat.lat],
					[b.lngLat.lng, b.lngLat.lat]
				]
			}
		}
	});
	map.addSource('measure-line-point-airfinder', {
		'type': 'geojson',
		'data': {
			'type': 'Feature',
			'properties': {
				'description': ''
			},
			'geometry': {
				'type': 'Point',
				'coordinates': [b.lngLat.lng, b.lngLat.lat]
			}
		}
	});
	map.addLayer({
		'id': 'measure-line-airfinder',
		'type': 'line',
		'source': 'measure-line-airfinder',
		'layout': {
			'line-join': 'round',
			'line-cap': 'round'
			},
		'paint': {
			'line-color': color || '#faff67',
			'line-width': 3
		}
	});
	map.addLayer({
		'id': 'measure-line-name-airfinder',
		'type': 'symbol',
		'source': 'measure-line-point-airfinder',
		'layout': {
			'text-field': '{description}',
			"text-anchor": "top-left",
			'text-radial-offset': 1,
			'text-allow-overlap': true
		}
	});
}

function mapCoordinates(point, floorData, unit) {
	let scaleGrid = floorData.mapDistance / floorData.distance;
	const lineX = turf.lineString([[floorData.originPointLat, floorData.originPointLng], [point.lngLat.lng, floorData.originPointLng]]);
	const lineY = turf.lineString([[floorData.originPointLat, floorData.originPointLng], [floorData.originPointLat, point.lngLat.lat]]);
	const widthX = length(lineX);
	const widthY = length(lineY);
	let labelX = (widthX/scaleGrid);
	let labelY = (widthY/scaleGrid);
	if (floorData.originPointLat > point.lngLat.lng) {
		labelX = labelX * -1;
	}
	if (floorData.originPointLng > point.lngLat.lat) {
		labelY = labelY * -1;
	}
	if (labelY.toFixed(2) === '-0.00') {
		labelY = Math.abs(labelY)
	}
	if (labelX.toFixed(2) === '-0.00') {
		labelX = Math.abs(labelX)
	}
	let label = '';
	switch(unit){
		case "0"://1 meter
		label = 'X: ' + labelX.toFixed(2) + ' Y: ' + labelY.toFixed(2) + ' ' + i18n.t("assets-st-grid-meters");
		break;
		case "1": // feet
		label = 'X: ' + (labelX * FEET).toFixed(2)+ ' Y: ' + (labelY * FEET).toFixed(2) + ' ' +i18n.t("assets-st-grid-feet");
		break;
		default: break;
	}
	return label;
}

function editLineBetweenTwoPoints(map, a, b, floorData, unit) {
	if (!map.getSource('measure-line-airfinder')) {
		return;
	}
	let scaleGrid = floorData.mapDistance / floorData.distance; //mapDistance in km between the 2 reference points in the map / distance in meters in the floorplan
	const line = turf.lineString([[a.lngLat.lng, a.lngLat.lat], [b.lngLat.lng, b.lngLat.lat]]);
	const width = length(line);
	let label = (width/scaleGrid).toFixed(2);

	switch(unit){
		case "0"://1 meter
		label = label + ' ' +i18n.t("assets-st-grid-meters");
		break;
		case "1": //0.25 centimeters
		label = (label * FEET).toFixed(2) + ' ' +i18n.t("assets-st-grid-feet");
		break;
		default: break;
	}
	map.getSource('measure-line-airfinder').setData({
		'type': 'Feature',
		'geometry': {
			'type': 'LineString',
			'coordinates': [
				[a.lngLat.lng, a.lngLat.lat],
				[b.lngLat.lng, b.lngLat.lat]
			]
		}
	})
	map.getSource('measure-line-point-airfinder').setData({
		'type': 'Feature',
		'properties': {
			'description': label
		},
		'geometry': {
			'type': 'Point',
			'coordinates': [b.lngLat.lng, b.lngLat.lat]
		}
	})
}

function removeLineBetweenTwoPoints(map) {
	if (map && map.getSource('measure-line-airfinder')) {
		map.removeLayer('measure-line-airfinder');
		map.removeLayer('measure-line-name-airfinder');
		map.removeSource('measure-line-airfinder');
		map.removeSource('measure-line-point-airfinder');
	}
}

function removeSquareGrid(map){
	if (map) {
		if (map.getLayer('grid-numbers-airfinder')) {
			map.removeLayer('grid-numbers-airfinder');
		}
		if(map.getLayer('map-grid-airfinder')){
			map.removeLayer('map-grid-airfinder');
			map.removeSource('map-grid-airfinder');
		}
	}
}

let onHistoryLayerClickHandler;
let onHistoryLayerMouseEnterHandler;
let onHistoryLayerMouseLeaveHandler;

function drawHistory(map, history, onHistoryClick) {
	const tagHistoryLayer = 'tag-history-airfinder';
	const previousHistoryLayer = map.getLayer(tagHistoryLayer);
	if (previousHistoryLayer) {
		map.removeLayer(previousHistoryLayer);
	}
	if (history.features.length) {
		let historySource = map.getSource(tagHistoryLayer);
		if (historySource) {
			historySource.setData(history);
		} else {
			map.addSource(tagHistoryLayer, {
				type: 'geojson',
				data: history,
			});
		}
		map.addLayer({
			id: tagHistoryLayer,
			source: tagHistoryLayer,
			type: 'symbol',
			layout: {
				'icon-image': [
					'match',
					['get', 'etype'],
					'wifi',
					'wifi',
					'gps',
					'gps',
					'beacon',
					'beacon',
					'cellid',
					'cell',
					'cellId',
					'cell',
					'gps',
				],
				'icon-allow-overlap': true,
			},
		});

		const coordinates = history.features.map((tag) => {
			return tag.geometry.coordinates;
		});

		if (onHistoryLayerClickHandler) {
			map.off('click', tagHistoryLayer, onHistoryLayerClickHandler);
			map.off('mouseenter', tagHistoryLayer, onHistoryLayerMouseEnterHandler);
			map.off('mouseleave', tagHistoryLayer, onHistoryLayerMouseLeaveHandler);
		}

		onHistoryLayerClickHandler = (e) => {
			const eventId = e.features[0].properties.id;
			onHistoryClick(eventId);
		}

		onHistoryLayerMouseEnterHandler = () => (map.getCanvas().style.cursor = 'pointer');
		onHistoryLayerMouseLeaveHandler = () => (map.getCanvas().style.cursor = '');

		map.on('click', tagHistoryLayer, onHistoryLayerClickHandler);
		map.on('mouseenter', tagHistoryLayer, onHistoryLayerMouseEnterHandler);
		map.on('mouseleave', tagHistoryLayer, onHistoryLayerMouseLeaveHandler);

		fitPolygon(map, coordinates);
	}
}

function removeMarker(map, id) {
	if (map.getLayer(id ? id : 'selected-event-airfinder')) {
		map.removeLayer(id ? id : 'selected-event-airfinder');
		map.removeSource(id ? id : 'selected-event-airfinder');
	}
}

function createMarker(coords, map, color, strokeColor, strokeOpacity, strokeWidth, translate, circleRadius, id) {
	removeMarker(map, id);
	let source = {
		type: 'geojson',
		data: {
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: coords,
			},
		},
	};

	map.addSource(id ? id : 'selected-event-airfinder', source);
	map.addLayer({
		id: id ? id : 'selected-event-airfinder',
		source: id ? id : 'selected-event-airfinder',
		type: 'circle',
		paint: {
			'circle-radius': circleRadius || 8,
			'circle-color': color || '#faff67',
			'circle-blur': 0,
			'circle-stroke-width': strokeWidth || 6,
			'circle-stroke-opacity': strokeOpacity || 0,
			'circle-stroke-color': strokeColor || '#faff67',
			'circle-translate': translate || [0, -7],
		},
	});
}

function getFirstLayer(map) {
	try {
		const layers = map.getStyle().layers;
		for (var i = 0; i < layers.length; i++) {
			if (layers[i].id.includes('airfinder')) {
				return layers[i].id;
			}
		}
	} catch (e) { }
	return null;
}

function clearLayers(map) {
	let { layers, sources } = map.getStyle();
	layers.forEach((layer) => {
		if (layer.id.includes('-airfinder')) {
			map.removeLayer(layer.id);
		}
	});
	Object.keys(sources).forEach((source) => {
		if (source.includes('-airfinder')) {
			map.removeSource(source);
		}
	});
}
/* given a query in the form "lng, lat" or "lat, lng" returns the matching
* geographic coordinate(s) as search results in carmen geojson format
*/
function coordinatesGeocoder(query) {
	// match anything which looks like a decimal degrees coordinate pair
	var matches = query.match(
	/^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
	);
	if (!matches) {
		return null;
	}
	 
	function coordinateFeature(lng, lat) {
		return {
			center: [lng, lat],
			geometry: {
				type: 'Point',
				coordinates: [lng, lat]
			},
			place_name: 'Lat: ' + lat + ' Lng: ' + lng,
			place_type: ['coordinate'],
			properties: {},
			type: 'Feature'
		};
	}
	 
	var coord1 = Number(matches[1]);
	var coord2 = Number(matches[2]);
	var geocodes = [];
	 
	if (coord1 < -90 || coord1 > 90) {
		// must be lng, lat
		geocodes.push(coordinateFeature(coord1, coord2));
	}
	 
	if (coord2 < -90 || coord2 > 90) {
		// must be lat, lng
		geocodes.push(coordinateFeature(coord2, coord1));
	}
	 
	if (geocodes.length === 0) {
		// else could be either lng, lat or lat, lng
		geocodes.push(coordinateFeature(coord1, coord2));
		geocodes.push(coordinateFeature(coord2, coord1));
	}
	 
	return geocodes;
};

export {
	listToMap,
	getMapStyles,
	getMapInitOptions,
	getIndoorMapInitOptions,
	fitPolygon,
	addPolygonToMap,
	addPolygonsSourceToMap,
	addPointToMap,
	addLayerNameToMap,
	addLayerNameToMapPoint,
	addFillLayerToMap,
	addFillPolygonAndLineToMap,
	pointsInsidePolygon,
	populateFromMap,
	pointsToString,
	checkExistingPointInDraw,
	addPointTodraw,
	drawAreaIndoorPlan,
	drawIndoorSquareGrid,
	setAf3MapZoom,
	removeSquareGrid,
	drawHistory,
	drawLineBetweenPoints,
	editLineBetweenTwoPoints,
	removeLineBetweenTwoPoints,
	createMarker,
	removeMarker,
	getFirstLayer,
	clearLayers,
	mapCoordinates,
	coordinatesGeocoder
}