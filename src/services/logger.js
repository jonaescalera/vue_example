import Vue from 'vue';
import axios from 'axios';
import authService from './auth';
import { LOG_TYPES } from '../constants/logger';
import Logger from '../models/logger';

export default (() => {
  const zenossUrl = process.env.VUE_APP_ZENOSS_URL || '';

  async function send(errorLog, severity = LOG_TYPES.DEBUG) {
    if (!errorLog || !errorLog.message) throw Error('Incorrect Arguments');
    const accessToken = await authService.getAccessToken();
    if (accessToken) {
      try {
        return await axios.post(
          zenossUrl,
          Logger.serialize(errorLog, severity),
          {
            headers: { 'authorization': `Bearer ${accessToken}` }
          }
        )
      } catch (e) { e; }
    }
  }

  function error(errorLog) {
    return send(errorLog, LOG_TYPES.ERROR);
  }

  function warn(errorLog) {
    return send(errorLog, LOG_TYPES.WARN);
  }

  function debug(errorLog) {
    return send(errorLog, LOG_TYPES.DEBUG);
  }

  // Intercepting Console Warnings
  const consoleWarn = console.warn.bind(console)
  console.warn = (...args) => {
    // Encapsulating logging code in try catch to prevent cyclic error logging if error logging fails
    try {
      warn({
        message: args.join('\n'),
        source: 'console.warn'
      }).catch(() => {});
    } catch (e) { e; }
    consoleWarn(...args);
  }

  // Intercepting Console Errors
  const consoleError = console.error.bind(console)
  console.error = (...args) => {
    // Encapsulating logging code in try catch to prevent cyclic error logging if error logging fails
    try {
      if((args.length === 1) && args[0].status !== 404){
        error({
          //this is to can read a 400 error without setting message as [object Object]
          message: ((args.length === 1) && args[0].data) ? Object.values(args[0].data).join('\n') : args.join('\n'),
          source: 'console.error',
          status: args[0].status ? args[0].status : '',
          url: args[0].config && args[0].config.url ? args[0].config.url : ''
        }).catch(() => {});
      }
    } catch (e) { e; }
    consoleError(...args);
  }

  // Catching Uncaught Javascript Errors
  window.addEventListener('error', function(event) {
    // Encapsulating logging code in try catch to prevent cyclic error logging if error logging fails
    try {
      const errorData = event.error;
      errorData.message = event.message;
      errorData.source = 'window.onerror';
      error(errorData).catch(() => {});
    } catch (e) { e; }
  })

  // Catching Unhandled Javascript Promise Rejections
  window.addEventListener("unhandledrejection", function(event) {
    // Encapsulating logging code in try catch to prevent cyclic error logging if error logging fails
    try {
      error({
        message: event.reason.stack,
        source: 'window.unhandledrejection'
      }).catch(() => {});
    } catch (e) { e; }
  });

  Vue.config.errorHandler = (err, vm, info) => {
    // err: error trace
    // vm: component in which error occurred
    // info: Vue specific error information such as lifecycle hooks, events etc.

    try {
      const errorData = err;
      let source = `Info: ${info}`;
      if (vm.$options.name) {
        source = `${vm.$options.name}, ${source}`;
      }
      errorData.source = source;
      error(errorData).catch(() => {});
    } catch (e) { e; }
  };

  return {
    send,
    error,
    warn,
    debug
  };
})();
