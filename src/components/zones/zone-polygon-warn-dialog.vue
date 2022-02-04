<template>
  <div>
    <v-dialog v-model="dialog" width="300" persistent>
      <v-card>
        <v-card-title class='headline'>{{$t('unsaved-changes')}}</v-card-title>
        <v-card-text v-if="!invalidPolygon" class="mt-3">{{$t('zones-unsaved', {name : zoneName})}}</v-card-text>
        <v-card-text v-if="invalidPolygon" class="invalid-polygon">{{$t('invalid-polygon-must-undo')}}</v-card-text>
        <v-form v-if="!invalidPolygon" @submit.stop.prevent="save" id="zoneNameEditFormWarn">
              <v-text-field
                ref="zoneNameInput"
                :label="$t('name')"
                tabindex="1"
                :dense="true"
                v-model="form.name"
                outlined
                class="zone-name"
                :error-messages="nameErrors"
                @input="$v.form.name.$touch()"
                @blur="$v.form.name.$touch()"
                color="secondary"
              ></v-text-field>
            </v-form>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn v-if="!invalidPolygon" text color="secondary" @click="save" class="primary--text font-weight-bold">{{$t('save')}}</v-btn>
            <v-btn color="secondary" depressed @click="undo" class="font-weight-bold">{{$t('undo')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
export default {
  data() {
    return {
      dialog: false,
      form: {
        name: '',
      },
    }
  },
  mixins: [validationMixin],
  validations: {
    form: {
      name: {
        required,
      },
    },
  },
  computed: {
    nameErrors() {
      const errors = [];
      if (!this.$v.form.name.$dirty) return errors;
      !this.$v.form.name.required &&
        errors.push(this.$t('error-name-required'));
      return errors;
    },
  },
  props: ['zoneName', 'invalidPolygon'],
  methods: {
    cancel() {
      this.dialog = false;
    },
    openModal() {
      this.form.name = this.zoneName;
      this.dialog =  true;
    },
    save() {
      this.$v.$touch();
      if (this.$v.form.$anyError || this.invalidPolygon) {
        return;
      }
      this.$emit('save', this.form.name);
      this.dialog = false;
    },
    undo() {
      this.$emit('undo')
      this.dialog = false;
    }
  }
}
</script>

<style>
  .headline.v-card__title {
    height: 48px;
    font-size: 18px !important;
    font-weight: 600;
    color: #3B5762;
  }
  #zoneNameEditFormWarn {
    margin: 20px;
  }
</style>