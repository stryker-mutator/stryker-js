const requireOptions = {
  paths: [process.cwd()],
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cucumberApi: typeof import('@cucumber/cucumber/api') = require(
  require.resolve('@cucumber/cucumber/api', requireOptions),
);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cucumber: typeof import('@cucumber/cucumber') = require(
  require.resolve('@cucumber/cucumber', requireOptions),
);

export const runCucumber = cucumberApi.runCucumber;
export const loadConfiguration = cucumberApi.loadConfiguration;
export const Formatter = cucumber.Formatter;
export const version = cucumber.version;
