import ZoneService from '../../services/zones';
import { sortByValue } from '../../utils/localeCompare';
import i18n from '../../i18n'

const namespaced = true;

const state = {
	zones: []
}

const mutations = {
	setZones(state, zones) {
		state.zones = zones;
	},
}

const getters = { }

const actions = {
	async getZonesBySite({}, { siteId }){
		try {
			const response = await ZoneService.getZonesBySite(siteId);
			return response;
		}catch (e) {
            throw e;
        }
	},
	async getZones({commit}, { siteId, hiddenLoader }){
		try {
			const response = await ZoneService.getZones(siteId, hiddenLoader);
			commit('setZones', response);
			return response;
		}catch (e) {
            throw e;
        }
	},
	async getZoneByArea({}, areaId) {
    try {
      const zones = await ZoneService.getZoneByArea(areaId);
      return zones.sort(sortByValue);
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
    }
	},
	async createZone({}, zone) {
    try {
      const newZone = await ZoneService.createZone(zone)
      return newZone
    } catch (e) {
      let msg = e && e.data ? e.data.message : i18n.t('something-went-wrong');
      throw new Error(msg);
    }
	},
	async editZone({}, zone) {
    try {
      const editedZone = await ZoneService.editZone(zone)
      return editedZone
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
    }
	},
	async deleteZone({}, zoneId) {
    try {
      const deletedZone = await ZoneService.deleteZone(zoneId)
      return deletedZone
    } catch (e) {			
      throw new Error(i18n.t("something-went-wrong"), e);
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