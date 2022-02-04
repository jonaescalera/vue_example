import router from '../../router';
import AuthService from '../../services/auth';
import ProfileService from '../../services/profile';
import i18n from '../../i18n';

const state = {
  data: {
    userData: null,
    username: null,
  },
  namespaced: true,
  tabProfile: '',
  eulaAcceptance: null,
};

const getters = {
  getUserLogged: (state) => {
    return state.data.userData;
  },
  getUsername: (state) => {
    return state.data.username;
  },
  eulaAcceptance: (state) => {
    return state.eulaAcceptance;
  },
};

const mutations = {
  login(state, data) {
    state.data.userData = data;
  },
  logout(state) {
    state.data.userData = undefined;
  },
  setUsername(state, username) {
    state.data.username = username;
  },
  setEulaAcceptance(state, eulaAcceptance) {
    state.eulaAcceptance = eulaAcceptance;
  },
};

const actions = {
  async login({ dispatch, commit }, { username, password }) {
    try {
      await AuthService.login(username, password);
      localStorage.setItem('userEmail', username);
      commit('setUsername', username);
    } catch (error) {
      if (error.response && error.response.status < 500) {
        throw new Error(i18n.t('error-login-msg'));
      }
      throw new Error(i18n.t('something-went-wrong'));
    }
    dispatch('saveLogin');
  },
  async checkSSO({ commit }, {username}) {
    try {
      const host = document.location.origin;
      const response = await AuthService.SSO(username, host);
      localStorage.setItem('userEmail', username);
      return response;
    } catch (error) {
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  logout({ commit }, { vuetify }) {
    AuthService.logout();
    //reset right sliding container
    commit('layout/destroyRightContainer');
    if(vuetify){
      commit('layout/resetCustomTheme', vuetify);
    }
    commit('organization/resetSelectedOrganization');
    commit('header/setMapVisible', false);
    commit('site/clearSite');
    commit('tag/clearTags');
    commit('layout/setIsMobileipadPortrait', undefined, { root: true });
    commit('logout');

    // todo find a better central place to call route change on logout
    // for now this has to do
    router.push('/');
  },
  async readLogin({ dispatch }) {
    const data = AuthService.checkLoggedIn();
    if (data) {
      await dispatch('saveLogin');
      await dispatch('checkEulaAcceptance');
    }
  },
  saveLogin({ commit }) {
    // Todo remove uneeded variables from the following when needed
    commit('login', {
      tokenAuth: 'token',
      tokenValidate: 'tokenVal',
      incompleteRegister: 0,
      userType: 'user',
      isLoggedIn: true,
    });
  },
  saveJwt(_, { token }) {
    return AuthService.saveJwt(token);
  }, 
  async forgot(_, { username }) {
    try {
      await AuthService.forgot(username);
    } catch (error) {
      if (error.response && error.response.status < 500) {
        throw new Error(i18n.t('error-forgot-msg'));
      }
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  async reset(_, { username, password, key }) {
    let response;
    try {
      response = await AuthService.reset(username, password, key);
    } catch (error) {
      throw new Error(i18n.t('something-went-wrong'));
    }
    if (response === false) {
      throw new Error(i18n.t('error-reset-msg'));
    }
  },
  async getEulaAcceptance({ commit }) {
    try {
      const response = await ProfileService.getEulaAcceptance();
      commit('setEulaAcceptance', response);
      return response;
    } catch (error) {
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  async acceptEula({ commit }) {
    try {
      await ProfileService.acceptEula();
      const eulaAcceptance = { accepted: true };
      commit('setEulaAcceptance', eulaAcceptance);
      return eulaAcceptance;
    } catch (error) {
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  async checkEulaAcceptance({ dispatch }) {
    const response = await dispatch('getEulaAcceptance');
    if (response && response.accepted) {
      return true;
    } else {
      if (router.currentRoute && router.currentRoute.path !== '/eula') {
        router.push('/eula');
      }
      return false;
    }
  },
  async processLogin({ dispatch }) {
    if (await dispatch('checkEulaAcceptance')) {
      const organizations = await dispatch('organization/getOrganizations');
      if (organizations.length === 0) {
        // Site User
        router.push('/assets');
      } else if (organizations.length === 1) {
        //  Organization User with single Organization
        // TODO localstorage util
        localStorage.setItem('orgId', organizations[0].id);
        // set user's role for the organization
        await dispatch('organization/setSelectedOrganizationId',  { id: organizations[0].id });
        await dispatch('organization/setSelectedOrganizationName',  { name: organizations[0].name });
        await dispatch('organization/getOrgUserRole', organizations[0].id);
        router.push('/assets');
      } else {
        // Organization User with multiple Organizations
        router.push('/org-select');
      }
    }
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};
