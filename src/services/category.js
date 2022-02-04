import axiosHelper from '../utils/axios';
import Category from '../models/category'

export default (() => {
    const networkAssetPath = "/networkAsset/airfinder/";
    
    async function getCategories(siteId) {
        const response = await axiosHelper.getNetworkAsset().get(`${networkAssetPath}categories?siteId=${siteId}`);        
        const mappedData = response.data.map(categ => new Category().normalize(categ));
        return mappedData;
    }

	async function editCategory(categoryId, category) {
		const response = await axiosHelper.getNetworkAsset().put(`${networkAssetPath}category/${categoryId}`, category);
		return response;
    }
    
    async function createCategory(category) {
    const response = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}categories`, category);
    let newCat = new Category().normalize(response.data);
		return newCat;
    }
    
    async function deleteCategory(categoryId) {
      // TODO continue when this service has been fixed
    let data = {id: categoryId, name: ''}
    const response = await axiosHelper.getNetworkAsset().delete(`${networkAssetPath}category/${categoryId}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
		return response;
	}

	return {
        editCategory,
        createCategory,
        getCategories,
        deleteCategory
	}

})();