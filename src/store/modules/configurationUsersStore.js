import UsersService from '../../services/users';
import i18n from '../../i18n'

const namespaced = true;

const state = {
    configurationUsers: []    
}

const getters = {
    users: state => {
        return state.configurationUsers;
    }
};

const mutations = {
    setConfigurationUsers: (state, data) => {
        state.configurationUsers = data;
    }
};

const actions = {
  async getConfigurationUsers({ commit }, { siteId }) {      
    let response;
    try {
      response = await UsersService.getConfigurationUsers(siteId);
      if (response.length > 0) {
        commit('setConfigurationUsers', response);
      }
    } catch (error) {      
      let msg = error && error.data ? error.data.message : i18n.t('something-went-wrong');
      throw new Error(msg);
    }
  },

  async getConfigurationOrgUsers({ commit }, { orgId }) {      
    let response;
    try {
      response = await UsersService.getConfigurationOrgUsers(orgId);
      if (response.length > 0) {
        commit('setConfigurationUsers', response);
      }
    } catch (error) {      
      let msg = error && error.data ? error.data.message : i18n.t('something-went-wrong');
      throw new Error(msg);
    }
  },

  async editConfigurationUser({ }, { data, userId }) {      
    let response;
    try {
      response = await UsersService.editConfigurationUser(userId, data);
    } catch (error) {
      let msg = error && error.data ? error.data.message : i18n.t('something-went-wrong');
      throw new Error(msg);
    }

  },
  async createConfigurationUser({ }, { data }) {      
    let response;
    try {
      response = await UsersService.createConfigurationUser(data);
    } catch (error) {
      if (error.data && error.status === 409) {
        throw new Error(error.data.message ? error.data.message : i18n.t('user-already-exists'));
      }
      let msg = error && error.data ? error.data.message : i18n.t('something-went-wrong');
      throw new Error(msg);
    }
  },
  async createOrgConfigurationUser({ }, { data }) {
    let response;
    try {
      response = await UsersService.createOrgConfigurationUser(data);
    } catch (error) {      
      if (error.data && error.status === 409) {
        throw new Error(error.data.message ? error.data.message : i18n.t('user-already-exists'));
      }
      let msg = error && error.data ? error.data.message : i18n.t('something-went-wrong');
      throw new Error(msg);
    }
  },
  async deleteConfigurationUser({ }, { userId }) {      
    let response;
    try {
      response = await UsersService.deleteConfigurationUser(userId);
    } catch (error) {
      let msg = error && error.data ? error.data.message : i18n.t('something-went-wrong');
      throw new Error(msg);
    }
  },
  async deleteConfigurationUsers({ }, { userIds }) {      
    let response;
    try {
      response = await UsersService.deleteConfigurationUsers(userIds);
    } catch (error) {
      let msg = error && error.data ? error.data.message : i18n.t('something-went-wrong');
      throw new Error(msg);
    }
  },
  async deleteConfigurationOrgUser({ }, { data }) {
    let response;
    try {
      response = await UsersService.deleteConfigurationOrgUsers(data);
    } catch (error) {
      let msg = error && error.data ? error.data.message : i18n.t('something-went-wrong');
      throw new Error(msg);
    }
  },
  async viewInviteLink({ }, { email, siteId, orgId }) {  
    let response;
    try {
      response = await UsersService.getInviteLink(email, siteId, orgId);
      return response;
    } catch (error) {
      let msg = error && error.data ? error.data.message : i18n.t('something-went-wrong');
      throw new Error(msg);
    }
  },
  async resendInviteLink({ }, { email }) {      
    let response;
    try {
      response = await UsersService.resendInviteLink(email);
      return response;
    } catch (error) {
      let msg = error && error.data ? error.data.message : i18n.t('something-went-wrong');
      throw new Error(msg);
    }
  }
};

export default {
  namespaced,
  state,
  getters,
  mutations,
  actions
};
