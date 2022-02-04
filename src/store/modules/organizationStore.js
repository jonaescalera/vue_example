import i18n from '../../i18n';
import OrganizationService from '../../services/organization';
import { ROLES } from '../../constants/roles'
import { sortByName } from '../../utils/localeCompare';

const namespaced = true;

const state = {
  organizations: [],
  countries: [],
  states: [],
  orgTypes: [],
  userRole: null,
  orgRoles: {
    superAdmin: false
  },
  isIndividualUser: undefined,
  orgSelectedId: null,
  orgSelectedName: null,
  addEditModalOpen: false,
  addEditModalOrg: null,
  siteUserOrgPubSettings: null
}

const mutations = {
  setOrganization(state, organizations) {
    state.organizations = organizations;
  },
  setOrganizationType(state, types) {
    state.orgTypes = types;
  },
  setCountries(state, countries) {
    state.countries = countries;
  },
  setStates(state, states) {
    state.states = states;
  },
  setSelectedOrganization(state, id) {
    state.orgSelectedId = id;
  },
  setSelectedOrganizationName(state, name) {
    state.orgSelectedName = name;
  },
  resetSelectedOrganization(state) {
    state.orgSelectedId = null;
    state.orgSelectedName = null;
  },
  setUserRole(state, data) {
    state.userRole = data;
  },
  setIsIndividualUser(state, data) {
    state.isIndividualUser = data;
  },
  setAddEditModalOpen(state, data) {
    state.addEditModalOpen = data;
  },
  setAddEditModalOrg(state, data) {
    state.addEditModalOrg = data;
  },
  setSiteUserOrgPubSettings(state, data){
    state.siteUserOrgPubSettings = data;
  },
  setIsOrgSuperAdmin(state, data) {
    state.orgRoles.superAdmin = data;
  }
};

const getters = {
  organizations: (state) => {
    return state.organizations.sort(sortByName);
  },
  countries: (state) => state.countries,
  orgSelectedName :(state) => state.orgSelectedName,
  orgSelected :(state) => state.orgSelectedId,
  states: (state) => state.states.sort(sortByName),
  orgTypes: (state) => state.orgTypes,
  orgRoles: (state) => state.orgRoles,
  userRole: (state) => state.userRole,
  getIsIndividualUser: (state) => state.isIndividualUser,
  addEditModalOpen: (state) => state.addEditModalOpen,
  addEditModalOrg: (state) => state.addEditModalOrg,
  currentOrganization: (state) => {
    let organization = state.organizations.find(
      (org) => org.id === state.orgSelectedId
    );
    if(!organization){//because logged user is a SiteUser
      organization = state.siteUserOrgPubSettings;
    }
    return organization;
  }
};

const actions = {
  async getOrganizations({ commit }) {
    try {
      const { organizations } = await OrganizationService.getOrganizations();
      commit('setOrganization', organizations);
      commit('tag/setTotal', 0, { root: true });
      return organizations;
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'), e);
    }
  },
  async getOrganizationTypes({ commit }) {
    try {
      const organizationsTypes = await OrganizationService.getOrganiztionTypes();
      commit('setOrganizationType', organizationsTypes);
      return organizationsTypes;
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'), e);
    }
  },
  async getOrgPublicSettings({ commit }, param){
    try {
      const organizationSettings = await OrganizationService.getOrganizationPubSettings(param.orgId);
      commit('setSiteUserOrgPubSettings', organizationSettings);
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'), e);
    }
  },
  async saveOrg(_, data) {
    try {
      return await OrganizationService.saveOrg(data);
    } catch (e) {
      throw new Error(e.data.message);
    }
  },
  async updateOrg({ commit, dispatch, state }, { orgId, organization }) {
    try {
      const response = await OrganizationService.updateOrg(orgId, organization);
      await dispatch('getOrganizations');
      if (orgId === state.orgSelectedId) {
        await commit('setSelectedOrganizationName', organization.name);
      }
      return response;
    } catch (e) {
      throw new Error(e.data.message);
    }
  },
  saveOrgContact(_, { orgId, contact }) {
    try {
      return OrganizationService.saveOrgContact(orgId, contact);
    } catch (e) {
      
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  saveContactMedia(_, { orgId, photo }) {
    try {
      return OrganizationService.saveContactMedia(orgId, photo);
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  saveOrganizationMedia(_, { orgId, logo }) {
    try {
      return OrganizationService.saveOrganizationMedia(orgId, logo);
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  setSelectedOrganizationId({ commit }, { id }) {
      commit('setSelectedOrganization', id);
  },
  setSelectedOrganizationName({ commit }, { name }) {
    commit('setSelectedOrganizationName', name);
  },
  async getOrganizationMedia(_, orgId) {
    try {
      return await OrganizationService.getOrganizationMedia(orgId);
    } catch (e) {
      throw new Error(JSON.stringify(e));
    }
  },
  async getContactMedia(_, orgId) {
    try {
      return await OrganizationService.getContactMedia(orgId);
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  async getCountries({ commit }) {
    try {
      const data = await OrganizationService.getCountries();
      commit('setCountries', data);
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  async getStates({ commit }, countryId) {
    try {
      const data = await OrganizationService.getStates(countryId);
      commit('setStates', data);
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  async getOrganizationContact(_, orgId) {
    try {
      return await OrganizationService.getOrganizationContact(orgId);
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  async getOrgUserRole({ commit, dispatch }, orgId) {
    try {
      commit('setUserRole', null);
      const data = await OrganizationService.getOrgUserRole(orgId);
      dispatch('ga/setCurrentUserId', data.assetInfo.metadata.props.userId, { root: true });
      commit('setUserRole', data);
      data.assetInfo.metadata.props.role === ROLES.SUPER_ADMIN ? commit('setIsOrgSuperAdmin', true) : commit('setIsOrgSuperAdmin', false);
      const isIndividualUser = data.assetInfo.metadata.props.role.toLowerCase() === 'individual';
      commit('setIsIndividualUser', isIndividualUser);
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  async returnOrgUserRole({}, orgId) {
    try {
      
      const data = await OrganizationService.getOrgUserRole(orgId);
      return data.assetInfo.metadata.props.role;
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  resetOrganization({ commit }) {
    commit('setOrganization', []);
  },
  async deleteOrganization(_, orgId) {
    try {
      return await OrganizationService.deleteOrganization(orgId);
    } catch (error) {
      throw new Error(error.data.message);
    }
  },
  async openAddEditModal({ commit, dispatch, state }, orgId) {
    await dispatch('closeAddEditModal');
    if (orgId) {
      const org = state.organizations.find((org) => org.id === orgId);
      commit('setAddEditModalOrg', org);
    } else {
      commit('setAddEditModalOrg', null);
    }
    commit('setAddEditModalOpen', true);
  },
  closeAddEditModal({ commit }) {
    commit('setAddEditModalOpen', false);
    commit('setAddEditModalOrg', null);
  },
};

export default {
  namespaced,
  state,
  mutations,
  getters,
  actions,
};
