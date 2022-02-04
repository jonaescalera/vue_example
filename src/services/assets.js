import axiosHelper  from '../utils/axios';

export default (() => {
	const networkAssetPath = "/networkAsset/airfinder/";
	const v2Path = 'v2/';

	async function bulkUpload(siteId, formData) {
		const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}${v2Path}tags/bulk?siteId=${siteId}`, formData);
		return response.data;
	}
	return {
		bulkUpload
	}
})();