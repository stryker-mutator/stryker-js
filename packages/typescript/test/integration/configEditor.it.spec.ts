import * as path from 'path';

import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import TypescriptOptionsEditor from '../../src/TypescriptOptionsEditor';
import { TypescriptWithStrykerOptions } from '../../src/TypescriptWithStrykerOptions';

function resolveSampleProject(relativeFileName: string) {
  return path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', relativeFileName);
}

describe('Read TS Config file integration', () => {
  it('should discover files like TS does', () => {
    const config = factory.strykerOptions() as TypescriptWithStrykerOptions;
    config.tsconfigFile = resolveSampleProject('tsconfig.json');
    testInjector.injector.injectClass(TypescriptOptionsEditor).edit(config);
    expect((config.tsconfig!.fileNames as string[]).map(path.normalize)).deep.eq([
      resolveSampleProject('math.ts'),
      resolveSampleProject('useMath.ts'),
    ]);
  });
});
