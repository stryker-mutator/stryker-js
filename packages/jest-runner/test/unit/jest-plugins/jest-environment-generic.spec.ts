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
    state.clear();
    state.jestEnvironment = require.resolve('./jest-environment-generic-jest-environment');

    // Act
    const jestEnv = jestEnvironmentGeneric(producers.createProjectConfig(), producers.createEnvironmentContext({ testPath: 'foo.spec.js' }));
    await jestEnv.teardown();

    // Assert
    expect(state.testFilesWithStrykerEnvironment).lengthOf(1);
    expect(state.testFilesWithStrykerEnvironment).contains('foo.spec.js');
  });
});
