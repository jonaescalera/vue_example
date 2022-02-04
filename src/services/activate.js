import axiosHelper from '../utils/axios';
import ActivateModel from '../models/activate';
import { redirectionTimeout } from '../constants/activate';

export default (() => {
  const mainAppURL = process.env.VUE_APP_APPLICATION_URL || '';
  const networkAssetPath_V2 = '/networkAsset/airfinder/v2/';

  async function validateCode(params) {
    const response = await axiosHelper
      .getNetworkAsset()
      .post(`${networkAssetPath_V2}superTagInBox/validate`, {
        code: params.code,
      });
    return new ActivateModel().normalizeValidation(response.data);
  }

  async function createResources({
    code,
    token,
    email,
    organizationName,
    siteName,
  }) {
    const response = await axiosHelper
      .getNetworkAsset()
      .post(`${networkAssetPath_V2}superTagInBox/createResources`, {
        code,
        token,
        email,
        organizationName,
        siteName,
      });
    return response.data;
  }

  function navigateToLogin() {
    setTimeout(() => {
      window.location = mainAppURL;
    }, redirectionTimeout);
  }

  return {
    validateCode,
    createResources,
    navigateToLogin,
  };
})();
