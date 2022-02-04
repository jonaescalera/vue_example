<template>
  <div class="vue-pincode-input-wrapper">
    <input
      v-for="(cell, index) in cells"
      :key="cell.key"
      :ref="`${baseRefName}${index}`"
      :value="cell.value"
      v-bind="$attrs"
      class="vue-pincode-input"
      :type="cellsInputTypes[index]"
      @focus="focusedCellIdx = index"
      @keydown.delete="onCellErase(index, $event)"
      @input="onInput(index, $event)"
      @paste="onPaste(index, $event)"
    >
  </div>
</template>

<script>
/**
 * This comonpent is a slightly modified version of
 * https://github.com/Seokky/vue-pincode-input
 * 
 * Have added support for Alphanumeric Input instead of just Numeric input
 * And also added formatting to convert all typed input into Uppercase
 */
const BASE_REF_NAME = 'vue-pincode-input';
const CELL_REGEXP = '^[a-zA-Z0-9]{1}$';
const DEFAULT_INPUT_TYPE = 'text';
const SECURE_INPUT_TYPE = 'password';

export default {
  name: "Vue-Pincode-Input",
  props: {
    value: {
      type: String,
      required: true,
    },
    length: {
      type: Number,
      default: 4,
    },
    autofocus: {
      type: Boolean,
      default: true,
    },
    secure: {
      type: Boolean,
      default: false,
    },
    characterPreview: {
      type: Boolean,
      default: true,
    },
    charPreviewDuration: {
      type: Number,
      default: 300,
    },
  },

  data: () => ({
    baseRefName: BASE_REF_NAME,
    focusedCellIdx: 0,
    cells: [],
    watchers: {},
    cellsInputTypes: {},
  }),

  computed: {
    pinCodeComputed() {
      return this.cells.reduce((pin, cell) => pin + cell.value.toUpperCase(), '');
    },
  },

  watch: {
    value(value) {
      if (value) {
        this.onParentValueUpdated();
      } else {
        this.reset();
      }
    },

    length() {
      this.reset();
    },

    pinCodeComputed(val) {
      this.$emit('input', val);
    },
  },

  mounted() {
    this.init();
    this.onParentValueUpdated();

    if (this.autofocus) {
      this.$nextTick(this.focusCellByIndex);
    }
  },

  methods: {
    /* init stuff */

    init() {
      const inputType = this.getRelevantInputType();
      for (let key = 0; key < this.length; key += 1) {
        this.setCellObject(key);
        this.setCellInputType(key, inputType);
        // Todo: remove the commented line below completely once NEX-2679 is fully resolved
        // this.setCellWatcher(key);
      }
    },

    setCellObject(key) {
      this.$set(this.cells, key, { key, value: '' });
    },

    setCellInputType(index, inputType = SECURE_INPUT_TYPE) {
      this.$set(this.cellsInputTypes, index, inputType);
    },

    setCellWatcher(index) {
      const watchingProperty = `cells.${index}.value`;

      this.watchers[watchingProperty] = this.$watch(
        watchingProperty,
        (newVal, oldVal) => this.onCellChanged(index, newVal, oldVal),
      );
    },

    /* handlers */

    onParentValueUpdated() {
      if (this.value.length !== this.length) {
        this.$emit('input', this.pinCodeComputed);
        return;
      }

      this.value
        .split('')
        .forEach((cell, idx) => {
          this.cells[idx].value = cell || '';
        });
    },

    onInput(index, event) {
      const oldVal = this.cells[index].value;
      const newVal = event.data;
      this.cells[index].value = newVal;
      this.onCellChanged(index, newVal, oldVal)
    },

    onCellChanged(index, newVal, oldVal) {
      if (!this.isTheCellValid(newVal, false)) {
        this.cells[index].value = '';
        return;
      }

        // setTimeout(() => {

        this.cells[index].value = newVal.toUpperCase();
        // }, 5000);


        this.focusNextCell();

        /* performing character preview if it's enabled */
        if (this.secure && this.characterPreview) {
          setTimeout(this.setCellInputType, this.charPreviewDuration, index);
        }
    },

    onPaste(index, event) {
      let pastedText;
      if (window.clipboardData && window.clipboardData.getData) { // IE
        pastedText = window.clipboardData.getData('Text');
      } else if (event.clipboardData && event.clipboardData.getData) {
        pastedText = event.clipboardData.getData('text/plain');
      }
      pastedText = pastedText && pastedText.trim() && pastedText.toUpperCase();
      if (pastedText) {
        this.fillFields(index, pastedText);
      }
      event.preventDefault();
    },

    fillFields(startIndex, input) {
      let currentFieldIndex = startIndex;
      for (let i = 0; i < input.length && currentFieldIndex < this.length; i++) {
        const currentChar = input[i];
        if (this.isTheCellValid(currentChar, false)) {
          this.cells[currentFieldIndex].value = currentChar;
          currentFieldIndex++;
        }
      }
      if (currentFieldIndex !== startIndex) {
        this.clearCells(currentFieldIndex);
        this.focusCellByIndex(
          currentFieldIndex < this.length ? currentFieldIndex : this.length - 1);
      }
    },

    clearCells(index) {
      this.cells.slice(index).forEach((cell) => cell.value = '');
    },

    onCellErase(index, e) {
      const isThisCellFilled = this.cells[index].value.length;

      if (!isThisCellFilled) {
        this.focusPreviousCell();
        e.preventDefault();
      }
    },

    /* reset stuff */

    reset() {
      this.unwatchCells();
      this.init();
      this.focusCellByIndex();
    },

    unwatchCells() {
      const watchers = Object.keys(this.watchers);
      watchers.forEach(name => this.watchers[name]());
    },

    /* helpers */

    isTheCellValid(cell, allowEmpty = true) {
      if (!cell) {
        return allowEmpty ? cell === '' : false;
      }

      return !!cell.match(CELL_REGEXP);
    },

    getRelevantInputType() {
      return this.secure && !this.characterPreview
        ? SECURE_INPUT_TYPE
        : DEFAULT_INPUT_TYPE;
    },

    focusPreviousCell() {
      if (!this.focusedCellIdx) return;

      this.focusCellByIndex(this.focusedCellIdx - 1);
    },

    focusNextCell() {
      if (this.focusedCellIdx === this.length - 1) return;

      this.focusCellByIndex(this.focusedCellIdx + 1);
    },

    focusCellByIndex(index = 0) {
      const ref = `${this.baseRefName}${index}`;
      const el = this.$refs[ref][0];

      el.focus();
      el.select();

      this.focusedCellIdx = index;
    },
  },
};
</script>

<style>
.vue-pincode-input-wrapper {
  display: inline-flex;
}

.vue-pincode-input {
  outline: none;
  margin: 3px;
  padding: 5px;
  max-width: 40px;
  text-align: center;
  font-size: 1.1rem;
  border: none;
  border-radius: 3px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
}

.vue-pincode-input:focus {
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
}
</style>
