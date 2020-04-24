import { expect } from 'chai';
import { readLogFile } from '../../../helpers';

describe('Verify errors', () => {

  it('should report the expected errors', async () => {
    const logFile = await readLogFile();
    expect(logFile).includes('Config option "mochaOptions.spec" has the wrong type');
    expect(logFile).includes('Config option "tsconfigFile" has the wrong type');
    expect(logFile).includes('Config option "babel.extensions" has the wrong type');
    expect(logFile).includes('Config option "jasmineConfigFile" has the wrong type');
    expect(logFile).not.includes('Config option "karma.projectType" has the wrong type');
    expect(logFile).includes('Config option "karma.projectType" should be one of the allowed values');
    expect(logFile).includes('Config option "webpack.configFile" has the wrong type');
  });
});
