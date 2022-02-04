import i18n from '../../i18n';
import SubscriptionService from '../../services/subscriptions';

const namespaced = true;

const state = {
  subscriptions: []
};

const mutations = {
  setSubscriptions(state, subs) {
    state.subscriptions = subs;
  }
};

const getters = {
  subscriptions: (state) => {return state.subscriptions}
};

const actions = {
  async getSubscriptions({ commit }, params) {
    let subscriptions;
    try {
      if (params) {
        subscriptions = await SubscriptionService.getSubscriptions(params.orgId);
        commit('setSubscriptions', subscriptions.data)
      }
      return subscriptions.data;
    } catch (error) {
      let msg = error && error.data ? error.data.message : i18n.t('something-went-wrong');
      throw new Error(msg);
    }
  },
  async createSubscription({ }, subscription) {
    try {
      let sub = await SubscriptionService.createSubscription(subscription);
      return sub;
    } catch (e) {
      const msg = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw new Error(msg);
    }
  },
  async editSubscription({ }, sub) {
    try {
      await SubscriptionService.editSubscription(sub);
    } catch (e) {
      const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
    }
  },
  async deleteSubscription({ }, params) {    
    try {
      await SubscriptionService.deleteSubscription(params);
    } catch (e) {
      const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw new Error(errorMessage);
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
