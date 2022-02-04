import axiosHelper from '../utils/axios';
import Supertag from '../models/supertag'

export default (() => {
    const networkAssetPath = "/networkAsset/airfinder/";
    const networkAssetPath_V2_1 = "/networkAsset/airfinder/v2.1/";

	async function getSupertagsBySite(siteId) {
        let queryParams = `supertags/short?siteId=${siteId}`;
        
		const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}${queryParams}`);
        return response;
    }

    async function getSupertag(supertagId) {
        let queryParams = `supertags/${supertagId}/config`;
        
        const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath_V2_1}${queryParams}`);
        const mappedData = new Supertag().normalizeConfig(response.data);

        return mappedData;
    }

    async function getSupertagCurrentData(supertagId) {
        let queryParams = `v2/supertags/${supertagId}/currentData`;
        
        const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}${queryParams}`);
        const mappedData = (response.data.length > 0) ? new Supertag().normalizeCurrentData(response.data) : null;
        
        return mappedData;
    }

    async function saveSupertag(supertag){
        let data = {
            'connectivity': supertag.connectivity,
            'heartBeatInterval': supertag.heartBeatInterval,
            'locationInterval': supertag.locationInterval
        }

        let queryParams = `v2.1/supertags/${supertag.supertagId}/config`;
        
        const response = await axiosHelper.getClientEdge().post(`${queryParams}`, data);
        const mappedData = new Supertag().normalizeConfig(response.data);

        return mappedData;
    }

    return {
        getSupertagsBySite,
        getSupertag,
        saveSupertag,
        getSupertagCurrentData
	}


})();