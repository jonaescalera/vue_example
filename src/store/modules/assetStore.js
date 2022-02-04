import AssetService from '../../services/assets';
import i18n from '../../i18n'

const namespaced = true;

const actions = {
  async bulkUpload({ }, { siteId, formData }) {
    try {
      const response = await AssetService.bulkUpload(siteId, formData);
      return response;
    } catch (e) {
      if (e.data && e.data.message) {
        throw new Error(e.data.message);
      }
        throw new Error(i18n.t("something-went-wrong"));
    }
  },
}

export default {
	namespaced,
  	actions
}