import axiosHelper from '../utils/axios';
import Area from '../models/area';

export default (() => {
	const networkAssetPath = "/networkAsset/airfinder/";

	async function getAreasBySite(siteId, hiddenLoader = false) {
		const response = await axiosHelper.getNetworkAsset(hiddenLoader ? 'hideLoadingIndicator' : '').get(`${networkAssetPath}areas?siteId=${siteId}`);
		return response.data;
	}

	async function createArea(payload) {
		const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}areas`, payload);
		return response.data;
	}

	async function deleteArea(areaId) {
		const response = await axiosHelper.getNetworkAsset().delete(`${networkAssetPath}area/${areaId}`);
		return response.data;
	}

	async function editArea(payload) {
		const response = await axiosHelper.getNetworkAsset().put(`${networkAssetPath}area/${payload.id}`, payload.data);
		return response.data;
	}

	async function getAreaIndoorMapFile(areaId) {
		const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}area/${areaId}/file`);
		const fileResponse = new Area().normalizeFile(response.data);
		return fileResponse;
	}

	async function saveAF3Points(data){
		const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}area/${data.areaId}/referencepoint`, data);
		return response;
	}

	async function getAF3Points(areaId){
		const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}area/${areaId}/referencepoint`);
		return response.data;
	}

	return {
		getAreasBySite,
		createArea,
		deleteArea,
		editArea,
		getAreaIndoorMapFile,
		saveAF3Points,
		getAF3Points
	}

})();