import config from './vitest.config.js';

config.test.browser = {
  enabled: true,
  instances: [{ browser: 'chromium' }],
  provider: 'playwright',
  headless: true,
};

export default config;
