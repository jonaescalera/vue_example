<template>
      <v-col class="ma-0 pa-0 pl-6 mt-3 mb-3" :cols="cols || 4">
        <v-text-field 
          style="box-shadow: none;"
          :id="id ? id : 'search-bar-textfield'"
          clearable
          v-on:click:clear="onClearClicked"
          v-on:click:prepend-inner="onEnter"
          hide-details
          solo
          dense
          background-color="#f1f3f4"
          prepend-inner-icon="mdi-magnify"
          v-on:keyup.enter="onEnter"
          :placeholder="placeholder || $t('assets-page-search-placeholder')" 
          v-model="searchWord"
          @keyup="onSearchBarKeyUp"
          :disabled="disabled"
        ></v-text-field>
      </v-col> 
</template>

<script>
  export default {
    data() {
      return {
        searchWord: this.defaultSearchText || ''
      }
    }, 
    props: ['placeholder', 'id', 'disabled', 'cleanText', 'cols', 'searchText', 'notEncodedText', 'defaultSearchText'],
    watch:{
      searchText(search) {
        this.searchWord = search; 
      },
      cleanText(){
        this.searchWord = '';
      }
    },
    methods: {
      onClearClicked(){
        this.$emit("searchText", '');
        this.$emit("clearClicked");
      },
      onEnter(ev) {
        if (this.notEncodedText) {
          this.$emit("searchText", this.searchWord);
        } else {
          this.$emit("searchText", encodeURIComponent(this.searchWord));
        }
      },
      onSearchBarKeyUp() {
        this.$emit('onSearchBarKeyUp', this.searchWord)
      }
    }
  }
</script>