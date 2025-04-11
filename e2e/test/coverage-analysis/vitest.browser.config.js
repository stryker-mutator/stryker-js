import config from './vitest.config.js';

config.test.browser = {
  enabled: true,
  provider: 'playwright',
  headless: true,
  instances: [
    {
      browser: 'chromium',
    }
  ]
};

export default config;
