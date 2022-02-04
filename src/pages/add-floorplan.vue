<template>
  <div>
      <v-card>
        <v-card-text
          class="map-container"
        >
          <v-row class="h-100">
            <v-col lg="9" md="8" cols="7">
              <div class="w-100 h-100" ref="mapboxMap">
              <div class="floor-selector">
                  <v-pagination
                    v-model="selectedFloor"
                    color="secondary"
                    @input="changedFloor"
                    :length="floors.length"
                ></v-pagination>
                </div>
              </div>
            </v-col>
            <v-col lg="3" md="4" col="5">
                <v-row class="mb-5">
                    <v-col cols="11">
                        <v-row justify="center">
                            <v-col cols="11">
                                <p>Enter a street address or a point (like: -40, 170) of interest to search for where the build is. Click on the cross to drag it to the right location.</p>
                                <div id="geocoder">
                                </div>
                                <p class="mb-1" v-if="centerLat"><b>{{ $t('lb-latitude') }}:</b> <span class="secondary--text">{{ centerLat }}</span></p>
                                <p v-if="centerLng"><b>{{ $t('lb-longitude') }}:</b> <span class="secondary--text">{{ centerLng }}</span></p>
                                <div v-if="showForm">
                                    <v-file-input
                                        ref="fileInput"
                                        @change="getImage"
                                        truncate-length="15"
                                        label="Upload your floorplan"
                                    ></v-file-input>
                                    <v-text-field
                                        :label="'Floor Name'"
                                        :dense="true"
                                        v-model="form.name"
                                        :error-messages="nameErrors"
                                        outlined
                                        required
                                        color="secondary"
                                        @input="$v.form.name.$touch()"
                                        @blur="$v.form.name.$touch()"
                                    ></v-text-field>
                                </div>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="11">
                        <v-btn
                        :disabled="form.name === ''"
                        v-if="floors.length > 0 || floorplan"
                        color="secondary"
                        @click="save"
                        class="px-8 mb-2 float-right"
                        >{{ $t('save') }}</v-btn>
                        <v-btn
                        :disabled="floors.length <= 0"
                        v-if="floors.length > 0 || floorplan"
                        color="error"
                        @click="deleteSelected"
                        class="px-8 mb-2 float-left"
                        >{{ $t('delete') }}</v-btn>
                        <v-btn
                        text
                        color="secondary"
                        @click="close"
                        class="px-8 float-right"
                        >{{ $t('clear') }}</v-btn>
                    </v-col>
                </v-row>
            </v-col>
          </v-row>
          
        </v-card-text>
      </v-card>
  </div>
</template>

<script>

import { getMapInitOptions, coordinatesGeocoder } from '../utils/map';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const areaOverlayLayerId = 'indoor-area-overlay-airfinder';

