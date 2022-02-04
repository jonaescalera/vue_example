import i18n from '../../i18n';
import SLAService from '../../services/sla';

const namespaced = true;

const state = {};

const mutations = {};

const getters = {};

const actions = {
  async getSLAList(_, { siteId, startDate, endDate }) {
    try {
      return await SLAService.getSLAList({ siteId, startDate, endDate });
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'));
    }
  },
  async getHourlySLAList(_, { siteId, date }) {
    try {
      return await SLAService.getHourlySLAList({ siteId, date });
    } catch (e) {
      throw new Error(i18n.t('something-went-wrong'));
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
