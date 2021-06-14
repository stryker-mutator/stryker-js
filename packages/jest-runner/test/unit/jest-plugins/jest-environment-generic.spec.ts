import { expect } from 'chai';

import jestEnvironmentGeneric from '../../../src/jest-plugins/jest-environment-generic';
import { state } from '../../../src/messaging';
import * as producers from '../../helpers/producers';

import JestTestEnvironment from './jest-environment-generic-jest-environment';

describe(jestEnvironmentGeneric.name, () => {
  it('should still allow for custom environments', async () => {
    // Arrange
    state.jestEnvironment = require.resolve('./jest-environment-generic-jest-environment');

    // Act
    const jestEnv = jestEnvironmentGeneric(producers.createProjectConfig(), producers.createEnvironmentContext());
    await jestEnv.handleTestEvent?.(producers.createCircusRunStartEvent(), producers.createCircusState());

    // Assert
    expect((jestEnv as JestTestEnvironment).events).deep.eq(['run_start']);
  });

  it('should mix in the StrykerTestEnvironment', async () => {
    // Arrange
    state.jestEnvironment = require.resolve('./jest-environment-generic-jest-environment');
    let actualFileName: string | undefined;
    state.setMutantCoverageHandler((fileName) => (actualFileName = fileName));

    // Act
    const jestEnv = jestEnvironmentGeneric(producers.createProjectConfig(), producers.createEnvironmentContext({ testPath: 'foo.spec.js' }));
    await jestEnv.teardown();

    // Assert
    state.resetMutantCoverageHandler();
    expect(actualFileName).eq('foo.spec.js');
  });
});
