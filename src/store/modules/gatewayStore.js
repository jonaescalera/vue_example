import GatewayService from '../../services/gateway';
import i18n from '../../i18n';
const namespaced = true;

const state = {
	gateways: []
}

const mutations = {
	setGateways(state, gateways) {
		state.gateways = gateways;
	},
}

const getters = {
	gateways: (state) => state.gateways
}

const actions = {
	async getGatewayById({ }, id) {
		try {
			const response = await GatewayService.getGatewayById(id);
			return response;
		} catch (e) {
			console.error(e);
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},

	async getGatewaysBySite({}, { siteId }){
		try {
			const response = await GatewayService.getGatewaysBySite(siteId);
			return response;
		}catch (e) {
			throw e;
		}
	},
	async getGatewayByZone({ }, zoneId) {		
		try {
			const resp = await GatewayService.getGatewayByZone(zoneId);
			return resp
		} catch (e) {
			console.error(e);
			throw new Error(i18n.t("something-went-wrong"), e);
		}
	},
	async createGateway({ }, gateway) {		
		try {
			const resp = await GatewayService.createGateway(gateway);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async importGateways({ }, { siteId, formData }) {
    try {
      const response = await GatewayService.importGateways(siteId, formData);
      return response;
    } catch (e) {
      if (e.data && e.data.message) {
        throw new Error(e.data.message);
      }
        throw new Error(i18n.t("something-went-wrong"));
    }
	},
	async editGateway({ }, {gatewayId, gateway}) {		
		try {
			const resp = await GatewayService.editGateway(gatewayId, gateway);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async editGateways({ }, gateways) {
		try {
			const resp = await GatewayService.editGateways(gateways);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async deleteGateways({ }, payload) {		
		try {
			const resp = await GatewayService.deleteGateways(payload);
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