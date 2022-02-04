const { argv } = require("yargs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const app = argv.app || "default";

const appConfig = {
  main: {
    entryApp: "./src/main.js",
    title: "AirFinder Portal",
    outputDir: "./dist"
  },
  activate: {
    entryApp: "./src/activate-main.js",
    title: "Activate App",
    outputDir: "./dist-activate"
  }
};
appConfig.default = appConfig.main;

module.exports = {
  "pluginOptions": {
    "i18n": {
      "locale": "en",
      "fallbackLocale": "en",
      "localeDir": "locales",
      "enableInSFC": true
    }
  },
  "transpileDependencies": [
    "vuetify", 'vuex-persist'
  ],
  "lintOnSave": false,
  "runtimeCompiler": false,
  "configureWebpack": config => {
    config.entry.app = appConfig[app].entryApp;
    let htmlWebpackPlugin = config.plugins.find(
      plugin => plugin instanceof HtmlWebpackPlugin
    );
    htmlWebpackPlugin.options.title = appConfig[app].title;
  },
  "outputDir": appConfig[app].outputDir
}