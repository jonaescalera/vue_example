const namespaced = true;

const state = {
  userId: null
};

const getters = {
  getUserId: (state) => {
    return state.userId;
  }
};

const mutations = {
  setUserId(state, userId) {
    state.userId = userId;

  }
};

const actions = {
  setCurrentUserId({ commit, rootGetters }, params) {
    
    let id = '';
    if(window.location.hostname === 'localhost') {
      id = 'UA-159839063-3';
    } else {
      id = process.env.VUE_APP_GOOGLE_ANALYTICS_ID;
    };
    commit('setUserId', params);
    if (window && window.ga) {
      ga('create', {
        trackingId: id,
        cookieDomain: 'auto',
        userId: params
      });
      ga('set', 'dimension1', params);
      ga('send', 'pageview', window.location.pathname);    
    }
    //chameleon
    const email = rootGetters['getUsername'];
    window.chmln.identify(
      params, {     
        email: email,
      });
  }
}

export default {
  namespaced,
  state,
  getters,
  mutations,
  actions
};
