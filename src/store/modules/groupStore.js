import GroupService from '../../services/group';
import i18n from '../../i18n'

const namespaced = true;

const state = {
  groups: []
}

const mutations = {
  // TODO this should be uncommented and removed from tag store. The service call should be initialized from here when the app starts
  // setGroups(state, groups) {
  //   state.groups = groups;
  // }
}

const getters = {
  groups: (state) => state.groups,
}

const actions = {
  async getGroups({ commit }, { siteId }) {    
    try {
      const response = await GroupService.getGroups(siteId);
      commit('tag/setGroups', response, { root: true });
      commit('tag/setGroupFilters', { filters: response }, { root: true });
      return response;
    } catch (e) {      
      let msg = e && e.data && e.data.message;
      throw new Error(msg || i18n.t("something-went-wrong"));
    }
  },
  async editGroup({ }, { groupId, group }) {    
    try {
      const response = await GroupService.editGroup(groupId, group);
      return response;
    } catch (e) {      
      let msg = e && e.data && e.data.message;
      throw new Error(msg || i18n.t("something-went-wrong"));
    }
  },
  async createGroup({ }, { group }) {    
    try {
      const response = await GroupService.createGroup(group);
      return response;
    } catch (e) {      
      let msg = e && e.data && e.data.message;
      throw new Error(msg || i18n.t("something-went-wrong"));
    }
  },
  async deleteGroup({ }, { groupId }) {    
    try {
      const response = await GroupService.deleteGroup(groupId);
      return response;
    } catch (e) {
      let msg = e && e.data && e.data.message;
      throw new Error(msg || i18n.t("something-went-wrong"));
    }
  },
}

export default {
    namespaced,
    state,
    getters,
    mutations,
    actions
}