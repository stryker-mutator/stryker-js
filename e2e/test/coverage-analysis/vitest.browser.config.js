import config from './vitest.config.js';
import { playwright } from '@vitest/browser-playwright';

config.test.browser = {
  enabled: true,
  instances: [{ browser: 'chromium' }],
  provider: playwright(),
  headless: true,
};

export default config;
