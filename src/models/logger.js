const applicationName = process.env.VUE_APP_NAME || 'AirFinder-Portal';
const applicationEnvironment = process.env.VUE_APP_ENVIRONMENT_NAME || 'Unknown';
const userAgent = window.navigator.userAgent || 'Unknown';

function getDeviceIdentifier() {
  return window.location.hostname;
}

function getErrorMessage(errorLog) {
  let value = errorLog.message;
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    value = `User: ${userEmail}\n${value}`;
  }
  value = `${value}\nPAGE: ${window.location.href}`;
  if (errorLog.url) {
    value = `${value}\nURL: ${errorLog.url}`;
  }
  if (typeof errorLog.status === 'number') {
    value = `${value}\nSTATUS: ${errorLog.status}`;
  }
  if (errorLog.stack) {
    value = `${value}\nStack: ${errorLog.stack}`;
  }
  
  return value;
}

class Logger {
  /**
   * Convert ErrorLog object to Logger API payload 
   *
   * @param {object} errorLog - ErrorLog Object
   * @param {string} errorLog.message - ErrorLog message
   * @param {string} [errorLog.title] - Error title, defaults to ErrorLog message
   * @param {string} [errorLog.source] - Error source
   * @param {string} [errorLog.stack] - Error stack
   * @param {string} [errorLog.url] - Error api url to be sent in the message
   * @param {number} [errorLog.status] - Error api response status to be sent in the message
   * @param {string} severity - The severity of error
   * @returns
   */
  serialize = (errorLog, severity) => {
    return {
        summary: errorLog.title || getErrorMessage(errorLog),
        device: getDeviceIdentifier(),    
        component: errorLog.source || 'Unknown',   
        severity: severity,
        message: getErrorMessage(errorLog),
        applicationName,
        applicationEnvironment,
        userAgent
    };
  }
}

export default new Logger();