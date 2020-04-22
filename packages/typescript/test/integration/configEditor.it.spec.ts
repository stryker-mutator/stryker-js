import * as path from 'path';

import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import TypescriptOptionsEditor from '../../src/TypescriptOptionsEditor';

function resolveSampleProject(relativeFileName: string) {
  return path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', relativeFileName);
}

describe('Read TS Config file integration', () => {
  it('should discover files like TS does', () => {
    const config = factory.strykerOptions();
    config.tsconfigFile = resolveSampleProject('tsconfig.json');
    testInjector.injector.injectClass(TypescriptOptionsEditor).edit(config);
    const actual = config.tsconfig;
    expect(actual.fileNames.map(path.normalize)).deep.eq([resolveSampleProject('math.ts'), resolveSampleProject('useMath.ts')]);
  });
});
