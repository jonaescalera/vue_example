import axios from 'axios';
import { getTokenData, saveTokenData } from '../utils/token';

export default (() => {
  const clientId = process.env.VUE_APP_CONDUCTOR_CLIENT_ID || '';
  const clientSecret = process.env.VUE_APP_CONDUCTOR_SECRET || '';
  const basePath = process.env.VUE_APP_AUTH_SERVER || '';
  const accessServerURL = process.env.VUE_APP_ACCESS_SERVER || '';
  const tokenPath = '/oauth/token';
  const tokenRevokePath = '/oauth2/revoke';
  const accessPath = '/access';
  const accessV2Path = '/access/v2';

  let refreshTokenInProgress;
  let refreshTokenPromise;

  function saveToken(data) {
    const tokenData = Object.assign({ last_refresh: Date.now() }, data);
    tokenData.expires_in = tokenData.expires_in * 1000;
    saveTokenData(tokenData);
    return tokenData;
  }

  function saveJwt(token){
    const tokenData = {
      access_token: token,
      token_type: "bearer",
    }
    saveTokenData(tokenData);
    return tokenData;
  }

  async function login(username, password) {
    const body =
      `grant_type=password&username=${encodeURIComponent(username)}` +
      `&password=${encodeURIComponent(password)}&` +
      `client_id=${clientId}&client_secret=${clientSecret}`;

    const url = basePath.concat(tokenPath);
    const response = await axios({
      method: 'post',
      url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: body,
    });
    return saveToken(response.data);
  }

  async function SSO(username, host) {
    const url = accessServerURL
      .concat(accessPath)
      .concat('/sso/login');
    const response = await axios({
      method: 'get',
      url,
      params: {
        email: username,
        relayState: host,
      },
    });
    return response.data;
  }

  function checkLoggedIn() {
    const tokenData = getTokenData();
    if (tokenData && tokenData.access_token) {
      return tokenData;
    }
    return null;
  }

  async function logout() {
    await revokeToken();
    localStorage.removeItem('my-app');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('conductor_auth_token');
    localStorage.removeItem('orgId');
    localStorage.removeItem('chmln:l.C.d');
    localStorage.removeItem('siteId');
    //reload needed to reset Google Analytics, if not reseted and logged in with a different account he old user-id will persist
    window.location.reload();
  }

  async function forgot(username) {
    const url = accessServerURL
      .concat(accessV2Path)
      .concat('/users/forgotPassword');
    const response = await axios({
      method: 'get',
      url,
      params: {
        email: username,
        clientId: clientId,
      },
    });
    return response.data;
  }

  async function reset(username, password, key) {
    const url = accessServerURL.concat(accessPath).concat('/users/verify');
    const response = await axios({
      method: 'post',
      url,
      data: {
        email: username,
        newPassword: password,
        verificationKey: key,
      },
    });
    return response.data;
  }

  async function revokeToken() {
    const url = basePath.concat(tokenRevokePath);
    const accessToken = await getAccessToken();
    try {
      await axios({
        method: 'post',
        url,
        headers: {
          'Content-Type': 'text/plain',
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'text',
      });
    } catch (error) {
      error;
    }
  }

  /**
   * Refreshes the Access and Refresh Tokens
   *
   * This function only uses only concurrent api call, it reuses a pending api call if it is in progress
   *
   * @returns {Promise} Promise of Token data object
   */
  async function refreshToken() {
    if (!refreshTokenInProgress) {
      refreshTokenInProgress = true;
      refreshTokenPromise = new Promise((resolve, reject) => {
        refreshTokenCall()
          .then(function (response) {
            resolve(response);
          })
          .catch(function (error) {
            reject(error);
          })
          .finally(function () {
            refreshTokenInProgress = false;
          });
      });
    }
    return refreshTokenPromise;
  }

  async function refreshTokenCall() {
    const refreshToken = getRefreshTokenSync();
    const body =
      `grant_type=refresh_token&refresh_token=${refreshToken}&` +
      `client_id=${clientId}&client_secret=${clientSecret}`;

    const url = basePath.concat(tokenPath);
    const response = await axios({
      method: 'post',
      url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: body,
    });
    return saveToken(response.data);
  }

  /**
   * Check if any Refresh Token call is in progress and wait for it
   *
   * @returns {Promise<undefined>} Promise which will resolve when no Refresh Token call is in progress
   */
  async function checkRefreshCallNotPending() {
    if (refreshTokenInProgress) {
      try {
        await refreshToken();
      } catch (e) {
        e;
      }
    }
  }

  /**
   * Gets the stored Access Token immediately but does not checks for an ongoing Refresh Token call
   *
   * The Access Token returned from this function may or may not be invalidated due to
   * any ongoing Refresh Token call and can also be expired
   *
   * Usage of this function is not recommended, you should instead use the Promise version
   * @see getAccessToken for the Promise version of Get Access Token
   *
   * @returns {string|null} Access Token which can be null if not present in application
   */
  function getAccessTokenSync() {
    const tokenData = getTokenData();
    return (tokenData && tokenData.access_token) || null;
  }

  /**
   * Gets the stored Access Token but checks for an ongoing Refresh Token call first
   *
   * The Access Token returned from this function will not be invalidated due to
   * any ongoing Refresh Token call but can be expired
   *
   * @returns {Promise<string|null>} Promise of an Access Token, which can be null if not present in application
   */
  async function getAccessToken() {
    await checkRefreshCallNotPending();
    return getAccessTokenSync();
  }

  function getRefreshTokenSync() {
    const tokenData = getTokenData();
    return (tokenData && tokenData.refresh_token) || null;
  }

  async function getTableauToken() {
    const payload = {
      userName: 'temp'
    };

    const url = "https://c2pesp01-usea1b.link-labs.com/auth";
    const response = await axios({
      method: 'post',
      url,
      data: payload,
    });
    return response.data;
  }

  return {
    login,
    SSO,
    saveJwt,
    checkLoggedIn,
    logout,
    forgot,
    reset,
    refreshToken,
    getAccessTokenSync,
    getAccessToken,
    getRefreshTokenSync,
    getTableauToken
  };
})();
