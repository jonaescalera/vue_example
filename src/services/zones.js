import axiosHelper from '../utils/axios';
import ZoneModel from '../models/zone';
import Zone from '../models/zone';

export default (() => {
    const networkAssetPath = "/networkAsset/airfinder/";

    async function getZonesBySite(siteId, hiddenLoader = false){
        const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}zones?siteId=${siteId}`);
		return response.data;
    }

    async function getZones(siteId, hiddenLoader = false){
        const response = await axiosHelper.getNetworkAsset(hiddenLoader ? 'hideLoadingIndicator' : '').get(`${networkAssetPath}zones?siteId=${siteId}`);
		return response.data.map(zone => new Zone().normalize(zone));
    }

    async function getZoneByArea(areaId) {
        const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}zones?areaId=${areaId}`);
        return response.data.map(zone => new ZoneModel().normalize(zone));
    }
    async function createZone(zone) {
        const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}zones`, zone);
        return response;
    }
    async function editZone(zone) {        
        const response = await axiosHelper.getNetworkAsset().put(`${networkAssetPath}zone/${zone.id}`, zone.data);
        return response.data;
    }
    async function deleteZone(zoneId) {
        const response = await axiosHelper.getNetworkAsset().delete(`${networkAssetPath}zone/${zoneId}`);
        return response.data;
    }
	return {
        getZones,
        getZonesBySite,
        getZoneByArea,
        createZone,
        editZone,
        deleteZone
	}

})();