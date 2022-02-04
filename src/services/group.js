import axiosHelper from '../utils/axios';
import Group from '../models/group'

export default (() => {
    const networkAssetPath = "/networkAsset/airfinder/";
    
    async function getGroups(siteId) {
        const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}groups?siteId=${siteId}`);
        const mappedData = response.data.map(gro => new Group().normalize(gro));
        return mappedData;
    }

	async function editGroup(groupId, group) {
		const response = await axiosHelper.getNetworkAsset().put(`${networkAssetPath}group/${groupId}`, group);
		return response;
    }
    
    async function createGroup(group) {
    const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}groups`, group);
    let newGroup = new Group().normalize(response.data)
		return newGroup;
    }
    
    async function deleteGroup(groupId) {
      // TODO continue when this service has been fixed
    let data = {id: groupId, name: ''}
    const response = await axiosHelper.getNetworkAsset().delete(`${networkAssetPath}group/${groupId}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
		return response;
	}

	return {
        editGroup,
        createGroup,
        getGroups,
        deleteGroup
	}

})();