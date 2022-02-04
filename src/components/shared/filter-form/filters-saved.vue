<template>
	<v-row class="mb-3 filter-container float-left">
	  <v-col class="pt-0">
		  <div class="float-left filter-fav-label font-weight-bold text-ellipsis primary--text mt-3 pl-3" width="112">
			<v-icon small color="secondary" v-text="'mdi-star'"></v-icon>
        	{{$t('assets-page-saved-filters')}}
		  </div>
		  <div>
			  <v-sheet
				class="mx-auto"
				v-bind:width="width"
				> 
				<v-chip-group
					v-bind:mobile-breakpoint="iphone"
					multiple
					next-icon="mdi-chevron-double-right"
					prev-icon="mdi-chevron-double-left">
					<v-chip v-for="filter in filters" :key="filter.id"
					class="filter-chip primary--text"
					:class="{ 'filter-deselected': !filter.selected, 'v-chip--active': filter.selected}"
					:title="filter.name"
					@click="selectFilter(filter)">
					<span class="filter-name font-weight-bold mr-3 px-2">
						{{ filter.name }}   
					</span>
					<span @click="deleteFilter(filter)">
						<v-icon small class="mr-2" color="primary" v-text="'mdi-close-circle'"></v-icon>
					</span> 
					</v-chip>
				</v-chip-group>
				</v-sheet>
		  </div>
	  </v-col>
    </v-row>
</template>

<script>
	import constants from '../../../constants/resolutions-constants';
	import { mapGetters } from 'vuex';

	export default {
		props: [
			'filters',
			'width'
		],
		data() {
			return {
				iphone: constants.IPHONE_X,
				selectedFilter: null
			}
		},
		methods:{
			selectFilter(filter) {
		      if(this.selectedFilter){
					if(this.selectedFilter.id === filter.id){
						this.$set(filter, 'selected', false);
						this.selectedFilter = null;
					}else{
						this.$set(this.selectedFilter, 'selected', false)
						this.$set(filter, 'selected', true);
						this.selectedFilter = filter;
					}
		      }else{
		      	this.$set(filter, 'selected', true);
		      	this.selectedFilter = filter;
		      }
		      this.$emit('applyFilter', Object.assign({}, this.selectedFilter));
		    },
		    deleteFilter(filter){
				if(this.selectedFilter && this.selectedFilter.id === filter.id){//wants to remove the applied filter
					this.selectedFilter = null;
					this.$emit('applyFilter', Object.assign({}, this.selectedFilter));
				}
		    	this.$emit('deleteFilter', filter.id);
			},
			deselectFilter(){
				this.selectedFilter = null;
			}
		}
	}

</script>
<style lang="scss" scoped>
	.filter-deselected::before {
	opacity: 0;
	}

	.filter-container {
	  height: 40px;
	}
	.filter-fav-label {
	  font-size: 10px;
	  text-transform: uppercase;
	}
	.filter-name {
	  font-size: 10px;
	  text-transform: uppercase;
	}

	//custom vuetify chip
	.v-chip.v-size--default.filter-chip {
	  span:nth-child(2n) {
	    position: absolute;
	    right: -2px;
	    display: none;
	    i {
	      margin-bottom: 2px;
	    } 
	  }
	  span:hover {
	    span:nth-child(2n) {
	      display: block; 
	    }
	  }
	}
</style>