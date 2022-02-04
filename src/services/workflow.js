import axiosHelper from '../utils/axios';
import Workflow from '../models/workflow';

export default (() => {
    const networkAssetPath = "/networkAsset/airfinder/";

	async function getWorkflowsBySite(params) {
		let queryParams = `v2/workflows?siteId=${params.siteId}`;
		if (params.pagination) {
			queryParams = `${queryParams}&page=${params.pagination.page}&size=${params.pagination.size}`
		}
		
		const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}${queryParams}`);
		const totalItems = response.headers.total_records || 0;
        const WorflowResponse = response.data.map(item => new Workflow().normalize(item));
		return {workflows: WorflowResponse, totalItems: totalItems};
	}
	async function createWFBySite(params){
		let queryParams = `workflows`;
		const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}${queryParams}`, params,  { headers :{'Content-Type': 'application/json'}});
		return response;
	}
	async function editWorkflow(params){
		let queryParams = `workflow/`;
		const response = await axiosHelper.getNetworkAsset().put(`${networkAssetPath}${queryParams}${params.id}`, params.body,  { headers :{'Content-Type': 'application/json'}});
		return response;
	}
	async function deleteWorkflow(id){
		let queryParams = `workflow/`;
		const response = await axiosHelper.getNetworkAsset().delete(`${networkAssetPath}${queryParams}${id}`);
		return response;
	}

    return {
		getWorkflowsBySite,
		createWFBySite,
		editWorkflow,
		deleteWorkflow
    }
})();