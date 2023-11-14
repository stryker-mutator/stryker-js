import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';

import chai, { expect } from 'chai';
import { execa, execaSync } from 'execa';
import { it } from 'mocha';
import chaiAsPromised from 'chai-as-promised';

import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

chai.use(chaiAsPromised);

const rootResolve = path.resolve.bind(path, fileURLToPath(new URL('..', import.meta.url)));

describe('in place', () => {
  /**
   * @type {string}
   */
  let originalAddJSContent;
  function readAddJS() {
    return fsPromises.readFile(rootResolve('src', 'Add.js'), 'utf-8');
  }
  before(async () => {
    originalAddJSContent = await readAddJS();
  });
  afterEach(async () => {
    await fsPromises.rm(rootResolve('reports'), { force: true, recursive: true });
    await fsPromises.rm(rootResolve('.lock'), { force: true, recursive: true });
  });
  it('should reset files after a successful run', async () => {
    execaSync('stryker', ['run']);
    const addJSContent = await fsPromises.readFile(rootResolve('src', 'Add.js'), 'utf-8');
    expect(addJSContent).eq(originalAddJSContent);
  });
  it('should report correct score', async () => {
    execaSync('stryker', ['run']);
    await expectMetricsJsonToMatchSnapshot();
  });
  it('should also reset the files if Stryker exits unexpectedly', async () => {
    // Arrange
    let addJSMutatedContent;
    await fsPromises.writeFile(rootResolve('.lock'), ''); // this will lock the test run completion
    const onGoingStrykerRun = execa('node', [path.resolve('..', '..', 'node_modules', '.bin', 'stryker'), 'run']);
    onGoingStrykerRun.stdout.on('data', async (data) => {
      if (data.toString().includes('Starting initial test run')) {
        addJSMutatedContent = await readAddJS();
        // Now, mr bond, it is time to die!
        onGoingStrykerRun.kill();
      }
    });
    // Act
    await expect(onGoingStrykerRun).rejected;
    // Assert
    expect(await readAddJS()).eq(originalAddJSContent);
    expect(addJSMutatedContent).not.eq(originalAddJSContent);
  });
});
