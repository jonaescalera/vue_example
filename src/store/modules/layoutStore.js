import ThemingService from '../../services/theming';
import { defaultTheme } from '../../constants/theme';

const namespaced = true;

const state = {
  data: {
    overlay: '',
    loading: false,
    loadingCount: 0,
    rightContainer: {
      isOpen: '',
      item: {},
      component: null
    },
    windowWidth: window.innerWidth, // save the device's width 
    sidebarMini: false,
    isMobile: undefined,
    isMobileIpadPortrait: undefined,
    customTheme: {}
  }
}

const getters = {
  getOverlay: state => { 
    return (state.data.overlay);
  },
  getLoading: state => { 
    return (state.data.loading);
  },
  getLoadingCount: state => { 
    return (state.data.loadingCount);
  },
  getRightContainerOpen: state => { 
    return (state.data.rightContainer.isOpen);
  },
  getRightContainerComponent: state => { 
    return (state.data.rightContainer.component);
  },
  getRightContainerItem: state => { 
    return (state.data.rightContainer.item);
  },
  getWindowWidth: state => {
    return (state.data.windowWidth);
  },
  getIsMobile: state => {
    return (state.data.isMobile);
  },
  getLogo: state => (mini) =>{
    if(Object.keys(state.data.customTheme).length > 0){
      if(mini){
        return ('data:image/jpeg;base64,' + state.data.customTheme.smallImage.data);
      }else{
        return ('data:image/jpeg;base64,' + state.data.customTheme.largeImage.data);
      }
    }
  },
  getTheme: state => {
    return state.data.customTheme
  },
  getIsMobileIpadPortrait: (state) => {
    return state.data.isMobileIpadPortrait
  },
  isSidebarMini: state => { 
    return state.data.sidebarMini; }
}

const mutations = {
  closeOverlay(state) {
    state.data.overlay = 'notVisible';
    state.data.rightContainer.isOpen = 'closed';
  },
  openOverlay(state) {
    state.data.overlay = 'visible';
  },
  destroyOverlay(state) {
    state.data.overlay = '';
  },
  closeRightContainer(state) {
    state.data.rightContainer.isOpen = 'closed';
    state.data.overlay = 'notVisible';
  },
  destroyRightContainer(state) {
    state.data.rightContainer.isOpen = '';
  },
  setRightContainerComponent(state, payload) {
    state.data.overlay = 'visible';
    state.data.rightContainer.isOpen = 'opened';
    state.data.rightContainer.item = payload.item;    
    state.data.rightContainer.component = payload.comp;
  },
  setDeviceWidth(state, width) {
    state.data.windowWidth = width;
  },
  setIsMobile(state, isMobile) {
    state.data.isMobile = isMobile;
  },
  setIsMobileipadPortrait(state, isMobileIpadPortrait) {
    state.data.isMobileIpadPortrait = isMobileIpadPortrait;
  },
  setCustomTheme(state, theme){
    state.data.customTheme = theme;
  },
  resetCustomTheme(state, vuetify){
    state.data.customTheme = {};
    vuetify.theme.themes.light.primary = defaultTheme.colorSettings.primary;
    vuetify.theme.themes.light.secondary = defaultTheme.colorSettings.secondary;
    vuetify.theme.themes.light.primaryLight = defaultTheme.colorSettings.primaryLight;
    vuetify.theme.themes.light.info = defaultTheme.colorSettings.info;
  },
  setLogo(state,logo){
    if(logo.name==='small')
      state.data.logoCollapsed=logo.value
    else
      state.data.logoExpanded=logo.value
  },
  setSidebarMini(state, mini){
    state.data.sidebarMini = mini;
  },
  showLoading(state, loading) {
    state.data.loading = loading;
  },
  increaseLoadingCount(state) {    
    state.data.loadingCount++;
  },
  decreaseLoadingCount(state) {    
    state.data.loadingCount--;
  },
  resetLoadingCount(state) {     
    state.data.loadingCount = 0;
  }
  
}

const actions = {
  setLogo({ commit }, logo) {
    commit('setLogo', logo);
  },
  async getCustomTheme({commit}, params){
    try {
      const response = await ThemingService.getCustomTheme(params);
      if (!response.colorSettings.info) {
        response.colorSettings.info = "#3b5762";
      }
      commit('setCustomTheme', response);
    } catch (e) {
      throw new Error('Something went wrong', e);
    }
  },

  async getOrganizationTheme({commit}, params){
    try {
      const response = await ThemingService.getCustomTheme(params);
      return response;
    } catch (e) {
      throw new Error('Something went wrong', e);
    }
  },

  async updateCustomTheme({ commit, getters }, params){
    try {
      const response = await ThemingService.updateCustomTheme(params);
      commit('setCustomTheme', response);
    } catch (e) {
      throw e;
    }
  },

  async removeTheme({ commit }, params){
    try {
      const response = await ThemingService.removeTheme(params);
    } catch (e) {
      throw e;
    }
  },

  setLoading({ commit, state }, isLoading) {    
    if (isLoading) {
      commit('increaseLoadingCount', true);
      commit('showLoading', true);
    } else if (state.data.loadingCount > 0) {
      commit('decreaseLoadingCount');
      commit('showLoading', state.data.loadingCount > 0);
    }
  }
}

export default {
  namespaced,
  state,
  getters,
  mutations,
  actions
}