import i18n from '../../i18n';
import SupertagService from '../../services/supertag';
import { sortByLabel } from '../../utils/localeCompare';

const namespaced = true;
const state = {
  initialSupertag: null
}
const mutations = {
  setInitialSupertag(state, supertag) {
    state.initialSupertag = supertag;
  },
  clearInitialSupertag(state){
    state.initialSupertag = null;
  }
}
const getters = {
  getInitialSupertag: (state) => {
    return state.initialSupertag;
  }
};
const actions = {
    async getSupertags({ commit }, siteId) {
      try {
        const response = await SupertagService.getSupertagsBySite(siteId);
        return response.data.sort(sortByLabel);
      } catch (e) {
        throw e.data.message;
      }
    },
    async getSupertag({ commit }, supertagId) {
        try {
          const response = await SupertagService.getSupertag(supertagId);
          return response;
        } catch (e) {
          throw new Error(i18n.t('something-went-wrong'));
        }
    },
    async getSupertagCurrentData({ commit }, supertagId){
      try {
        const response = await SupertagService.getSupertagCurrentData(supertagId);
        return response;
      } catch (e) {
        throw new Error(i18n.t('something-went-wrong'));
      }
    },

    async saveSupertag({ commit }, supertag){
      try {
        const response = await SupertagService.saveSupertag(supertag);
        return response;
      } catch (e) {
        throw e;
      }
    },

    setSupertagForSettings({commit}, supertag){
        commit('setInitialSupertag', supertag);
    },

    clearInitialSupertag({commit}){
      commit('clearInitialSupertag');
    }
}

export default {
    namespaced,
    state,
    getters,
    actions,
    mutations
}