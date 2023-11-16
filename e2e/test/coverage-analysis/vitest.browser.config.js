import config from './vitest.config.js';

config.test.browser = {
  enabled: true,
  name: 'chromium',
  provider: 'playwright',
  headless: true,
};

export default config;
