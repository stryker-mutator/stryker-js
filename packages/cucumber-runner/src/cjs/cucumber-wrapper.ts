// eslint-disable-next-line
const cucumber = require(require.resolve('@cucumber/cucumber', {
  paths: [process.cwd()],
}));
// eslint-disable-next-line
export const Cli: typeof import('@cucumber/cucumber').Cli = cucumber.Cli;
export const Formatter: typeof import('@cucumber/cucumber').Formatter =
  cucumber.Formatter;
