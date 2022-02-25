import { fileURLToPath, URL } from 'url';

import { expect } from 'chai';

import jestEnvironmentGeneric from '../../../src/jest-plugins/cjs/jest-environment-generic.js';
import { state } from '../../../src/jest-plugins/cjs/messaging.js';
import * as producers from '../../helpers/producers.js';

import JestTestEnvironment from './cjs/jest-environment-generic-jest-environment.js';

describe(jestEnvironmentGeneric.name, () => {
  it('should still allow for custom environments (defined as commonjs module)', async () => {
    // Arrange
    state.jestEnvironment = fileURLToPath(new URL('./cjs/jest-environment-generic-jest-environment.js', import.meta.url));

    // Act
    const jestEnv = jestEnvironmentGeneric(producers.createProjectConfig(), producers.createEnvironmentContext());
    await jestEnv.handleTestEvent?.(producers.createCircusRunStartEvent(), producers.createCircusState());

    // Assert
    expect((jestEnv as JestTestEnvironment).events).deep.eq(['run_start']);
  });

  it('should mix in the StrykerTestEnvironment', async () => {
    // Arrange
    state.clear();
    state.jestEnvironment = fileURLToPath(new URL('./cjs/jest-environment-generic-jest-environment.js', import.meta.url));

    // Act
    const jestEnv = jestEnvironmentGeneric(producers.createProjectConfig(), producers.createEnvironmentContext({ testPath: 'foo.spec.js' }));
    await jestEnv.teardown();

    // Assert
    expect(state.testFilesWithStrykerEnvironment).lengthOf(1);
    expect(state.testFilesWithStrykerEnvironment).contains('foo.spec.js');
  });
});
