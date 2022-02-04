<template>
  <div class="w-100 h-100" ref="map">
    <slot></slot>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default {
  props: {
    inputArea: null,
    mapData: null,
    comment: null,
    onlyMap: null,
    readOnly: null,
    styleType: null,
    options: null,
    accessToken: null,
    showScale: false
  },
  data() {
    return {
      map: null,
      iconGPS: require('../../assets/img/map/pin_gps.png'),
      iconWifi: require('../../assets/img/map/pin_wifi.png'),
      iconCell: require('../../assets/img/map/pin_cell.png'),
      iconTag: require('../../assets/img/map/pin_tag.png'),
      iconTagCross: require('../../assets/img/map/pin_tag_cross.png'),
      iconLocation: require('../../assets/img/map/pin_location.png'),
      iconLocationCross: require('../../assets/img/map/pin_location_cross.png'),
      iconCross: require('../../assets/img/map/pin_cross.png'),
      iconCrossRed: require('../../assets/img/map/pin_cross_red.png'),
      mapStyles: {
        clear: {
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
        },
        satellite: 'mapbox://styles/mapbox/satellite-streets-v11',
        default: 'mapbox://styles/mapbox/streets-v11',
      },
    };
  },
  mounted() {
    mapboxgl.accessToken = process.env[this.accessToken] ? process.env[this.accessToken] : process.env.VUE_APP_MAPBOX_ACCESS_TOKEN ? process.env.VUE_APP_MAPBOX_ACCESS_TOKEN : '';
    this.map = new mapboxgl.Map({
      container: this.$refs.map,
      center: [-96, 37.8],
      zoom: 11,
      dragPan: true,
      style: this.mapStyles[this.styleType || 'default'],
      interactive: !this.readOnly,
      ...this.options
    });

    this.map.on(
      'load',
      function() {      
        this.map.loadImage(this.iconGPS, (error, image) => {
          if (error) throw error;
          this.map.addImage('gps', image);
          this.map.loadImage(this.iconCell, (error, image) => {
            if (error) throw error;
            this.map.addImage('cell', image);
            this.map.loadImage(this.iconWifi, (error, image) => {
              if (error) throw error;
              this.map.addImage('wifi', image);
              this.map.loadImage(this.iconTag, (error, image) => {
                if (error) throw error;
                this.map.addImage('tag', image);
                this.map.loadImage(this.iconLocation, (error, image) => {
                  if (error) throw error;
                  this.map.addImage('beacon', image);
                  this.map.loadImage(this.iconCross, (error, image) => {
                    if (error) throw error;
                    this.map.addImage('cross', image);
                    
                    this.map.loadImage(this.iconLocationCross, (error, image) => {
                      if (error) throw error;
                      this.map.addImage('beacon_cross', image);
                      
                      this.map.loadImage(this.iconTagCross, (error, image) => {
                        if (error) throw error;
                        this.map.addImage('tag_cross', image);
                        
                        this.map.loadImage(this.iconCrossRed, (error, image) => {
                          if (error) throw error;
                          this.map.addImage('crossRed', image);
                          this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

                          if (this.showScale) {
                            const scaleControl = new mapboxgl.ScaleControl({
                              maxWidth: 80,
                              unit: 'metric',
                            });
                            this.map.addControl(scaleControl);
                          }

                          this.$emit('onLoad', this.map);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      }.bind(this)
    );
  },
  methods: {},
};
</script>