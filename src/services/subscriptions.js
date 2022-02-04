import SubscriptionModel from '../models/subscriptionModel';
import axiosHelper from '../utils/axios';

export default (() => {
  const networkAssetPath = '/networkAsset/airfinder';

  async function getSubscriptions(orgId) {
    const response = await axiosHelper
      .getNetworkAsset()
      .get(`${networkAssetPath}/mqttUsers?organizationId=${orgId}`);
    response.data = response.data.map((sub) =>
      new SubscriptionModel().normalize(sub)
    );
    return response;
  }

  async function createSubscription(data) {
    const response = await axiosHelper
      .getNetworkAsset()
      .post(`${networkAssetPath}/mqttUser`, data, {
        headers: { 'Content-Type': 'application/json' },
      });
    return response;
  }

  async function editSubscription(data) {
    const response = await axiosHelper
      .getNetworkAsset()
      .put(`${networkAssetPath}/mqttUser`, data, {
        headers: { 'Content-Type': 'application/json' },
      });
    return response;
  }

  async function deleteSubscription(params) {
    const response = await axiosHelper
      .getNetworkAsset()
      .delete(`${networkAssetPath}/mqttUser?organizationId=${params.orgId}&mqttUsername=${params.username}`,
      { headers: { 'Content-Type': 'application/json' }, data: {} });
    return response;
  }

  return {
    getSubscriptions,
    createSubscription,
    editSubscription,
    deleteSubscription
  };
})();
