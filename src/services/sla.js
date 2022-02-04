import axiosHelper from '../utils/axios';

export default (() => {
  const slaPath = '/v2/sla';

  async function getSLAList(params) {
    const response = await axiosHelper
      .getClientEdge()
      .get(
        `${slaPath}/getslalistbysiteid/${params.siteId}/${params.startDate}/${params.endDate}`
      );
    return response.data;
  }

  async function getHourlySLAList(params) {
    const response = await axiosHelper
      .getClientEdge()
      .get(
        `${slaPath}/gethourlycountlistbysiteid/${params.siteId}/${params.date}/${params.date}`
      );
    return response.data;
  }

  return {
    getSLAList,
    getHourlySLAList,
  };
})();
