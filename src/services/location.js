import axiosHelper from '../utils/axios';
import LocationModel from '../models/location';

export default (() => {
    const networkAssetPath = "/networkAsset/airfinder/";

    async function getLocationById(id) {
        let response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}location/${id}`);
        response = new LocationModel().normalize(response.data);
        return response;
    }
    async function getLocationsBySite(siteId, hiddenLoader = false){
        let response = await axiosHelper.getNetworkAsset(hiddenLoader ? 'hideLoadingIndicator' : '').get(`${networkAssetPath}locations?siteId=${siteId}`);
        response = response.data.map(filter => new LocationModel().normalize(filter) );
		return response;
    }
    async function getLocationByZone(zoneId) {
        const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}locations?zoneId=${zoneId}`);
        return response.data.map(location => new LocationModel().normalize(location));
    }
    async function getLocationsByArea(areaId) {
        let response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}locations?areaId=${areaId}`);
        return response.data.map(location => new LocationModel().normalize(location));
    }
    async function createLocation(location) {
        const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}locations`, location);
        return response;
    }
    async function importLocations(siteId, formData) {
		const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}locations/bulk?siteId=${siteId}`, formData);
		return response.data;
    }
    async function editLocation(locationId, location) {
        const response = await axiosHelper.getNetworkAsset().put(`${networkAssetPath}location/${locationId}`, location);
        return response;
    }
    async function editLocations(locations) {
        const response = await Promise.all(locations.map(location => {
            return this.editLocation(location.id, {
                zoneId: location.zoneId,
                name: location.name
            });
        }));
        return response;
    }
    async function deleteLocations(payload) {
        const response = await axiosHelper.getNetworkAsset().delete(`${networkAssetPath}locations`, {data: payload});
        return response;
    }

	return {
        getLocationById,
        getLocationsBySite,
        getLocationByZone,
        getLocationsByArea,
        createLocation,
        importLocations,
        editLocation,
        editLocations,
        deleteLocations
	}

})();