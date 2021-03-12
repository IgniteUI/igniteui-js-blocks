// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'jasmine-spec-tags', '@angular-devkit/build-angular'],
    files: [
      { pattern: '../../node_modules/hammerjs/hammer.min.js', watched: false },
      { pattern: '../../node_modules/hammer-simulator/index.js', watched: false },
      { pattern: './test.css', watched: false },
      { pattern: '../../dist/igniteui-angular/styles/igniteui-angular.css', watched: false }
    ],
    plugins: [
      require('karma-jasmine'),
      require('karma-coverage'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-spec-tags'),
      require('karma-jasmine-html-reporter'),
      require('karma-spec-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false
      },
      tagPrefix: '#',
      tags: 'grid',
      skipTags: 'perf'
    },
    preprocessors: {
      'projects/igniteui-angular/**/*.js': ['coverage']
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../../coverage/grid'),
      reporters: [
        // reporters not supporting the `file` property
        { type: 'html' },
        { type: 'json' },
        { type: 'lcovonly' },
      ]
    },
    reporters: ['progress'],
    specReporter: {
        suppressSkipped: true,
        suppressErrorSummary: false,
        suppressFailed: false,
        suppressPassed: false,
        showSpecTiming: false,
        failFast: false
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '-disable-dev-shm-usage'],
        debug: false
      }
    },
    browserDisconnectTolerance: 3, //this one helps
    browserNoActivityTimeout : 10000,
    singleRun: true
  });
};
