import axiosHelper from '../utils/axios';
import GatewayModel from '../models/gateway';

export default (() => {
    const networkAssetPath = "/networkAsset/airfinder/";

    async function getGatewayById(id) {
        let response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}gateway/${id}`);
        response = new GatewayModel().normalize(response.data);
        return response;
    }
    async function getGatewaysBySite(siteId){
        let response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}gateways?siteId=${siteId}`);
        response = response.data.map(filter => new GatewayModel().normalize(filter) );
		return response;
    }
    async function createGateway(gateway) {
        const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}gateways`, gateway);
        return response;
    }
    async function importGateways(siteId, formData) {
      const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}gateways/bulk?siteId=${siteId}`, formData);
      return response.data;
      }
    async function editGateway(gatewayId, gateway) {
        const response = await axiosHelper.getNetworkAsset().put(`${networkAssetPath}gateway/${gatewayId}`, gateway);
        return response;
    }
    async function editGateways(gateways) {
      const response = await Promise.all(gateways.map(gateway => {
        return this.editGateway(gateway.id, {
            zoneId: gateway.zoneId,
            name: gateway.name
        });
      }));
      return response;
    }
    async function deleteGateways(payload) {        
        const response = await axiosHelper.getNetworkAsset().delete(`${networkAssetPath}gateways`, {data: payload});
        return response;
    }
    async function restart(id) {
        let hexnow = ("000000000000000" + Date.now().toString(16)).substr(-16);
        let payload = {
          commandRoutes: {
            linkAddresses: [`${id}!FFD!${id}`]
          },
          commandProperties: {
            payloadHex: `7F${hexnow}`, commReqs: {
              requiredAckRatio: 1, requiredSuccessfulAckRatio: 1, priority: 10, ttlMSecs: 60000, portNumber: 0
            }
          }
        }
        const response = await axiosHelper.getClientEdge().post(`/issueCommand`, payload);
        return response.data;
    }

	return {
        getGatewayById,
        getGatewaysBySite,
        createGateway,
        importGateways,
        editGateway,
        editGateways,
        deleteGateways,
        restart
	}

})();