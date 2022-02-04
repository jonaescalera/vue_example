import UserModel from '../models/userModel';
import axiosHelper from '../utils/axios';

export default (() => {
  const clientId = process.env.VUE_APP_CONDUCTOR_CLIENT_ID || '';
  const networkAssetPath = '/networkAsset/airfinder';
  const networkAssetPathV2 = "networkAsset/airfinder/v2";

  async function getConfigurationUsers(siteId) {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPathV2}/users?siteId=${siteId}`);
    response.data = response.data.records.map((user) =>
      new UserModel().normalize(user)
    );
    return response.data;
  }

  async function getConfigurationOrgUsers(orgId) {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPathV2}/organization/${orgId}/users`);
    response.data = response.data.records.map((user) =>
      new UserModel().normalize(user)
    );
    return response.data;
  }

  async function editConfigurationUser(userId, data) {
    const response = await axiosHelper
      .getNetworkAsset()
      .put(`${networkAssetPath}/user/${userId}`, data, {
        headers: { 'Content-Type': 'application/json' },
      });
    return response;
  }

  async function createConfigurationUser(data) {
    const response = await axiosHelper
      .getNetworkAsset()
      .post(`${networkAssetPath}/users?clientId=${clientId}`, data, {
        headers: { 'Content-Type': 'application/json' },
      });
    return response;
  }

  async function createOrgConfigurationUser(data) {
    const response = await axiosHelper
      .getNetworkAsset()
      .put(`${networkAssetPath}/organization/${data.orgID}/users?clientId=${clientId}`, data.form, {
        headers: { 'Content-Type': 'application/json' },
      });
    return response;
  }

  async function deleteConfigurationUser(userId) {
    const response = await axiosHelper
      .getNetworkAsset()
      .delete(`${networkAssetPath}/user/${userId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
    return response;
  }

  async function deleteConfigurationUsers(userIds) {
    const response = await axiosHelper
      .getNetworkAsset().delete(`${networkAssetPath}/v2/users`, {data: userIds}, {
        headers: { 'Content-Type': 'application/json' },
      });
    return response;
  }

  async function deleteConfigurationOrgUsers(data) {
    const response = await axiosHelper
    .getNetworkAsset()
    .delete(`${networkAssetPath}/organization/${data.orgId}/users/${data.userId}`, {
      headers: { 'Content-Type': 'application/json' },
      data:{}
    });
    return response;
  }

  async function getInviteLink(email, siteId, orgId ) {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPathV2}/user/verificationToken?clientId=${clientId}&email=${email}&siteId=${siteId}&organizationId=${orgId}`);
    return response;
  }

  async function resendInviteLink(email) {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPathV2}/users/verify/resend?email=${email}&clientId=${clientId}`);
    return response;
  }

  return {
    getConfigurationUsers,
    getConfigurationOrgUsers,
    editConfigurationUser,
    createConfigurationUser,
    createOrgConfigurationUser,
    deleteConfigurationUser,
    deleteConfigurationUsers,
    deleteConfigurationOrgUsers,
    getInviteLink,
    resendInviteLink
  };
})();
