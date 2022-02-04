import axiosHelper from '../utils/axios';
import Tag from '../models/tag';
import TagV3 from '../models/tagv3'

export default (() => {
	const networkAssetPath = "/networkAsset/airfinder/";
	const v2Path = '/v2';
	const v3Path = 'v3/';
	const v2_1Path = '/v2.1';

	async function getTagsBySite(params, firstPage) {
		let queryParams = `?siteId=${params.siteId}&groupBy=none`;
		if (firstPage){
			queryParams = `${queryParams}&page=1&size=${params.pagination.size}`
		}else{
			queryParams = `${queryParams}&page=${params.pagination.page}&size=${params.pagination.size}`
		}
		if(params.filters){
			queryParams += params.filters;
		}
		if(params.sorting){
			queryParams += params.sorting;
		}
		const response = await axiosHelper.getNetworkAsset(firstPage ? 'hideLoadingIndicator' : '').get(`${networkAssetPath}${v3Path}tags${queryParams}`);
		const totalTags = response.headers.total_site_records;
		const totalFilteredTags = response.headers.total_filtered_records ? response.headers.total_filtered_records : response.data.length;
		const tagsResponse = response.data.map(tag => new TagV3().normalize(tag));
		return { total: totalTags, filteredTotal: totalFilteredTags, tags: tagsResponse };
	}

	async function getAF3TagsInArea(params){
		let queryParams = `?siteId=${params.siteId}&areaName=eq:${params.areaName}&groupBy=none`;
		const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}${v3Path}tags${queryParams}`);
		const tagsResponse = response.data.map(tag => new TagV3().normalize(tag));
		return tagsResponse;
	}

	async function getTagById(tagId){
		const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}tag/${tagId}`);
        return new Tag().normalize(response.data);
	}

	async function getTagsUrl(url){
		const response = await axiosHelper.getNetworkAsset().get(url);
        return response.data;
	}

	async function createTag(device) {
		const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}tags`, device);
		return response.data;
	}
	async function editTag(device) {
		const response = await axiosHelper.getNetworkAsset().put(`${networkAssetPath}tag/${device.id}`, device);
		return response.data;
	}
	async function deleteTag(device) {
		const response = await axiosHelper.getNetworkAsset().delete(`${networkAssetPath}tag`,{ data: device });
		return response.data;
	}

	async function getHistory(params) {
		const response = await axiosHelper.getClientEdge()
			.get(`${v2_1Path}/supertags/${params.id}/history/${params.startDate}/${params.endDate}`);
		const historyResponse = response.data.map(event => new Tag().normalizeHistory(event));
		return historyResponse.reverse();
	}

	async function exportAllTags(params) {
		let queryParams = `?siteId=${params.siteId}${params.filters}&groupBy=none&sortBy=name&sort=asc&format=csv`;
		
		const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}tags${queryParams}`);
		return response;
	}

	return {
		getTagsBySite,
		getAF3TagsInArea,
		getTagById,
		getTagsUrl,
		createTag,
		editTag,
		deleteTag,
		getHistory,
		exportAllTags,
	}


})();