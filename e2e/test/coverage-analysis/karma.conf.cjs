// Karma configuration
// Generated on Tue Nov 30 2021 09:57:14 GMT+0100 (Central European Standard Time)
const fs = require('fs');

const chaiSetup = fs.readFileSync('./spec/chai-setup.js', 'utf-8').replace("import chai from 'chai';", '');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['chai', 'jasmine'],
    files: [
      { pattern: 'src/**/*.js', type: 'module', included: true },
      { pattern: 'spec/**/*.js', type: 'module' },
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity,
    beforeMiddleware: ['custom'],
    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-mocha',
      'karma-chai',
      {
        'middleware:custom': [
          'value',
          function (req, res, next) {
            const url = new URL(req.url, 'http://localhost:9876');
            if (url.pathname.endsWith('chai-setup.js')) {
              res.writeHead(200, {
                'Content-Type': 'application/javascript',
              });
              res.write(chaiSetup);
              res.end();
            } else {
              next();
            }
          },
        ],
      },
    ],
  });
};
