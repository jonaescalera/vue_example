import AreaService from '../../services/area';
import IndoorMappingService from '../../services/indoorMapping';
import { sortByValue } from '../../utils/localeCompare';
import { LOCATION_TYPES, BOUND_COORDINATES } from '../../constants/areas';
import i18n from '../../i18n'

const namespaced = true;

const state = {
  areas: [],
  currentArea: {},
};

const mutations = {
  setAreas(state, areas) {
    state.areas = areas;
  },
  setCurrentArea(state, area) {
    state.currentArea = area;
  },
  clearArea(state) {
    state.areas = [];
    state.currentArea = {};
  },
  resetCurrentArea(state){
    state.currentArea = {};
  }
};

const getters = {
  areas: (state) => {
    return state.areas.sort(sortByValue);
  },
  currentArea: (state) => state.currentArea,
  currentAreaId: (state) => state.currentArea.id,
};

const actions = {
  async getAreas({ commit }, { siteId, hiddenLoader }) {
    try {
      let areas = await AreaService.getAreasBySite(siteId, hiddenLoader);
      if (areas.length > 0) {
        // TODO Create model and move map
        areas.map((area) => {
          area.assetInfo.metadata.props.polygon = area.assetInfo.metadata.props
            .points
            ? area.assetInfo.metadata.props.points
                .split(';')
                .map((point) => point.split(',').map((n) => +n))
            : null;
        });
      } else {
        areas = [];
      }
      commit('setAreas', areas);
      return areas;
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
    }
  },
  setCurrentArea({ commit }, { areaId }) {
    const currentArea = this.state.area.areas.find(
      (area) => area.id === areaId
    );
    if (currentArea) {
      commit('setCurrentArea', currentArea);
    }
  },
  clearCurrentArea({ commit }) {
    commit('setCurrentArea', {});
  },
  async createAreaIndoorMapping({ commit }, params) {
    let image = new Image();
    image.src = params.file.preview;
    return new Promise((resolve, reject)=>{
      image.onload = async () => {
        let ratio = image.height / image.width;
        let height = (BOUND_COORDINATES.EAST - BOUND_COORDINATES.WEST) * ratio;
        let south = BOUND_COORDINATES.NORTH - height;
        let nwCorner = {
          latitude: BOUND_COORDINATES.WEST,
          longitude: BOUND_COORDINATES.NORTH,
        };
        let seCorner = {
          latitude: BOUND_COORDINATES.EAST,
          longitude: south,
        };
        let payload = {
          account: {
            href: params.file.account.href,
            desc: ''
          },
          fileUrl: params.file.href, 
          name: params.area.name,
          nwCorner: nwCorner,
          seCorner: seCorner,
          siteId: params.area.site.id
        }
        try {
          const mapping = await IndoorMappingService.createIndoorMapping(payload);
          let areaPayload = {
            configValue: payload.name,
            properties: {
              areaLocation: LOCATION_TYPES.INDOOR,
              geoReferenced: 'false',
              indoorMapping: mapping.id,
              points: '',
              siteId: payload.siteId
            }
          }
          try {
            const resp = await AreaService.createArea(areaPayload)
            resolve (resp);
          } catch (e) {
            const errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
            reject(errorMessage);
          }
        } catch (e2) {
          let errorMessage;
          if(e2.data && e2.status === 409){
            errorMessage = i18n.t("area-duplicated");
          }else{
            errorMessage = e2.data ? e2.data.message : i18n.t("something-went-wrong");
          }            
          reject (errorMessage);
        }
      };
    })
  },
  async editAreaIndoorMapping({ commit }, params) {
    let image = new Image();
    image.src = params.file.preview;
    return new Promise((resolve, reject) => {
      image.onload = async () => {
        let ratio = image.height / image.width;
        let height = (BOUND_COORDINATES.EAST - BOUND_COORDINATES.WEST) * ratio;
        let south = BOUND_COORDINATES.NORTH - height;
        let nwCorner = {
          latitude: BOUND_COORDINATES.WEST,
          longitude: BOUND_COORDINATES.NORTH,
        };
        let seCorner = {
          latitude: BOUND_COORDINATES.EAST,
          longitude: south,
        };
        let payload = {
          account: {
            href: params.file.account.href,
            desc: ''
          },
          fileUrl: params.file.href, 
          name: params.area.name,
          nwCorner: nwCorner,
          seCorner: seCorner,
          siteId: params.area.site.id
        }
        try {
          await IndoorMappingService.editIndoorMapping(payload, params.area.indoorMapping);
          resolve(true);
        } catch (e) {
          let errorMessage = e.data ? e.data.message : i18n.t("something-went-wrong");
          reject (errorMessage);
        }
      };
    })
  },
  async createOutdoorArea({}, area) {
    try {
      const newArea = await AreaService.createArea(area)
      return newArea
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
    }
  },
  async editArea({}, area) {
    try {
      const editedArea = await AreaService.editArea(area)
      return editedArea
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
    }
  },  
  async deleteArea({}, areaId) {
    try {
      const deletedArea = await AreaService.deleteArea(areaId)
      return deletedArea
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
    }
  },  
  async getAreaIndoorFile({ commit }, { areaId }) {
    try {
      let indoorMappingResponse = await AreaService.getAreaIndoorMapFile(areaId);
   
      if (indoorMappingResponse && indoorMappingResponse.file) {
        const imgObj = {
          id: indoorMappingResponse.id,
          account: {
            href: indoorMappingResponse.account.href
          },
          href: indoorMappingResponse.file.href,
          name: indoorMappingResponse.name,
          preview: indoorMappingResponse.file.imgData
        }
        const areaFileMapping = {
          file: [imgObj],
          nwCorner: indoorMappingResponse.nwCorner,
          seCorner: indoorMappingResponse.seCorner

        } 
        return areaFileMapping;
      }
    } catch (e) {
      throw new Error(i18n.t("something-went-wrong"), e);
    }
  },
  async saveAF3Points({ }, data){
    try{
      return AreaService.saveAF3Points(data);
    } catch (e) {
      throw e;
    }
  },
  async getAF3Points({ }, areaId){
    try{
      return AreaService.getAF3Points(areaId);
    } catch (e) {
      throw e;
    }
  }
};

export default {
  namespaced,
  state,
  mutations,
  getters,
  actions,
};
