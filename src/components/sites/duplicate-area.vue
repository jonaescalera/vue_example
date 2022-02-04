<template>
    <v-dialog v-model="duplicateAreaDialog" @click:outside="closeModal" @keydown.esc="closeModal" width="50vw">
      <v-card id="duplicateAreaModal">
        <v-card-title class="secondary">
          <div class="ml-2">
            {{$t('site')}}:
            <b>{{ siteName }}</b>
          </div>
        </v-card-title>
        <v-card-text class="pb-0">
           <v-form @submit.stop.prevent="handleSave" id="duplicateAreaForm">
            <v-row class="mt-4" justify="center">
              <v-col cols="12">
                <!-- name -->
                <v-text-field
                  :label="$t('name')"
                  :dense="true"
                  v-model="form.duplicateName"
                  outlined
                  :error-messages="duplicateNameErrors"
                  @input="$v.form.duplicateName.$touch()"
                  @blur="$v.form.duplicateName.$touch()"
                  color="secondary"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        
        <v-card-actions>
          <v-col cols="12">
            <v-btn
              id="duplicateAreaBtn"
              depressed
              color="secondary"
              @click="handleSave"
              class="px-8 float-right"
            >{{$t('save')}}</v-btn>
            <v-btn
              text
              id="duplicateAreaBtnCancel"
              color="secondary"
              @click="closeModal"
              class="px-8 float-right"
            >{{$t('cancel')}}</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      duplicateAreaDialog: false,
      original: null,
      siteName: '',
      image: null,
      af3Data: null,
      form: {
        duplicateName: ''
      },
    }
  },
  mixins: [validationMixin],
  validations() {
    return {
      form: {
        duplicateName: {
          required
        }
      }
    }
  },
  computed: {
    duplicateNameErrors() {
      const errors = [];
      if (!this.$v.form.duplicateName.$dirty) return errors;
      !this.$v.form.duplicateName.required &&
        errors.push(this.$t('error-name-required'));
      if (this.original.name === this.form.duplicateName) {
        errors.push(this.$t('error-name-different'));
      }  
      return errors;
    },
  },
  methods: {
    ...mapActions('area', ['createAreaIndoorMapping', 'getAreaIndoorFile', 'getAF3Points', 'saveAF3Points']),
    async openModal(area) {
      this.original = area;
      this.originalName = area.name;
      this.siteName = area.site.value;
      this.form.duplicateName = area.name;
      this.duplicateAreaDialog = true;
      this.getRefPoints(area);
      this.image = await this.getAreaIndoorFile({ areaId: area.id });
    },
    async handleSave() {
      this.$v.$touch();
       if (this.$v.form.$anyError || this.original.name === this.form.duplicateName) {
        return;
      }
      let newArea = {
        name: this.form.duplicateName,
        site: {
          id: this.original.site.id
        }
      }
      let params = {
        area: newArea,
        file: this.image.file[0]
      }
      try {
        let resp = await this.createAreaIndoorMapping(params);
        if (this.af3Data) {
          await this.setRefPoints(resp);
        }
        this.$toasted.show(this.$t('area-created'), {
          position: 'bottom-right',
          className: ['toast-success'],
          duration: 2000,
        });
        this.$emit('areaCreatedEdited', resp)
        this.closeModal();
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        });
      }
    },
    async getRefPoints(area) {
      try {
        this.af3Data = await this.getAF3Points( area.id );
      } catch (error) {
        this.$toasted.show(error.data.message, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
      }
    },
    async setRefPoints(newArea) {
      let data = {
        areaId: newArea.id,
        floorStartsAt: this.af3Data.floorStartsAt,
        originPoint: this.af3Data.originPointLat ? this.af3Data.originPointLat + ',' + this.af3Data.originPointLng : '',
        distancePoint1: this.af3Data.distancePoint1Lat ? this.af3Data.distancePoint1Lat + ',' + this.af3Data.distancePoint1Lng : '',
        distancePoint2: this.af3Data.distancePoint2Lat ? this.af3Data.distancePoint2Lat + ',' + this.af3Data.distancePoint2Lng: '',
        distance: this.af3Data.distance,
        mapDistance: this.af3Data.mapDistance,
      };
      try {
        await this.saveAF3Points(data);
      } catch (error) {
        this.$toasted.show(error.data.message, { 
          position: "bottom-right",
          className: ['toast-error'], 
          duration : 5000
        });
      }
    },
    closeModal() {
      this.original = null;
      this.image = null;
      this.$v.form.$reset();
      this.form.duplicateName = '';
      this.siteName = '';
      this.duplicateAreaDialog = false;
    }
  }
}
</script>

<style>

</style>