import axiosHelper from '../utils/axios';
import TableauSubmenu from '../models/tableauSubmenu'

export default (() => {
    const networkAssetPath = "/networkAsset/tableau/";

    async function getWorkbooksBySiteId(siteId){
        let queryParams = `workbooks?siteId=${siteId}`;
        
        const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}${queryParams}`);
        const mappedData = new TableauSubmenu().normalize(response.data.records);

        return mappedData;
    }
    
    return {
        getWorkbooksBySiteId
	}


})();