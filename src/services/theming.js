import axiosHelper from '../utils/axios';

export default (() => {
	const networkAssetPath = "/networkAsset/airfinder/v2/theme/";

    async function getCustomTheme(params) {
        let queryParams = ``;
		if (params.organizationUuid) {
			queryParams += `?organizationUuid=${params.organizationUuid}`
        }
        if (params.siteUuid) {
                queryParams += `?siteUuid=${params.siteUuid}`
        }
		const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}${queryParams}`);
		return response.data;
    }

    async function updateCustomTheme(params){
        let queryParams = `${networkAssetPath}`;
        let themeRequest = {};
        themeRequest['colorSettings'] = params.newTheme.colorSettings;
        var data = new FormData();
        if(params.organizationUuid){
            themeRequest['organizationUuid'] = params.organizationUuid;
        }else{
            queryParams += 'default/';
        }
		var str = JSON.stringify(themeRequest);
        data.append('themeRequest',  new Blob([str], { type: 'application/json' }));
        if(params.newTheme.smallImage){
            data.append('smallImage', params.newTheme.smallImage);
        }
        if(params.newTheme.largeImage){
            data.append('largeImage', params.newTheme.largeImage);
        }
        const response = await axiosHelper.getNetworkAsset().post(queryParams, data, { headers :{'Content-Type': 'multipart/form-data'}});
        return response.data;
    }

    async function removeTheme(params){
        let queryParams = ``;
        if(params.organizationUuid){
            queryParams += `?organizationUuid=${params.organizationUuid}`
        }		
        const response = await axiosHelper.getNetworkAsset().delete(`${networkAssetPath}${queryParams}`);
        return response.data;
    }
    
	return {
        getCustomTheme,
        updateCustomTheme,
        removeTheme
	}

})();