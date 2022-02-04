<template>
  <v-row id="themingPage">
    <v-col class="custom-card card-no-footer-height">
      <v-row>
        <v-col>
          <h3 class="mt-4">{{$t('sidebar-settings-theming')}}</h3>
          <v-divider />
          <p class="mt-3">{{$t('theming-page-subtitle')}}</p>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-card
            class="mb-2 theming-content"
          >
            <v-card-text>
              <p>{{$t('theming-page-tip')}}</p>
              <theming-selector
                v-if="Object.keys(customTheme).length > 0"
                v-on:modified="setNewTheme"
                v-on:logoChanged="setNewLogo"
                :customTheme="customTheme"
              />
            </v-card-text>
            <v-card-actions class="mt-7 mb-1">
              <v-btn
                id="save-theme"
                :disabled="Object.keys(newTheme).length === 0"
                class="ml-3"
                color="primary"
                depressed
                @click="saveNewTheme(newTheme)"
              >
                <span class="d-none d-sm-inline">{{$t('theming-page-save')}}</span>
                <span class="d-inline d-sm-none">{{$t('save')}}</span>
              </v-btn>
              <span class="mx-4">{{$t('theming-page-save-or')}}</span>
              <v-btn
                id="save-default-theme"
                color="primary"
                depressed
                @click="applyDefaultTheme()"
                :disabled="customTheme.themeType === 'DEFAULT_THEME'"
              >
                <span class="d-none d-sm-inline">{{$t('theming-page-apply-default')}}</span>
                <span class="d-inline d-sm-none">{{$t('theming-page-apply-default-sm')}}</span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import themingComponent from "../../components/theming/theming-selector";
import { pSBC } from "../../mixins/colorModifier";
import { mapActions, mapGetters } from 'vuex';

export default {
  name: "Theming",
  mixins: [pSBC],
  components: {
    "theming-selector": themingComponent
  },
  data() {
    return {
      setPreview: false,
      customTheme: {},
      newTheme: {},
      logo: null,
      saved: false
    }
  },
  beforeRouteLeave: function(to, from, next) {
    //if the user leave the page without saving changes
    if(!this.saved)
      this.applyCustom();
      next();
  },
  computed:{
    ...mapGetters('layout', ['getTheme']),
    ...mapGetters('organization', ['orgSelected']),
  },
  mounted(){
    this.fetchTheme();
  },
  methods: {
      ...mapActions('layout', ['updateCustomTheme', 'getCustomTheme', 'removeTheme']),
    
    async fetchTheme(){
      this.customTheme = await this.getTheme;
      if (!this.customTheme.colorSettings.info) {
        this.customTheme.colorSettings.info = this.$vuetify.theme.themes.light.info;
      }
    },
    
    applyColor(theme){
      this.$vuetify.theme.themes.light.primary = theme.colorSettings.primary;
      this.$vuetify.theme.themes.light.secondary = theme.colorSettings.secondary;
      this.$vuetify.theme.themes.light.primaryLight = theme.colorSettings.primaryLight;
      this.$vuetify.theme.themes.light.info = theme.colorSettings.info;
    },

    async applyDefaultTheme() {
      try{
        await this.removeTheme({organizationUuid: this.orgSelected});
        await this.getCustomTheme({organizationUuid: this.orgSelected});
        await this.fetchTheme();
        this.applyColor(this.customTheme);
        this.saved = true;
        this.$toasted.show(this.$t('theming-page-deafult-applied'), { 
          position: "bottom-right",
          className: ['toast-success'], 
          duration : 1500
        });
      }catch (error) {
        this.$toasted.show(error.data.message, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
      }
    },

    applyCustom(){
      this.applyColor(this.customTheme);
    },

    async saveNewTheme(theNewTheme) {
      try{
        if(Object.keys(theNewTheme).length > 0){
          await this.updateCustomTheme({organizationUuid: this.orgSelected, newTheme: theNewTheme});
          await this.fetchTheme();
          this.applyColor(this.customTheme);
          this.saved = true;
          this.newTheme = {};
          this.$toasted.show(this.$t('theming-page-saved'), { 
            position: "bottom-right",
            className: ['toast-success'], 
            duration : 1500
          });
        }
      }catch (error) {
        this.$toasted.show(error.data.message, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
      }
    },

    setNewTheme(theme) {
      this.$set(this.newTheme, 'colorSettings', theme);
    },

    setNewLogo(file, img){
      this.$set(this.newTheme, img, file);
    }
  }
};
</script>
<style lang="scss" scoped>
  .theming-content {
    height: calc(100vh - 275px);
    overflow-y: auto;
  }
  @media (max-width: 768px){
    .theming-content {
      height: auto;
    }
    #themingPage .custom-card{
      height: auto;
    }
  }
</style>