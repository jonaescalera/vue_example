<template>
  <div>
    <v-dialog
      @click:outside="closeModal"
      @keydown.esc="closeModal"
      v-model="dialog"
      fullscreen
    >
      <v-card>
        <v-card-text
          class="map-container"
        >
          <v-row class="h-100">
            <v-col lg="9" md="8" cols="7">
              <div class="w-100 h-100" ref="mapboxMap"></div>
            </v-col>
            <v-col lg="3" md="4" col="5">
                <v-row class="mb-5">
                    <v-col cols="11">
                        <v-form @submit.stop.prevent id="locationEditForm">
                            <v-row justify="center">
                                <v-col cols="11">
                                    <p>{{ $t('search-address-legend') }}</p>
                                    <div id="geocoder">
                                    </div>
                                    <span ref="installedLng" v-show="addressErrors">{{ addressErrors }}</span>
                                    <p class="mb-1" v-if="form.installedLatitude"><b>{{ $t('lb-latitude') }}:</b> <span class="secondary--text">{{ form.installedLatitude }}</span></p>
                                    <p v-if="form.installedLongitude"><b>{{ $t('lb-longitude') }}:</b> <span class="secondary--text">{{ form.installedLongitude }}</span></p>
                                    <div v-if="showForm">
                                        <p v-if="modalMode === 'create'" class="mt-4">{{ $t('lb-enter-form-title') }}</p>
                                        <p v-if="modalMode === 'edit'" class="mt-4">{{ $t('lb-edit-form-title') }}</p>
                                        <v-select
                                            id="prefix"
                                            v-if="modalMode === 'create'"
                                            :clearable="true"
                                            :items="prefixes"
                                            item-text="value"
                                            item-value="id"
                                            :label="$t('prefix')"
                                            :dense="true"
                                            @change="setPrefix"
                                            v-model="form.prefix"
                                            outlined
                                            color="secondary"
                                        ></v-select>
                                        <!-- name -->
                                        <v-text-field
                                            id="name"
                                            :label="$t('name-required')"
                                            :dense="true"
                                            v-model="form.name"
                                            outlined
                                            :error-messages="nameErrors"
                                            @input="$v.form.name.$touch()"
                                            @blur="$v.form.name.$touch()"
                                            color="secondary"
                                        ></v-text-field>
                                        <!-- sub-name -->
                                        <v-text-field
                                            id="subname"
                                            v-if="modalMode === 'create'"
                                            :label="$t('sub-name')"
                                            :dense="true"
                                            v-model="form.subName"
                                            outlined
                                            color="secondary"
                                        ></v-text-field>
                                        <!-- mac address -->
                                        <v-text-field
                                            id="macAddress"
                                            :label="$t('devices-page-device-mac-address-required')"
                                            v-model="form.macAddress"
                                            @keyup="formatMacAddress"
                                            :dense="true"
                                            :error-messages="macAddressErrors"
                                            :disabled="modalMode === 'edit'"
                                            outlined
                                            required
                                            color="secondary"
                                            @change="$v.form.macAddress.$touch()"
                                        ></v-text-field>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-col>
                    <v-col cols="11">
                        <div v-if="showForm">
                            <v-btn
                            v-if="modalMode === 'edit'"
                            depressed
                            color="secondary"
                            tabindex="3"
                            @click="editLocationFn"
                            class="px-8 float-right mr-5"
                            >{{$t('save')}}</v-btn>
                            <v-btn
                            v-if="modalMode === 'create'"
                            depressed
                            color="secondary"
                            tabindex="3"
                            @click="createLocationFn"
                            class="px-8 float-right mr-5"
                            >{{$t('add')}}</v-btn>
                        </div>
                        <v-btn
                        text
                        color="secondary"
                        tabindex="3"
                        @click="closeModal"
                        class="px-8 mr-2 float-right"
                        >{{$t('cancel')}}</v-btn>
                    </v-col>
                </v-row>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { mapActions } from 'vuex';
import { macAddressValidator } from '../../mixins/macAddressValidator';
import { getMapInitOptions, coordinatesGeocoder } from '../../utils/map';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { PREFIXES } from '../../constants/prefixes'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import LocationNewEdit from './location-new-edit';

