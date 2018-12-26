import { expect } from 'chai';
import * as path from 'path';
import { Config } from 'stryker-api/config';
import TypescriptConfigEditor from '../../src/TypescriptConfigEditor';

function resolveSampleProject(relativeFileName: string) {
  return path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', relativeFileName);
}

describe('Read TS Config file integration', () => {
  it('should discover files like TS does', () => {
    const config = new Config();
    config.tsconfigFile = resolveSampleProject('tsconfig.json');
    new TypescriptConfigEditor().edit(config);
    const actual = config.tsconfig;
    expect(actual.fileNames.map(path.normalize)).deep.eq([
      resolveSampleProject('math.ts'),
      resolveSampleProject('useMath.ts')
    ]);
  });
});
