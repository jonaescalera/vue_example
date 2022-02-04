import StatusService from '../../services/status';
import i18n from '../../i18n'

const namespaced = true;

const state = {
};

const mutations = {
};

const getters = {
};

const actions = {
  async getDeviceStatus(_, siteId) {
    try {
      return await StatusService.getDeviceStatus(siteId);
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
    }
  },
  async getDevicesCount(_, siteId) {
    try {
      return await StatusService.getDevicesCount(siteId);
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
    }
  },
  async getGatewayStatus(_, { siteId, sortOrder, sortBy }) {
    try {
      const gatewayStatus = await StatusService.getGatewayStatus(siteId, null, null, sortOrder, sortBy);
      return gatewayStatus
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
    }
  },
  async getAccessPointStatus(_, { siteId, sortOrder, sortBy }) {
    try {
      const accessPointStatus = await StatusService.getAccessPointStatus(siteId, null, null, sortOrder, sortBy)
      return accessPointStatus
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
    }
  },
  async getLocationBeaconStatus(_, { siteId, sortOrder, sortBy }) {
    try {
      const locationBeaconStatus = await StatusService.getLocationBeaconStatus(siteId, null, null, sortOrder, sortBy)
      return locationBeaconStatus
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
    }
  },
  async getTagStatus(_, { siteId, sortOrder, sortBy }) {
    try {
      const tagStatus = await StatusService.getTagStatus(siteId, null, null, sortOrder, sortBy)
      return tagStatus
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
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
