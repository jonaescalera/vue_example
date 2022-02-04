import axiosHelper from '../utils/axios';
import Filter from '../models/filter';

export default (() => {
    const networkAssetPath = "/networkAsset/airfinder/";

	async function getFilterCategories(siteId, hiddenLoader = false) {
		try{
			const response = await axiosHelper.getNetworkAsset(hiddenLoader ? 'hideLoadingIndicator' : '').get(`${networkAssetPath}categories?siteId=${siteId}`);
			const Response = response.data.map(filter => new Filter().normalize(filter) );
			return Response;
		}catch{
			return [];	
		}
	}

	async function getFilterGroups(siteId, hiddenLoader = false) {
		try{
			const response = await axiosHelper.getNetworkAsset(hiddenLoader ? 'hideLoadingIndicator' : '').get(`${networkAssetPath}groups?siteId=${siteId}`);		
			const Response = response.data.map(filter => new Filter().normalize(filter) );
			return Response;
		}catch{
			return [];	
		}
    }
    
    return {
		getFilterCategories,
		getFilterGroups
	}

})();