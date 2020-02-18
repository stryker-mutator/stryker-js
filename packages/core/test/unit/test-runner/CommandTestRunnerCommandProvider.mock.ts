import { RunOptions } from '@stryker-mutator/api/test_runner';

const command = 'npm test';

module.exports = function getCommand({ mutatedFileName }: RunOptions) {
  return mutatedFileName ? `${command} --testFilesRelatedTo="${mutatedFileName}"` : command;
};
