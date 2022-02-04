<template>
  <div>
    <v-dialog v-model="dialog" @click:outside="closeModal" @keydown.esc="closeModal" width="600" scrollable>
      <v-card id="areaEdit">
        <v-card-title v-if="modalMode === 'create'" class="secondary">{{$t('add-area')}}</v-card-title>
        <v-card-title v-if="modalMode === 'edit'" class="secondary">{{$t('edit-area')}}</v-card-title>
        <v-card-text class="card-text">
          <v-form @submit.stop.prevent="handleSubmit" id="areaEditForm">
            <v-row justify="center">
              <v-col cols="12">
                <!-- name -->
                <v-text-field
                  :label="$t('name')"
                  tabindex="1"
                  :dense="true"
                  v-model="form.name"
                  outlined
                  :error-messages="nameErrors"
                  @input="$v.form.name.$touch()"
                  @blur="$v.form.name.$touch()"
                  color="secondary"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row justify="center">
              <v-col cols="12">
                <!-- site -->
                <v-text-field
                  :label="$t('site')"
                  :dense="true"
                  disabled
                  v-model="form.site.value"
                  outlined
                  color="secondary"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="!isAf3">
              <v-col class="negative-mt" cols="12">
                <v-radio-group :disabled="modalMode === 'edit'" v-model="form.areaType">
                  <v-row class="ml-1">
                    <v-col>
                      <v-radio :label="$t('indoor')" :value="'indoor'" color="secondary"></v-radio>
                    </v-col>
                    <v-col>
                      <v-radio :label="$t('outdoor')" :value="'outdoor'" color="secondary"></v-radio>
                    </v-col>
                  </v-row>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row v-if="modalMode === 'edit' && isAf3">
              <v-col>
               <v-btn
                  id="areaSubmitBtn"
                  depressed
                  color="secondary"
                  @click="openFloorPlan"
                  class="px-8 float-right">{{ $t('edit-reference-points') }}</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-col class="ma-auto" cols="12">
            <v-btn
              id="areaSubmitBtn"
              depressed
              color="secondary"
              tabindex="3"
              @click="handleSubmit"
              class="px-8 float-right"
            ><span v-if="modalMode === 'edit'">{{$t('save')}}</span><span v-if="modalMode === 'create'">{{$t('next')}}</span></v-btn>
            <v-btn
              v-if="modalMode === 'edit' && form.areaType === 'outdoor'"
              depressed
              color="secondary"
              tabindex="3"
              @click="handleEditOutdoorArea"
              class="float-left"
            >{{$t('edit-area-polygon')}}</v-btn>
            <v-btn
              v-if="modalMode === 'edit' && (form.areaType === 'indoor' || form.areaType === 'airfinder3')"
              depressed
              color="secondary"
              tabindex="3"
              @click="handleEditImage"
              class="float-left"
            >{{$t('edit-area-image')}}</v-btn>
            <v-btn
              text
              color="secondary"
              tabindex="3"
              @click="closeModal"
              class="px-8 mr-2 float-right"
            >{{$t('cancel')}}</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <indoor-area-image-upload :backBtn="true" @onBackHandler="openModal" @areaCreatedEdited="areaCreated" :area="form" :modalMode="modalMode" ref="imageUpload" />
    <outdoor-area-polygon-upload :backBtn="true" @onBackHandler="openModal" @areaCreatedEdited="areaCreated" :area="form" :modalMode="modalMode" ref="mapPolygonUpload" />
    <edit-floor-plan-data :backBtn="true" @onBackHandler="openModal" ref="floorPlanData" :mode="modalMode"></edit-floor-plan-data>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { mapActions } from 'vuex';
import UploadImageArea from './indoor-area-image-upload';
import UploadMapPolygonArea from './outdoor-area-polygon-upload';
import EditFloorPlanData from './floor-plan-data';

const AF3 = 'airfinder3';

export default {
  components: {
    'indoor-area-image-upload': UploadImageArea,
    'outdoor-area-polygon-upload': UploadMapPolygonArea,
    EditFloorPlanData
  },
  data() {
    return {
      dialog: false,
      isAf3: false,
      form: {
        name: '',
        areaType: 'indoor',
        id: '',
        polygon: null,
        site: {},
        zones: []
      },
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      name: {
        required,
    },
      id: '',
    },
  },
  props: ['modalMode'],
  computed: {
    nameErrors() {
      const errors = [];
      if (!this.$v.form.name.$dirty) return errors;
      !this.$v.form.name.required &&
        errors.push(this.$t('error-name-required'));
      return errors;
    }
  },
  methods: {
    ...mapActions('area', ['editArea']),
    openModal(area, site) {
      this.isAf3 = false;
      if ((site && site.isAf3) || (area && area.site && area.site.isAf3)) {
        this.form.areaType = AF3;
        this.isAf3 = true;
      }
      this.dialog = true;
      this.$v.form.$reset();
      if (site) {
        this.$set(this.form, 'site', site);
      }
      if (area) {
        Object.assign(this.form, {
          name: area.name,
          id: area.id,
          indoorMapping: area.indoorMapping,
          polygon: area.polygon,
          areaType: area.areaLocation || area.areaType,
          zones: area.zones
        });
      } else {
        Object.assign(this.form, {
          name: '',
          id: '',
          areaType: this.isAf3 ? AF3 : 'indoor'
        });
      }
    },
    handleCreateArea() {
      this.$v.$touch();
      if (this.$v.form.$anyError) {
        return;
      }
      if (this.form.areaType === 'indoor') {
        this.$refs.imageUpload.openModal();
      } else if(this.form.areaType === 'outdoor') {
        this.$refs.mapPolygonUpload.openModal();
      } else if(this.form.areaType === AF3) {
        this.$refs.imageUpload.openModal();
      }
      this.dialog = false;
    },
    handleEditImage() {
      this.$refs.imageUpload.openModal(this.form);
    },
    areaCreated(area) {
      this.$emit('areaCreatedEdited', area)
      this.dialog = false;
    },
    handleSubmit() {
      if (this.modalMode === 'create') {
        this.handleCreateArea();
      } else if (this.modalMode === 'edit') {
        this.hadleEditArea();
      }
    },
    handleEditOutdoorArea() {
      this.$v.$touch();
      if (this.$v.form.$anyError) {
        return;
      }
      this.$refs.mapPolygonUpload.openModal();
      this.closeModal();
    },
    async hadleEditArea() {
      this.$v.$touch();
      if (this.$v.form.$anyError) {
        return;
      }
      try {
        let payload = {
          data: {
            name: this.form.name,
          },
          id: this.form.id,
        };
        const editedArea = await this.editArea(payload);
        this.$toasted.show(this.$t('area-edited'), {
          position: 'bottom-right',
          className: ['toast-success'],
          duration: 2000,
        });
        this.closeModal();
        this.$emit('areaCreatedEdited', editedArea)
      } catch (error) {
        this.$toasted.show(error, {
          position: 'bottom-right',
          className: ['toast-error'],
          duration: 5000,
        }); 
        throw new Error('Something went wrong', e);
      }
    },
    closeModal() {
      this.dialog = false;
    },
    openFloorPlan(){
      this.$refs.floorPlanData.openModal(this.form);
    }
  },
};
</script>

<style scoped>
#areaEditForm {
  padding-top: 2rem;
}
.negative-mt {
  margin-top: -20px;
  margin-bottom: -19px;
}
.card-text {
  min-height: 260px;
}
.airfinder3-slide-enter-active, .airfinder3-slide-leave-active {
  transition: height .5s
}
.airfinder3-slide-enter, .airfinder3-slide-leave-to {
  height: 0px
}
</style>