import config from './vitest.config.js';
import { playwright } from '@vitest/browser-playwright';

config.test.browser = {
  enabled: true,
  instances: [{ browser: 'chromium' }],
  provider: playwright({
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH,
    },
  }),
  headless: true,
};

export default config;
