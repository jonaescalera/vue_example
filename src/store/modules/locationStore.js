import LocationService from '../../services/location';
import i18n from '../../i18n';
const namespaced = true;

const state = {
	locations: []
}

const mutations = {
	setLocations(state, locations) {
		state.locations = locations;
	},
}

const getters = {
	locations: (state) => state.locations
}

const actions = {
	async getLocationById({ }, id) {
		try {
			const response = await LocationService.getLocationById(id);
			return response;
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async getLocationsBySite({commit}, { siteId, hiddenLoader }){
		try {
			const response = await LocationService.getLocationsBySite(siteId, hiddenLoader);
			commit('setLocations', response)
			return response;
		}catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async getLocationsByArea({ }, areaId) {
		try {
			const resp = await LocationService.getLocationsByArea(areaId);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async getLocationByZone({ }, zoneId) {		
		try {
			const resp = await LocationService.getLocationByZone(zoneId);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async createLocation({ }, location) {		
		try {
			const resp = await LocationService.createLocation(location);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async importLocations({ }, { siteId, formData }) {
    try {
      const response = await LocationService.importLocations(siteId, formData);
      return response;
    } catch (e) {
      if (e.data && e.data.message) {
        throw new Error(e.data.message);
      }
        throw new Error(i18n.t("something-went-wrong"));
    }
	},
	async editLocation({ }, {locationId, location}) {		
		try {
			const resp = await LocationService.editLocation(locationId, location);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async editLocations({ }, locations) {
		try {
			const resp = await LocationService.editLocations(locations);
			return resp
		} catch (e) {
			const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
			throw errorMessage;
		}
	},
	async deleteLocations({ }, payload) {		
		try {
			const resp = await LocationService.deleteLocations(payload);
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