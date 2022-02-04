import AccessPointService from '../../services/accessPoint';
import i18n from '../../i18n';
const namespaced = true;

const state = {
	accessPoints: []
}

const mutations = {
	setAccessPoints(state, accessPoints) {
		state.accessPoints = accessPoints;
	},
}

const getters = {
	accessPoints: (state) => state.accessPoints
}

const actions = {
	async getAccessPointById({ }, id) {
		try {
			const response = await AccessPointService.getAccessPointById(id);
			return response;
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async getAccessPointsBySite({}, { siteId }){
		try {
			const response = await AccessPointService.getAccessPointsBySite(siteId);
			return response;
		}catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async getAccessPointByZone({ }, zoneId) {		
		try {
			const resp = await AccessPointService.getAccessPointByZone(zoneId);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async createAccessPoint({ }, accessPoint) {		
		try {
			const resp = await AccessPointService.createAccessPoint(accessPoint);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async importAccessPoints({ }, { siteId, formData }) {
    try {
      const response = await AccessPointService.importAccessPoints(siteId, formData);
      return response;
    } catch (e) {
      if (e.data && e.data.message) {
        throw new Error(e.data.message);
      }
        throw new Error(i18n.t("something-went-wrong"));
    }
	},
	async editAccessPoint({ }, {accessPointId, accessPoint}) {		
		try {
			const resp = await AccessPointService.editAccessPoint(accessPointId, accessPoint);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async editAccessPoints({ }, acc) {
		try {
			const resp = await AccessPointService.editAccessPoints(acc);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async replaceAccessPoint({ }, {accessPointId, accessPoint}) {		
		try {
			const resp = await AccessPointService.replaceAccessPoint(accessPointId, accessPoint);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async deleteAccessPoints({ }, payload) {		
		try {
			const resp = await AccessPointService.deleteAccessPoints(payload);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
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