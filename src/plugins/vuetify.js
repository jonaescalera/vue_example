import '@mdi/font/css/materialdesignicons.css'
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: /*{
        primary: '#CE3234',
        secondary: '#CE3234',
        accent: '#8c9eff',
        error: '#b71c1c',
      },*/
      {
        primary: '#00477F',
        secondary: '#00a1c0',
        //accent: '#606E7C',
        primaryLight: '#e1e9f0',
        error: '#FF5252',
        info: '#3b5762',
        success: '#4CAF50',
        warning: '#FFC107',
      }
    },
  },
  icons: {
    iconfont: 'mdi'
  }
});