import axiosHelper from '../utils/axios';
import AreaModel from '../models/area';


export default (() => {
  const networkAssetPath = "/networkAsset/airfinder/";

  async function createIndoorMapping(mapping) {
    const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}indoorMappings`, mapping);    
    return new AreaModel().normalizeFile(response.data);
  }

  async function editIndoorMapping(mapping, indoorMappingId) {
    const response = await axiosHelper.getNetworkAsset().put(`${networkAssetPath}indoorMapping/${indoorMappingId}`, mapping);    
    return response;
  }

  return {
    createIndoorMapping,
    editIndoorMapping
  }

})();