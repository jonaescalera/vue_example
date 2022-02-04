import CategoryService from '../../services/category';
import i18n from '../../i18n'

const namespaced = true;

const state = {
  categories: []
}

const mutations = {
  // TODO this should be uncommented and removed from tag store. The service call should be initialized from here when the app starts
  // setCategories(state, categories) {
  //   state.categories = categories;
  // }
}

const getters = {
  categories: (state) => state.categories,
}

const actions = {
  async getCategories({ commit }, { siteId }) {    
    try {
      const response = await CategoryService.getCategories(siteId);
      commit('tag/setCategories', response, { root: true });
      commit('tag/setCategoryFilters', { filters: response }, { root: true });
      return response;
    } catch (e) {      
      let msg = e && e.data && e.data.message;
      throw new Error(msg || i18n.t("something-went-wrong"));
    }
  },
  async editCategory({ }, { categoryId, category }) {    
    try {
      const response = await CategoryService.editCategory(categoryId, category);
      return response;
    } catch (e) {
        let msg = e && e.data && e.data.message;
        throw new Error(msg || i18n.t("something-went-wrong"));
    }
  },
  async createCategory({ }, { category }) {    
    try {
      const response = await CategoryService.createCategory(category);
      return response;
    } catch (e) {
        let msg = e && e.data && e.data.message;
        throw new Error(msg || i18n.t("something-went-wrong"));
    }
  },
  async deleteCategory({ }, { categoryId }) {    
    try {
      const response = await CategoryService.deleteCategory(categoryId);
      return response;
    } catch (e) {
      let msg = e && e.data && e.data.message;
      throw new Error(msg || i18n.t("something-went-wrong"));
    }
  },
}

export default {
    namespaced,
    state,
    getters,
    mutations,
    actions
}