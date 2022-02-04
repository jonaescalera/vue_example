import axiosHelper from '../utils/axios';

export default (() => {

    async function getTagPathReport(params){
        let queryParams = `airfinder/reports/tagpath/${params.tagId}/${params.start}/${params.end}/tagpath.csv`;
		
        const response = await axiosHelper.getClientEdge().get(`${queryParams}`);
		return response.data;
    }

    async function getBatteryStatusReport(params){
        let queryParams = `airfinder/reports/battery/site/${params.siteId}/battery.csv`;
        if(params.filter === "need"){
            queryParams += `?filter=${params.filter}`;
        }
		
        const response = await axiosHelper.getClientEdge().get(`${queryParams}`);
		return response.data;
    }
    async function getAreaReport(params){
        let queryParams = `airfinder/reports/entryexit/area/${params.areaId}/${params.start}/${params.end}/entryexit.csv`;	
        const response = await axiosHelper.getClientEdge().get(`${queryParams}`);
		return response.data;
    }
    async function getZoneReport(params){
        let queryParams = `airfinder/reports/entryexit/zone/${params.zoneId}/${params.start}/${params.end}/entryexit.csv`;	
        const response = await axiosHelper.getClientEdge().get(`${queryParams}`);
		return response.data;
    }
    async function getLocationReport(params){
        let queryParams = `airfinder/reports/entryexit/location/${params.locationId}/${params.start}/${params.end}/entryexit.csv`;	
        const response = await axiosHelper.getClientEdge().get(`${queryParams}`);
		return response.data;
    }

	return {
        getTagPathReport,
        getBatteryStatusReport,
        getAreaReport,
        getZoneReport,
        getLocationReport
	}

})();