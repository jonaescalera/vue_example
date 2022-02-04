import axios from 'axios';
import authService from '../services/auth';
import loggerService from '../services/logger';
import store from '../store/store';

export default (() => {
  const networkAssetURL = process.env.VUE_APP_NETWORK_ASSETS_URL || '';
  const clientEdgeURL = process.env.VUE_APP_CLIENT_EDGE_BASE || '';
  const accessURL = process.env.VUE_APP_ACCESS_SERVER || '';

  const axiosInstance = axios.create();
  injectAuthIntoAxios(axiosInstance);
  injectLoggerIntoAxios(axiosInstance);

  function getNetworkAsset(hideLoadingIndicator) {
    const axiosInstanceNetworkAsset = axios.create({ baseURL: networkAssetURL });    
    injectAuthIntoAxios(axiosInstanceNetworkAsset);
    if (hideLoadingIndicator !== 'hideLoadingIndicator') {
      injectLoadingIntoAxios(axiosInstanceNetworkAsset);
    }
    injectLoggerIntoAxios(axiosInstanceNetworkAsset);
    return axiosInstanceNetworkAsset;
  }

  function getClientEdge(hideLoadingIndicator) {
    const axiosInstanceClientEdge = axios.create({ baseURL: clientEdgeURL });
    injectAuthIntoAxios(axiosInstanceClientEdge);
    injectLoggerIntoAxios(axiosInstanceClientEdge);
    if (hideLoadingIndicator !== 'hideLoadingIndicator') {
      injectLoadingIntoAxios(axiosInstanceClientEdge);
    }
    return axiosInstanceClientEdge;
  }

  function getAccess(hideLoadingIndicator) {
    const axiosInstance = axios.create({ baseURL: accessURL });
    injectAuthIntoAxios(axiosInstance);
    injectLoggerIntoAxios(axiosInstance);
    if (hideLoadingIndicator !== 'hideLoadingIndicator') {
      injectLoadingIntoAxios(axiosInstance);
    }
    return axiosInstance;
  }

  function injectAuthIntoAxios(axiosObj) {
    axiosObj.interceptors.request.use(
      // Intercept an API requests and add authentication using the latest Access Token in the application
      async function (config) {
        const accessToken = await authService.getAccessToken();
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      function (error) {
        return Promise.reject(error)
      }
    );

    axiosObj.interceptors.response.use(
      function (response) {
        return response;
      },
      // Intercept an API error and Refresh Token if 401 received and then retry the original request
      async function (error) {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await authService.refreshToken();
            return axiosObj(originalRequest);
          } catch {
            store.dispatch('logout', {vuetify: null});
          }
        }
        throw error;
      }
    );
  }

  function injectLoggerIntoAxios(axiosObj) {
    axiosObj.interceptors.response.use(
      function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Returning response is requirement of axios interceptors
        return response;
      },
      function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Encapsulating logging code in try catch to prevent cyclic error logging if error logging fails
        try {
          const response = error && error.response;
          // Log all errors which are not 401 errors because logging API is authenticated
          if (response && response.status !== 401) {
            let url = response.config.url;
            if (response.config.baseURL) {
              url = `${response.config.baseURL}${url}`;
            }
            loggerService.error({
              message: 'API error',
              status: response.status,
              source: 'Axios Response Interceptor',
              url,
            }).catch(() => {});
          }
        } catch (e) { e; }
        // Returning a rejected Promise of error is requirement of axios interceptors
        return Promise.reject(error.response ? error.response : error);
      }
    );
  }

  function injectLoadingIntoAxios(axiosObj) {        
    // for each request / response / error increase or decrease the amount of loading items in store
    axiosObj.interceptors.request.use(
      function (config) {
        store.dispatch('layout/setLoading', true);
        return config;
      }
    );
    axiosObj.interceptors.response.use(
      function (response) {
        store.dispatch('layout/setLoading', false);
        return response;
      },
      function (error) {
        store.dispatch('layout/setLoading', false);
        return Promise.reject(error.response ? error.response : error);
      }
    );
  }

  return {
    axiosInstance, 
    getNetworkAsset,
    getClientEdge,
    getAccess,
  };
})();
