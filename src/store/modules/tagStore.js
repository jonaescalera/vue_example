import { listToMap, populateFromMap } from '../../utils/map';
import { sortByValue } from '../../utils/localeCompare';
import i18n from '../../i18n';

import TagService from '../../services/tag';
import FiltersService from '../../services/filters';

const namespaced = true;
//TODO remove categories/groups and use from their store
const state = {
  tags: [],
  mapTags: [],
  mapTagsScroll: null,
  totalRows: 0,
  filteredTotalRows: 0,
  categories: [],
  groups: [],
  history: [],
  filters: [],
  resetTags: false
}

const mutations = {
  setCategories(state, categories) {
    state.categories = categories.sort(sortByValue);
  },
  setGroups(state, groups) {
    state.groups = groups.sort(sortByValue);
  },
  setTags(state, tags) {
    state.tags = tags;
    state.totalRows = tags.total;
  },
  setMapTags(state, tags) {
    state.mapTags = tags;
    state.totalRows = tags.total;
  },
  clearMapTags(state){
    state.mapTags = [];
  },
  setMapTagsScroll(state, scroll){
    state.mapTagsScroll = scroll;
  },
  setTotal(state, total) {
    state.totalRows = total;
  },
  setFilteredTotal(state, total) {
    state.filteredTotalRows = total;
  },
  setHistory(state, history) {
    state.history = history;
  },
  clearTags(state) {
    state.tags = [];
    state.filteredTotalRows = 0;
  },
  clearFilters(state){
    state.filters = [
      { 
        name: i18n.t('area'), 
        field: "areaId",
        filterPrefix: 'eq',
        filterValue: 'id',
        cols: '6',
        options: [],
        optionsLoaded: false
      },
      { 
        name: i18n.t('zone'), 
        field: "zoneName",
        filterPrefix: 'eq',
        cols: '6',
        options: [],
        optionsLoaded: false
      },
      {
        name: i18n.t('location'), 
        field: "locationName",
        filterPrefix: 'eq',
        cols: '6',
        options: [],
        optionsLoaded: false
      },
      { 
        name: i18n.t('category'), 
        field: "categoryName",
        filterPrefix: 'eq',
        cols: '6',
        options: [],
        optionsLoaded: false
      },
      { 
        name: i18n.t('group'), 
        field: "groupName",
        filterPrefix: 'eq',
        cols: '6',
        options: [],
        optionsLoaded: false
      }      
    ];
  },
  setAreaFilters(state, areas){
    areas = areas.sort(sortByValue);
    let aux = state.filters.find(f => f.field === 'areaId');
    aux.options = areas;
    aux.optionsLoaded = true;
  },
  setLocationFilters(state, locations){
    locations = locations.sort(sortByValue);
    let aux = state.filters.find(f => f.field === 'locationName');
    aux.options = locations;
    aux.optionsLoaded = true;
  },
  setZoneFilters(state, zones){
    zones = zones.sort(sortByValue);
    let aux = state.filters.find(f => f.field === 'zoneName');
    aux.options = zones;
    aux.optionsLoaded = true;
  },
  setCategoryFilters(state, data){
    let aux = state.filters.find(f => f.field === 'categoryName');
    if(!aux){ return }
    if(aux.optionsLoaded){
      aux.options = data.filters.sort(sortByValue);  
    }else{
      aux.options = data.filters.sort(sortByValue);
      aux.optionsLoaded = true;
      aux.name = data.siteLabels && data.siteLabels.category ? data.siteLabels.category : i18n.t('category');
    }
  },
  setGroupFilters(state, data){
    let aux = state.filters.find(f => f.field === 'groupName');
    if(!aux){ return }
    if(aux.optionsLoaded){
      aux.options = data.filters.sort(sortByValue);  
    }else{
      aux.options = data.filters.sort(sortByValue);
      aux.optionsLoaded = true;
      aux.name = data.siteLabels && data.siteLabels.group ? data.siteLabels.group : i18n.t('group');
    }
  },
  setResetTags(state, reset){
    state.resetTags = reset;
  }
}

