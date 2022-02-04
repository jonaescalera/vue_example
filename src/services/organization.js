import axiosHelper from '../utils/axios';
import Organiztion from '../models/organization';

export default (() => {
  const v2Path = '/networkAsset/airfinder/v2/';
  const networkAssetPath = '/networkAsset/airfinder/';

  async function getOrganizations() {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPath}organizations`);
    return {
      organizations: response.data.map((org) =>
        new Organiztion().normalize(org)
      ),
    };
  }

  async function getOrganiztionTypes() {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${v2Path}organization/types`);
    return response.data;
  }

  async function getOrganizationPubSettings(orgId){
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPath}organization/${orgId}/pub`);
    return new Organiztion().normalize(response.data);
  }

  async function saveOrg(data) {
    let resp = await axiosHelper.getNetworkAsset().post(`${networkAssetPath}organizations`, data);
    return resp
  }

  async function updateOrg(orgId, data) {
    let resp = await axiosHelper
      .getNetworkAsset()
      .put(`${networkAssetPath}organization/${orgId}`, data);
      return resp;
  }

  async function deleteOrg(orgIds) {
    return axiosHelper
      .getNetworkAsset()
      .delete(`${v2Path}organizations?ids=${orgIds}`);
  }

  async function getOrganizationContact(orgId) {
    return await axiosHelper
      .getNetworkAsset()
      .get(`${v2Path}organization/${orgId}/contact`);
  }

  async function saveOrgContact(organizationId, data) {
    return axiosHelper
      .getNetworkAsset()
      .put(`${v2Path}organization/${organizationId}/contact`, data);
  }

  async function getCountries() {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${v2Path}countries`);
    return response.data;
  }

  async function getStates(countryId) {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${v2Path}states?countryId=${countryId}`);
    return response.data;
  }

  async function saveContactMedia(orgId, data) {
    const response = await axiosHelper
      .getNetworkAsset()
      .post(`${v2Path}organization/${orgId}/contact/photo`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    return response;
  }

  async function saveOrganizationMedia(orgId, data) {
    const response = await axiosHelper
      .getNetworkAsset()
      .post(`${networkAssetPath}organization/${orgId}/logo`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    return response;
  }

  async function getOrganizationMedia(orgId) {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPath}organization/${orgId}/logo`);
    return response;
  }

  async function getContactMedia(orgId) {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${v2Path}organization/${orgId}/contact/photo`);
    return response;
  }

  async function getOrgUserRole(orgId) {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPath}organization/${orgId}/user`, {
        headers: { 'Content-Type': 'application/json' },
      });
    return response.data;
  }

  async function deleteOrganization(orgId) {
    const response = await axiosHelper
      .getNetworkAsset()
      .delete(`${networkAssetPath}organization/${orgId}`);
    return response.data;
  }

  return {
    getOrganizations,
    getOrganiztionTypes,
    getOrganizationPubSettings,
    saveOrg,
    updateOrg,
    deleteOrg,
    getCountries,
    getStates,
    getOrganizationContact,
    saveOrgContact,
    saveContactMedia,
    saveOrganizationMedia,
    getOrganizationMedia,
    getContactMedia,
    getOrgUserRole,
    deleteOrganization
  };
})();
