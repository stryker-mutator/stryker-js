import { expectMetrics } from '../../../helpers';
import { promises as fsPromises } from 'fs';
import chai from 'chai';
import execa from 'execa';
import rimraf from 'rimraf';
import path from 'path';
import { promisify } from 'util';
import { it } from 'mocha';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

const rm = promisify(rimraf);

const rootResolve: typeof path.resolve = path.resolve.bind(path, __dirname, '..');

describe('in place', () => {

  let originalAddJSContent: string;


  function readAddJS(): Promise<string> {
    return fsPromises.readFile(rootResolve('src', 'Add.js'), 'utf-8');
  }

  before(async () => {
    originalAddJSContent = await readAddJS();
  })


  afterEach(async () => {
    await rm(rootResolve('reports'));
    await rm(rootResolve('.lock'));
  })

  it('should reset files after a successful run', async () => {
    execa.sync('stryker', ['run']);
    const addJSContent = await fsPromises.readFile(rootResolve('src', 'Add.js'), 'utf-8');
    expect(addJSContent).eq(originalAddJSContent);
  });

  it('should report correct score', async () => {
    execa.sync('stryker', ['run']);
    await expectMetrics({ mutationScore: 73.68 });
  });

  it('should also reset the files if Stryker exits unexpectedly', async () => {
    // Arrange
    let addJSMutatedContent: string;
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
