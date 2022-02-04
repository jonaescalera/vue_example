import i18n from '../../i18n';
import SiteService from '../../services/site';
import { sortByValue } from '../../utils/localeCompare';

const namespaced = true;

const state = {
  sites: [],
  loaded: false,
  currentSite: {},
  userRole: null
};

const mutations = {
  setSites(state, sites) {
    state.sites = sites;
    state.sites.loaded = true;
  },
  setCurrentSite(state, site) {
    state.currentSite = site;
  },
  setUserRole(state, userRole) {
    state.userRole = userRole;
  },
  clearSite(state){
    state.sites = [];
    state.currentSite = {};
    state.userRole = null;
  }
};

const getters = {
  sites: (state) => {
    return state.sites.sort(sortByValue);
  },
  sitesLoaded: (state) => { return state.sites.loaded },
  currentSite: (state) => state.currentSite,
  currentSiteName: (state) => state.currentSite.value,
  currentSiteId: (state) => state.currentSite.id,
  userRole: (state) => state.userRole,
  // need to be duplicated because of same getter name on orgStore
  siteUserRole: (state) => state.userRole,
  currentSiteLabels: (state) => state.currentSite?.assetInfo?.metadata?.props?.labels
};

const actions = {
  async getSites({ commit, dispatch }) {
    const organizationId = localStorage.getItem('orgId');
    let sites;
    try {
      if (organizationId) {
        sites = await SiteService.getOrganizationSites(organizationId);
      } else {
        sites = await SiteService.getUserSites();
        if (sites[0]) {
          await dispatch('organization/setSelectedOrganizationId',  { id: sites[0].organizationId }, {root: true});
          await dispatch('organization/getOrgPublicSettings',  { orgId: sites[0].organizationId }, {root: true});
        }
      }
      if (sites.length === 1) {
        commit('setCurrentSite', sites[0])
      }
      commit('setSites', sites.sort(sortByValue));
      return sites;
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong') + JSON.stringify(e), e);
    }
  },
  async searchSite({ }, searchValue) {
    try {
      return await SiteService.searchSite(searchValue);
    } catch (error) {
      throw error;
    }
  },
  setCurrentSiteId({ commit }, { siteId }) {
    const currentSite = this.state.site.sites.find(
      (site) => site.id === siteId
    );
    if (currentSite) {
      commit('setCurrentSite', currentSite);
      localStorage.setItem('siteId', currentSite.id);
    }
  },
  async getSiteUserRole({ commit, dispatch }, siteId) {
    try {
      commit('setUserRole', null);
      const data = await SiteService.getSiteUserRole(siteId);
      dispatch('ga/setCurrentUserId', data.assetInfo.metadata.props.userId, { root: true });
      commit('setUserRole', data);
      commit('organization/setIsIndividualUser', false, { root: true });
    } catch (e) {
      const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
    }
  },
  async createSite({ }, site) {
    try {
      await SiteService.createSite(site);
    } catch (e) {
      const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
    }
  },
  async editSite({ }, site) {
    try {
      await SiteService.editSite(site);
    } catch (e) {
      const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
    }
  },
  async deleteSite({ }, site) {    
    try {
      await SiteService.deleteSite(site);
    } catch (e) {
      const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
    }
  },
  async getSite(_, siteId) {
    try {
      return await SiteService.getSite(siteId);
    } catch (e) {
      const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
    }
  }
};

export default {
  namespaced,
  state,
  mutations,
  getters,
  actions,
};
