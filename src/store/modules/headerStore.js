const namespaced = true;

const state = {
    mapVisible: false
}

const getters = {
  getMapVisible: state => state.mapVisible
}

const mutations = {
  setMapVisible(state, value) {
    state.mapVisible = value;
  }
}
const actions = {
  toggleMapVisible({ commit }) {
    commit('setMapVisible', true);
  },
  toggleTableVisible({ commit }) {
    commit('setMapVisible', false);
  }
}

export default {
  namespaced,
  state,
  getters,
  mutations,
  actions
}