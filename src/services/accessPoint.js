import axiosHelper from '../utils/axios';
import AccessPointModel from '../models/accessPoint';

export default (() => {
    const networkAssetPath = "/networkAsset/airfinder/";
    const networkAssetV2Path = "/networkAsset/airfinder/v2/";

    async function getAccessPointById(id) {
        let response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}accesspoint/${id}`);
        response = new AccessPointModel().normalize(response.data);
        return response;
    }
    async function getAccessPointsBySite(siteId){
        let response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}accesspoints?siteId=${siteId}`);
        response = response.data.map(filter => new AccessPointModel().normalize(filter) );
		return response;
    }
    async function createAccessPoint(access) {
        const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}accesspoints`, access);
        return response;
    }
    async function importAccessPoints(siteId, formData) {
		const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}accesspoints/bulk?siteId=${siteId}`, formData);
		return response.data;
    }
    async function editAccessPoint(locationId, access) {
        const response = await axiosHelper.getNetworkAsset().put(`${networkAssetPath}accesspoint/${locationId}`, access);
        return response;
    }
    async function editAccessPoints(accessPoints) {
        const response = await Promise.all(accessPoints.map(acc => {
            return this.editAccessPoint(acc.id, {
                zoneId: acc.zoneId,
                name: acc.name
            });
        }));
        return response;
    }
    async function replaceAccessPoint(id, access) {
        const response = await axiosHelper.getNetworkAsset().put(`${networkAssetV2Path}accesspoint/${id}`, access);
        return response;
    }
    async function deleteAccessPoints(payload) {        
        const response = await axiosHelper.getNetworkAsset().delete(`${networkAssetPath}accesspoints`, {data: payload});
        return response;
    }
    async function restart(id) {
        let payload = {
            commandProperties: {
                payloadHex: "a0020500",
                commReqs: {
                    requiredAckRatio: 1.0,
                    requiredSuccessfulAckRatio: 1.0,
                    priority: 10,
                    ttlMSecs: 60000,
                    portNumber: 0
                }
            },
            commandTargets: {
                targetNodeAddresses: [
                    id
                ]
            }
        }
        const response = await axiosHelper.getClientEdge().post(`/issueCommand`, payload);
        return response.data;
    }

	return {
    getAccessPointById,
    getAccessPointsBySite,
    createAccessPoint,
    editAccessPoint,
    editAccessPoints,
    replaceAccessPoint,
    deleteAccessPoints,
    importAccessPoints,
    restart
	}

})();