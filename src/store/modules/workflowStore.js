import WorkflowService from '../../services/workflow';
import FiltersService from '../../services/filters';

const namespaced = true;

const actions = {
    async createWorkflow({ commit }, params){
      try {
        const response = await WorkflowService.createWFBySite(params);
        return response;
      } catch (e) {
        throw e;
      }
    },
    async editWorkflow({ commit }, params){
      try {
        const response = await WorkflowService.editWorkflow(params);
        return response;
      } catch (e) {
        throw e;
      }
    },
    async deleteWorkflow({ commit }, id){
      try {
        const response = await WorkflowService.deleteWorkflow(id);
        return response;
      } catch (e) {
        throw e;
      }
    },
    async getWorkflows({ commit }, params) {
      try {
        const response = await WorkflowService.getWorkflowsBySite(params);
        return response;
      } catch (e) {
        throw new Error('Something went wrong', e);
      }
    },
    async getGroups({ commit }, { siteId }) {
      try {
        const response = await FiltersService.getFilterGroups(siteId);
        return response;
      } catch (e) {
        throw new Error('Something went wrong', e);
      }
    },
    async getCategories({ commit }, { siteId }) {
      try {
        const response = await FiltersService.getFilterCategories(siteId);
        return response;
      } catch (e) {
        throw new Error('Something went wrong', e);
      }
    }
}

export default {
    namespaced,
    actions
  }