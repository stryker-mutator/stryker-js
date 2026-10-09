import { fileURLToPath } from 'node:url';

const avaCliPath = fileURLToPath(
  new URL('./node_modules/ava/entrypoints/cli.js', import.meta.url),
);

export default {
  testRunner: 'tap',
  concurrency: 1,
  reporters: ['json', 'clear-text', 'html', 'event-recorder'],
  plugins: [import.meta.resolve('@stryker-mutator/tap-runner')],
  tap: {
    nodeArgs: [avaCliPath, '--tap', "--node-arguments='-r {{hookFile}}'"],
    forceBail: false,
  },
};
