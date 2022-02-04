import axiosHelper from '../utils/axios';
import File from '../models/file';

export default (() => {
  const networkAssetPath = "/networkAsset/";
  
	async function createFile(file) {
    let data = new FormData();
    data.append('file', file, file.name);    
    data.append(
      'fileDef',
      new Blob([JSON.stringify(File.serialize(file))], {
        type: 'application/json'
      })
    );
    const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}files`, data);
    let serializedData = new File.normalize(response.data);
		return serializedData;
  }

  async function getFile(href) {
    const response = await axiosHelper.getNetworkAsset().get(href);
    let serializedData = new File.normalize(response.data);
    return serializedData;
  }

  async function getFileById(id) {
    const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}file/${id}`);
    let serializedData = new File.normalize(response.data);
    return serializedData;
  }
  
	return {
    createFile,
    getFile,
    getFileById,
  }

})();