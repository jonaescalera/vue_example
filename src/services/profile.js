import ProfileModel from '../models/profile';
import axiosHelper from '../utils/axios';

export default (() => {
  const accessV2Path = '/access/v2';

  async function getEulaAcceptance() {
    const response = await axiosHelper
      .getAccess()
      .get(`${accessV2Path}/user/eula`);
    const eulaResponse = new ProfileModel().normalizeEulaAcceptance(
      response.data
    );
    return eulaResponse;
  }

  async function acceptEula() {
    const response = await axiosHelper
      .getAccess()
      .put(
        `${accessV2Path}/user/eula`,
        new ProfileModel().serializeEulaAcceptance({ accepted: true })
      );
    return response;
  }

  return {
    getEulaAcceptance,
    acceptEula,
  };
})();