export default {
    computed: {
        showForm(){
            return (this.geojson.features && this.geojson.features[0].geometry.coordinates);
        },
        nameErrors() {
            const errors = [];
            if (!this.$v.form.name.$dirty) return errors;
            !this.$v.form.name.required &&
                errors.push(this.$t('error-name-required'));
            return errors;
        },
    },
    mixins: [validationMixin],
    validations: {
        form: {
            name: {
                required,
            }
        }
    },
    data() {
        return {
            iconCross: require('../assets/img/map/cross.png'),
            geocoder: null,
            map: null,
            selectedFloor: 1,
            floors: [],
            centerLat: null,
            centerLng: null,
            canvas: null,
            geojson: {},
            floorplan: null,
            form: {
                name: ''
            },
            pointInMovement: null
        }
    },
    mounted(){
        this.geojson = {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'properties':{ 'id': 'centralPoint' },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': null
                        }
                    }
                ]
            };
        this.initMap();
    },
    methods: {
        async getImage(input) {
            var reader = new FileReader();
            let self = this;
            reader.onload = (e) => {
                self.addimage(e.target.result);
            };
            reader.readAsDataURL(input);
        },
        async changedFloor(floorNumber) {
            this.geojson.features = this.floors[floorNumber-1].points;
            if (this.map.getLayer(areaOverlayLayerId)) {
                this.map.removeLayer(areaOverlayLayerId);
                this.map.removeSource(areaOverlayLayerId);
            }
            this.map.addSource(areaOverlayLayerId, {
                type: 'image',
                url: this.floors[floorNumber-1].img,
                coordinates: [
                    [this.floors[floorNumber-1].points[0].geometry.coordinates[0], this.floors[floorNumber-1].points[0].geometry.coordinates[1]],
                    [this.floors[floorNumber-1].points[1].geometry.coordinates[0], this.floors[floorNumber-1].points[1].geometry.coordinates[1]],
                    [this.floors[floorNumber-1].points[2].geometry.coordinates[0], this.floors[floorNumber-1].points[2].geometry.coordinates[1]],
                    [this.floors[floorNumber-1].points[3].geometry.coordinates[0], this.floors[floorNumber-1].points[3].geometry.coordinates[1]]
                ]
            });
            this.map.addLayer(
                {
                    id: areaOverlayLayerId,
                    source: areaOverlayLayerId,
                    type: 'raster',
                    paint: {
                        'raster-fade-duration': 0, // to avoid flicker on moving the vertice
                        'raster-opacity': .4
                    } 
                }
            );
            this.map.getSource('point').setData(this.geojson);
        },
        save() {
            //these lines will change once we have a service to save the data, in the mean time, object are being duplicated
            this.floors.push({img: this.floorplan.src, points: JSON.parse(JSON.stringify(this.geojson.features))});
            this.selectedFloor = this.floors.length;
            this.$v.form.$reset();
            this.form.name = '';
        },
        deleteSelected() {
            this.floors.splice(this.selectedFloor-1, 1);
            if (this.selectedFloor-1 >= 1) {
                this.selectedFloor = this.selectedFloor-1;
                this.changedFloor(this.selectedFloor)
            }else{
                if (this.floors.length > 0) {
                    this.changedFloor(this.selectedFloor)
                }else{
                    this.clearLayers();
                }
            }
        },
        processImg(file){
            this.floorplan = new Image();
            this.floorplan.src = file;

            return new Promise((resolve, reject) => {
                this.floorplan.onload = () => resolve(this.floorplan);
                this.floorplan.onerror = reject;
            });
        },
        async addimage(file){
            await this.processImg(file);
            //calculate meters according image width. Height always will be 50 meters
            let meters = (this.floorplan.width * 50) / this.floorplan.height;
            meters = meters / 2;
            /***/
            const earth = 6378.137;  //radius of the earth in kilometer
            const pi = Math.PI;
            const cos = Math.cos;
            const m = (1 / ((2 * pi / 360) * earth)) / 1000;  //1 meter in degree

            const nw_latitude = this.centerLat + (25 * m);
            const nw_longitude = this.centerLng + ((-1 * meters) * m) / cos(this.centerLat * (pi / 180));

            const se_latitude = this.centerLat + ((-25) * m);
            const se_longitude = this.centerLng + (meters * m) / cos(this.centerLat * (pi / 180));
            /***/

            const nwCorner = {lng: nw_longitude, lat: nw_latitude};
            const seCorner = {lng: se_longitude, lat: se_latitude};
            
            
            if (this.map.getLayer(areaOverlayLayerId)) {
                this.map.removeLayer(areaOverlayLayerId);
                this.map.removeSource(areaOverlayLayerId);
            }
            this.map.addSource(areaOverlayLayerId, {
                type: 'image',
                url: file,
                coordinates: [
                    [nwCorner.lng, nwCorner.lat],
                    [seCorner.lng, nwCorner.lat],
                    [seCorner.lng, seCorner.lat],
                    [nwCorner.lng, seCorner.lat]
                ]
            });
            
            this.map.addLayer(
            {
                id: areaOverlayLayerId,
                source: areaOverlayLayerId,
                type: 'raster',
                paint: {
                    'raster-fade-duration': 0, // to avoid flicker on moving the vertice
                    'raster-opacity': .4
                } 
            }
            );
            // To move point layer above the image layer
            if (this.map.getLayer('point')) { 
                this.map.moveLayer(areaOverlayLayerId, 'point');
            }       
            //add vertices points
            let points = [{
                            'type': 'Feature',
                            'properties':{ 'id': 'nwPoint' },
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [nwCorner.lng, nwCorner.lat]
                                }
                        },
                        {
                            'type': 'Feature',
                            'properties':{ 'id': 'nePoint' },
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [seCorner.lng, nwCorner.lat]
                                }
                        },
                        {
                            'type': 'Feature',
                            'properties':{ 'id': 'sePoint' },
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [seCorner.lng, seCorner.lat]
                                }
                        },
                        {
                            'type': 'Feature',
                            'properties':{ 'id': 'swPoint' },
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [nwCorner.lng, seCorner.lat]
                                }
                        }];
            this.geojson.features = points;
            
            this.addPoint();
        },
        close() {
            this.geocoder.clear();
            this.clearLayers();
        },
        clearLayers(){
            if(this.map.getSource('point')){
                this.map.removeLayer('point');
                this.map.removeSource('point');
            }
            if(this.map.getSource(areaOverlayLayerId)){
                this.map.removeLayer(areaOverlayLayerId);
                this.map.removeSource(areaOverlayLayerId);
            }
            this.floorplan = {};
            this.centerLat = null;
            this.centerLng = null;
            this.geojson = {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'properties':{ 'id': 'centralPoint' },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': null
                            }
                    }
                ]
            };
        },
        initMap(){
            mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN || '';
            if(!this.geocoder || !this.geocoder.container){
                this.geocoder = new MapboxGeocoder({
                    accessToken: mapboxgl.accessToken,
                    marker: false,
                    localGeocoder: coordinatesGeocoder
                });            
                this.geocoder.addTo('#geocoder');
            }
            this.geocoder.on('result', (result) => {
                this.clearLayers();
                this.geojson.features[0].geometry.coordinates = [result.result.geometry.coordinates[0], result.result.geometry.coordinates[1]];
                this.centerLng = result.result.geometry.coordinates[0];
                this.centerLat = result.result.geometry.coordinates[1];
                this.addPoint();
            });
            
            this.map = new mapboxgl.Map(getMapInitOptions(this.$refs.mapboxMap));
            this.map.loadImage(this.iconCross, (error, image) => {
                if (error) throw error;
                this.map.addImage('cross', image);
            });
            this.canvas = this.map.getCanvasContainer();
            this.map.on('load', function () {
                // When the cursor enters a feature in the point layer, prepare for dragging.
                this.map.on('mouseenter', 'point', () => {
                    this.canvas.style.cursor = 'move';
                });
                
                this.map.on('mouseleave', 'point', () => {
                    this.canvas.style.cursor = '';
                });
                
                this.map.on('mousedown', 'point', (e) => {
                    // Prevent the default map drag behavior.
                    e.preventDefault();
                    //save the point id touched
                    var features = this.map.queryRenderedFeatures(e.point);
                    this.pointInMovement = features[0] ? features[0].properties.id : null;
                    
                    this.canvas.style.cursor = 'grab';
                    
                    this.map.on('mousemove', this.onMove);
                    this.map.once('mouseup', this.onUp);
                });
                
                this.map.on('touchstart', 'point', (e) => {
                    if (e.points.length !== 1) return;
                    
                    // Prevent the default map drag behavior.
                    e.preventDefault();
                    this.map.on('touchmove', this.onMove);
                    this.map.once('touchend', this.onUp);
                });
            }.bind(this));
        },
        addPoint(){
            if(!this.map.getSource('point')){
                // Add a single point to the map
                this.map.addSource('point', {
                    type: 'geojson',
                    data: this.geojson
                });
                
                this.map.addLayer({
                    id: 'point',
                    type: 'symbol',
                    source: 'point',
                    layout: {
                        'icon-image': 'cross',
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true
                    }
                });
            }else{
                //call setData to the source layer `point` on it.
                this.map.getSource('point').setData(this.geojson);
            }
            this.map.flyTo({ center: this.geojson.features[0].geometry.coordinates, zoom: 17 });
        },
        updateDrawing(coords){
            if(this.pointInMovement){
                // Update the Point feature in `geojson` coordinates
                // and call setData to the source layer `point` on it.
                let point = this.geojson.features.filter((e) => e.properties.id === this.pointInMovement);
                point[0].geometry.coordinates = [coords.lng, coords.lat];
                this.map.getSource('point').setData(this.geojson);
                if(this.floorplan.src){
                    let aux = []
                    // Get the new image coordinates
                    // and call setCoordinates to the source layer `indoor-area-overlay-airfinder` on it
                    this.geojson.features.forEach( e => { aux[aux.length] = e.geometry.coordinates });
                    this.map.getSource(areaOverlayLayerId).setCoordinates(aux);
                }
            }
        },
        onMove(e) {            
            let coords = e.lngLat;
            // clear the search input
            this.geocoder.clear();
            
            // Set a UI indicator for dragging.
            this.canvas.style.cursor = 'grabbing';

            this.centerLng = coords.lng;
            this.centerLat = coords.lat;
            
            this.updateDrawing(coords);
        },	 
        onUp(e) {
            let coords = e.lngLat;
            this.updateDrawing(coords);
            this.pointInMovement = null;
            this.centerLng = coords.lng;
            this.centerLat = coords.lat;
            
            // Unbind mouse/touch events
            this.map.off('mousemove', this.onMove);
            this.map.off('touchmove', this.onMove);
        }
    }
}
</script>
<style scoped lang="scss">
    .map-container {
        height: 100vh;
        width: 100%;
        padding: 0 !important;
        
    }
    #geocoder{
        margin-bottom: 5px;
    }
    .floor-selector {
        position: absolute;
        background-color: transparent;
        min-width: 50px;
        min-height: 50px;
        bottom: 100px;
        z-index: 1;
        right: 0px;
    }
</style>