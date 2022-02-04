import i18n from '../../i18n';
import statusService from '../../services/status';

const namespaced = true;

const state = {
  networkConnection: [],
};

const mutations = {
  setNetworkConnectionStatus(state, status) {
    state.networkConnection = status;
  },
};

const getters = {
  networkConnectionStatus: (state) => state.networkConnection,
};

const actions = {
  async getNetworkConnectionStatus({ commit }, siteId) {
    commit('setNetworkConnectionStatus', []);
    try {
      const status = await statusService.getNetworkConnectionStatus(siteId);
      commit('setNetworkConnectionStatus', status);
      return status;
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'), e);
    }
  },
};

export default {
  namespaced,
  state,
  mutations,
  getters,
  actions,
};