const getters = {
  tags: (state) => state.tags,
  populatedTags: (state, getters, rootState, rootGetters) => {
    const locations = rootGetters['location/locations'];
    const locationsMap = listToMap(locations, 'macAddress');
    const mappedTags = populateFromMap(state.mapTags, 'location', locationsMap, 'macAddress');
    return mappedTags;
  },
  totalRows: (state) => state.totalRows,
  filteredTotalRows: (state) => state.filteredTotalRows,
  filters: (state) => state.filters,
  categories: (state) => state.categories,
  groups: (state) => state.groups,
  getResetTags: (state) => state.resetTags,
  getMapTags: (state) => state.mapTags,
  getMapTagsScroll: (state) => state.mapTagsScroll
}

const actions = {
  clearFilters({commit}) {
    commit('clearFilters');
  },
  async getTags({ commit, getters, state }, params) {
    try {
      const response = await TagService.getTagsBySite(params);
      if(getters.getResetTags){//some filter was applied
        commit('clearTags');
        commit('clearMapTags');
        commit('setMapTags', response.tags);//save first page for list
        if(params.indoor){
          commit('setTags', response.tags.slice(0, params.pagination.size));//save first page for grid
        }else{
          commit('setTags', response.tags);//save first page for grid
        }
        commit('setResetTags', false);
        commit('setMapTagsScroll', null);
      }else{
        if(params.fromMap){
          commit('setMapTags', response.tags);
        }else{
          commit('setTags', response.tags);
          if(params.newSorting){
            commit('clearMapTags');
            if(params.pagination.page === 1){
              commit('setMapTags', response.tags);//save first page for list
            }else{
              const response = await TagService.getTagsBySite(params, true);
              commit('setMapTags', response.tags);//save first page for list
            }
          }else{
            if(params.refresh){//means that a tag edition or deletion was done
              commit('clearMapTags');
              if(params.mapPagination.page !== params.pagination.page){
                let copiedParams = JSON.parse(JSON.stringify(params));
                copiedParams.pagination.size = params.mapPagination.size;//(Math.floor(state.mapTags.length/params.pagination.size) + 1) * params.pagination.size;
                copiedParams.pagination.page = params.mapPagination.page;
                const responseList = await TagService.getTagsBySite(copiedParams);
                commit('setMapTags', responseList.tags);//refresh tags for list
              }else{
                commit('setMapTags', response.tags);//refresh tags for the list using the same result for the grid
              }
              
            }
          }
        }
      }
      commit('setTotal', response.total);
      commit('setFilteredTotal', response.filteredTotal);      
      return response;
    } catch (e) {
      commit('setTags', []);
      commit('setTotal', 0);
      commit('setFilteredTotal', 0);
      if (e.data && e.data.message) {
        throw new Error(e.data.message);
      } else {
        throw new Error(i18n.t("something-went-wrong"));
      }
    }
  },
  async getAF3TagsInArea({}, data){
    try {
      const response = await TagService.getAF3TagsInArea(data);
      return response;
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'), e);
    }
  },
  async getTag({rootGetters}, tagId){
    try {
      const response = await TagService.getTagById(tagId);
      const locations = rootGetters['location/locations'];
      const locationsMap = listToMap(locations, 'macAddress');
      const mappedTags = populateFromMap([response], 'location', locationsMap, 'macAddress');
      return mappedTags[0];
    } catch (e) {
      if (e.data && e.data.message) {
        throw new Error(e.data.message);
      } else {
        throw new Error(i18n.t("something-went-wrong"));
      }
    }
  },
  async getTagsUrl({}, url){
    try{
      const data = await TagService.getTagsUrl(url);
      return data;
    } catch(e) {
      if (e.data && e.data.message) {
        throw new Error(e.data.message);
      } else {
        throw new Error(i18n.t("something-went-wrong"));
      }
    }
  },
  async createTag({}, {device}) {
    try {
      const resp = await TagService.createTag(device);
      return resp;
    } catch (e) {
      if (e.status === 409 && e.data && e.data.description === 'Already Exists') {
        return e;
      }
      if (e.data && e.data.message) {
        throw new Error(e.data.message);
      } else {
        throw new Error(i18n.t("something-went-wrong"));
      }
    }
  },
  async editTag({}, {device}) {
    try {
      const resp = await TagService.editTag(device);
      return resp;
    } catch (e) {
      if (e.data && e.data.message) {
        throw new Error(e.data.message);
      } else {
        throw new Error(i18n.t("something-went-wrong"));
      }
    }
  },
  async deleteTag({}, {device}) {
    try {
      const resp = await TagService.deleteTag(device);
      return resp;
    } catch (e) {
      if (e.data && e.data.message) {
        throw new Error(e.data.message);
      } else {
        throw new Error(i18n.t("something-went-wrong"));
      }
    }
  },
  async getTagsFilters({ commit, dispatch, rootGetters }, { siteId }){
    const currentSiteLabels = rootGetters['site/currentSite']?.assetInfo?.metadata?.props?.labels;
    // all that in future will be just one API call, which will be returning the filter JSON
    // TODO replace all that for just one API call
    let filterCategories = FiltersService.getFilterCategories(siteId, true);
    let filterGroups = FiltersService.getFilterGroups(siteId, true);

    try {
      commit('setCategories', await filterCategories);
      commit('setCategoryFilters', {filters: await filterCategories, siteLabels: currentSiteLabels});
    } catch (error) {
      console.error(error);  
    }
    
    try{
      commit('setGroups', await filterGroups);
      commit('setGroupFilters', {filters: await filterGroups, siteLabels: currentSiteLabels});
    } catch (error) {
      console.error(error);  
    }
  },
  
  async getTagHistory({ commit }, params) {
    try {
      const response = await TagService.getHistory(params)

      let geodata = {
        type: 'FeatureCollection',
        features: []
      };
      let listData = [];
      let lastLocationChangeEvent = {};

      response.forEach((event, index) => {
        const isLocationChangeEvent = !!event.longitude; 
        if (isLocationChangeEvent) {
          // Last available location to be used with heartbeat event
          lastLocationChangeEvent = event;
        }

        const eventWithLocation = isLocationChangeEvent ? event : lastLocationChangeEvent;

        if (eventWithLocation.latitude) {
          geodata.features.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [eventWithLocation.longitude, eventWithLocation.latitude]
            },
            properties: {
              id: index,
              time: event.time,
              etype: eventWithLocation.etype.toLowerCase(),
              description: `<p style="color:black;">Date ${event.time.toLocaleDateString()}</p>
              <p style="color:black;">Time ${event.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>`
            }
          });

          listData.push({
            id: index,
            d: new Date(event.time).getTime(),
            source: isLocationChangeEvent ? eventWithLocation.etype.toLowerCase() : 'heartbeat',
            coordinates: [eventWithLocation.longitude, eventWithLocation.latitude]
          });
        }
      });

      return {
        historyGeoJson: geodata,
        historyEventsList: listData 
      };
    } catch (e) {
      if (e.data && e.data.message) {
        throw new Error(e.data.message);
      } else {
        throw new Error(i18n.t("something-went-wrong"));
      }
    }
  },
  async exportAllTags({}, params){
    try {
      const response = await TagService.exportAllTags(params);
      return response;
    }catch(e){
      if (e.data && e.data.message) {
        throw new Error(e.data.message);
      } else {
        throw new Error(i18n.t("something-went-wrong"));
      }
    }
  }
}

export default {
  namespaced,
  state,
  mutations,
  getters,
  actions
}