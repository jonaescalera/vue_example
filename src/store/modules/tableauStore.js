import TableauService from '../../services/tableau';

const namespaced = true;

const state = {
    workbooks : []    
}

const mutations = {
    setWorkbooks(state, workbooks) {
        state.workbooks = workbooks;
    },
    clearWorkbooks(state){
        state.workbooks = [];
    }
}


const getters = {
    workbooks: (state) => state.workbooks
}

const actions = {
    async getWorkbooks({ commit, rootGetters }) {
        const siteId = rootGetters['site/currentSiteId'];
        try {
            const wrbks = await TableauService.getWorkbooksBySiteId(siteId); 
            commit('setWorkbooks', wrbks);
            return wrbks;
        }catch (e) {
            if (e.data && e.data.message) {
                throw new Error(e.data.message);
            } else {
            throw new Error(i18n.t("something-went-wrong"));
            }
        }
    }
}

export default {
    namespaced,
    actions,
    getters,
    mutations,
    state
  }