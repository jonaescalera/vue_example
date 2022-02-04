import ReportsService from '../../services/reports';

const namespaced = true;

const actions = {
    async generateTagPathReport({}, params) {
        try {
            let response = await ReportsService.getTagPathReport(params);
            return response;
        } catch (e) {
            throw e;
        }
    },
    async generateBatteryStatusReport({}, params) {
        try {
            let response = await ReportsService.getBatteryStatusReport(params);
            return response;
        } catch (e) {
            throw e;
        }
    },
    async generateAreaReport({}, params){
        try {
            let response = await ReportsService.getAreaReport(params);
            return response;
        } catch (e) {
            throw e;
        }
    },
    async generateZoneReport({}, params){
        try {
            let response = await ReportsService.getZoneReport(params);
            return response;
        } catch (e) {
            throw e;
        }
    },
    async generateLocationReport({}, params){
        try {
            let response = await ReportsService.getLocationReport(params);
            return response;
        } catch (e) {
            throw e;
        }
    }
}

export default {
    namespaced,
    actions
  };