import authConstants from '../constants/auth';

function getTokenData() {
  try {
    let data = localStorage.getItem(authConstants.tokenString) || '{}';
    return JSON.parse(data);
  } catch (e) { e; }
  return {};
}

function saveTokenData(tokenInfo) {
  localStorage.setItem(authConstants.tokenString, JSON.stringify(tokenInfo));
}

export { getTokenData, saveTokenData };