export default {
    components: {
        LocationNewEdit
    },
    mixins: [validationMixin],
    validations: {
        form: {
            name: {
                required
            },
            macAddress: {
                required,
                minLength: minLength(17),
            },
            installedLatitude: {
                required
            },
            installedLongitude: {
                required
            }
        }
    },
    props:['modalMode', 'siteId'],
    computed: {
        nameErrors() {
            const errors = [];
            if (!this.$v.form.name.$dirty) return errors;
            !this.$v.form.name.required &&
                errors.push(this.$t('error-name-required'));
            return errors;
        },
        macAddressErrors() {  
            const errors = [];
            if (!this.$v.form.macAddress.$dirty) return errors;
            !this.$v.form.macAddress.required &&
                errors.push(this.$t('devices-error-mac-address-required'));
            !this.$v.form.macAddress.minLength &&
                errors.push(this.$t('devices-error-mac-address-min-length'));
            return errors;
        },
        addressErrors() {
            let errors = null;
            if (!this.$v.form.installedLatitude.$dirty) return errors;
            if(!this.$v.form.installedLatitude.required){
                errors = this.$t('error-location-address-required');
                this.$refs.installedLng.classList.add('error--text');
            }
            
            return errors;
        },
        showForm(){
            return (this.geojson.features && this.geojson.features[0].geometry.coordinates) || this.location;
        }
    },
    data() {
        return {
            iconCrosshair: require('../../assets/img/map/crosshair.png'),
            prefixes: [],
            dialog: false,
            geocoder: null,
            map: null,
            canvas: null,
            geojson: {},
            form: {},
            location: null
        }
    },
    methods: {
        ...mapActions('location', ['createLocation','editLocation',]),
        openModal(locB) {
            this.prefixes = PREFIXES;
            this.geojson = {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': null
                            }
                    }
                ]
            };
            this.form = {
                siteId: this.siteId,
                name: '',
                macAddress: '',
                prefix: this.prefixes[0].id,
                subName: '',
                installedLatitude: '',
                installedLongitude: ''
            };
            this.location = locB;
            this.dialog = true;
            if(this.location){
                Object.assign(this.form, {
                    name: this.location.name,
                    macAddress: macAddressValidator.computed.formatMacAddress(this.location.macAddress),
                });
                if(this.location.installedLatitude && this.location.installedLongitude){
                    Object.assign(this.form, {
                        installedLatitude: this.location.installedLatitude,
                        installedLongitude: this.location.installedLongitude
                    });
                    this.geojson.features[0].geometry.coordinates = [this.location.installedLongitude, this.location.installedLatitude];
                } 
            }
            setTimeout(() => {
                this.initMap();                
            }, 0);
            
        },
        closeModal() {
            this.$v.form.$reset();
            this.geocoder.clear();
            if(this.map.getSource('point')){
                this.map.removeLayer('point');
                this.map.removeSource('point');
            }
            this.dialog = false;
        },
        setPrefix() {
            this.form.name = this.form.prefix;
        },
        formatMacAddress() {
            this.$set(
                this.form,
                'macAddress',
                macAddressValidator.computed.formatMacAddress(this.form.macAddress)
            );
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
                // Update the Point feature in `geojson` coordinates
                this.geojson.features[0].geometry.coordinates = [result.result.geometry.coordinates[0], result.result.geometry.coordinates[1]];
                this.form.installedLongitude = result.result.geometry.coordinates[0];
                this.form.installedLatitude = result.result.geometry.coordinates[1];
                this.addPoint();
            });
            
            this.map = new mapboxgl.Map(getMapInitOptions(this.$refs.mapboxMap));
            this.map.loadImage(this.iconCrosshair, (error, image) => {
                if (error) throw error;
                this.map.addImage('crosshair', image);
            });
            this.canvas = this.map.getCanvasContainer();
            this.map.on('load', function () {
                if(this.location && this.location.installedLatitude && this.location.installedLongitude){
                   this.addPoint();
                }
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
                    'type': 'geojson',
                    'data': this.geojson
                });
                
                this.map.addLayer({
                    'id': 'point',
                    'type': 'symbol',
                    'source': 'point',
                    'layout': {
                        'icon-image': 'crosshair',
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
        onMove(e) {
            var coords = e.lngLat;
            // clear the search input
            this.geocoder.clear();
            
            // Set a UI indicator for dragging.
            this.canvas.style.cursor = 'grabbing';

            // Update the Point feature in `geojson` coordinates
            // and call setData to the source layer `point` on it.
            this.geojson.features[0].geometry.coordinates = [coords.lng, coords.lat];
            this.map.getSource('point').setData(this.geojson);
            this.form.installedLongitude = coords.lng;
            this.form.installedLatitude = coords.lat;
        },	 
        onUp(e) {
            var coords = e.lngLat;
            
            // Set the coordinates of where the point had
            // finished being dragged to on the map.
            this.form.installedLongitude = coords.lng;
            this.form.installedLatitude = coords.lat;
            
            // Unbind mouse/touch events
            this.map.off('mousemove', this.onMove);
            this.map.off('touchmove', this.onMove);
        },
        async editLocationFn(){
            this.$v.$touch();
            if (!this.$v.form.$anyError && this.modalMode === 'edit') {
                try {
                await this.editLocation({locationId:this.location.id, location: this.form});
                this.$emit('changeOnOffsiteLocations');
                this.$toasted.show(this.$t('location-edited'), {
                    position: 'bottom-right',
                    className: ['toast-success'],
                    duration: 2000,
                });
                this.closeModal();
                } catch (error) {
                    this.$toasted.show(error, {
                        position: 'bottom-right',
                        className: ['toast-error'],
                        duration: 5000,
                    });
                }
            }
        },
        async createLocationFn(){
            this.$v.$touch();
            if (!this.$v.form.$anyError && this.modalMode === 'create') {
                let json = Object.assign({}, this.form);
                json.macAddress = json.macAddress.replace(/\s/g, '');
                json.name = json.subName ? json.name + '@' + json.subName : json.name;
                json['properties'] = {'installedLatitude': this.form.installedLatitude, 'installedLongitude': this.form.installedLongitude};
                try {
                    await this.createLocation( json );
                    this.$toasted.show(this.$t('location-created'), {
                        position: 'bottom-right',
                        className: ['toast-success'],
                        duration: 2000,
                    });
                    this.$emit('changeOnOffsiteLocations');
                    this.closeModal();
                } catch (error) {
                    this.$toasted.show(error, {
                        position: 'bottom-right',
                        className: ['toast-error'],
                        duration: 5000,
                    });
                }
            }
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
</style>