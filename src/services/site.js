import axiosHelper from '../utils/axios';
import SiteModel from '../models/site';

export default (() => {
  const networkAssetPath = '/networkAsset/airfinder/';

  async function searchSite(searchValue){
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPath}v2/sites?search=${searchValue}`);
      
    return response.data;
  }

  async function getOrganizationSites(organizationId) {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPath}organization/${organizationId}/sites`);
      response.data.map((site) =>
      new SiteModel().normalize(site)
    );
    return response.data;
  }
  async function getSiteUserRole(siteId) {
    const response = await axiosHelper
    .getNetworkAsset()
    .get(`${networkAssetPath}site/${siteId}/user`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  }
  async function getUserSites() {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPath}sites?currentUser=true`);
      response.data.map((site) =>
      new SiteModel().normalize(site)
    );
    return response.data;
  }
  async function createSite(param) {    
    const response = await axiosHelper
      .getNetworkAsset()
      .post(`${networkAssetPath}sites`, param.site);
    return response.data;
  }
  async function editSite(params) {
    const response = await axiosHelper
      .getNetworkAsset()
      .put(`${networkAssetPath}site/${params.siteId}`, params.site);
    return response.data;
  }
  async function deleteSite(params) {
    const response = await axiosHelper
      .getNetworkAsset()
      .delete(`${networkAssetPath}site/${params.site.id}`);
    return response.data;
  }
  async function getSite(siteId) {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPath}site/${siteId}`);
    return response.data;
  }

  return {
    searchSite,
    getOrganizationSites,
    getUserSites,
    getSiteUserRole,
    createSite,
    editSite,
    deleteSite,
    getSite,
  };
})();
