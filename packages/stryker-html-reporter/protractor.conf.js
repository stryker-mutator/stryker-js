const spawn = require('child_process').spawn;
const os = require('os');

function spawnWebdriverManager() {
  return new Promise((res, rej) => {
    const cmd = os.platform() === 'win32' ? 'webdriver-manager.cmd' : 'webdriver-manager';
    const webdriverProcess = spawn(cmd, ['start']);
    webdriverProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data.toString()}`);
    });

    webdriverProcess.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
      if (data.toString().indexOf('Selenium Server is up and running')) {
        res();
      }
    });

    webdriverProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });


    process.on('SIGINT', () => {
      console.log('Received SIGINT, killing webdriver-manager');
      webdriverProcess.kill('SIGINT');
    });
  });
}

var config = {
  directConnect: true,

  capabilities: {
    'browserName': 'chrome'
  },

  framework: 'mocha',

  specs: ['test/helpers/**/*.js', 'test/ui/**/*.js'],

  mochaOpts: {
    timeout: 30000
  }
};

// if (process.env.TRAVIS) {
//   const webdriverPromise = spawnWebdriverManager();

//   config.capabilities = {
//     browserName: 'firefox'
//   };
//   config.seleniumAddress = 'http://localhost:4444/wd/hub';
//   config.directConnect = false;
//   config.beforeLaunch = function () {
//     return webdriverPromise;
//   }
// }

exports.config = config;
