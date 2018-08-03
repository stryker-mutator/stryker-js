import { expect } from 'chai';
import * as utils from '../../../src/utils';
import * as sut from '../../../src/starters/angularStarter';

describe('angularStarter', () => {
  let requireModuleStub: sinon.SinonStub;
  let cliStub: sinon.SinonStub;
  
  beforeEach(() => {
    cliStub = sandbox.stub();
    requireModuleStub = sandbox.stub(utils, 'requireModule');
    requireModuleStub.withArgs('@angular/cli/lib/cli').returns(cliStub);
  });

  it('should throw an error if angular cli version < 6.1.0', async () => {
    requireModuleStub.withArgs('@angular/cli/package').returns({ version: '6.0.8'});
    await expect(sut.start()).rejectedWith('Your @angular/cli version (6.0.8) is not supported. Please install 6.1.0 or higher');
  });

  it('should support version 6.1.0 and up inc release candidates', async () => {
    requireModuleStub.withArgs('@angular/cli/package')
      .onFirstCall().returns({ version: '6.1.0-rc.0'})
      .onSecondCall().returns({ version: '6.2.0' })
      .onThirdCall().returns({ version: '6.2.0-rc.0' });
    await expect(sut.start()).not.rejected;
    await expect(sut.start()).not.rejected;
    await expect(sut.start()).not.rejected;
  });

  it('should execute the cli', async () => {
    requireModuleStub.withArgs('@angular/cli/package').returns({ version: '100' });
    await sut.start();
    expect(cliStub).calledWith({
      cliArgs: ['test', '--progress=false', `--karma-config=${require.resolve('../../../src/starters/stryker-karma.conf')}`],
      inputStream: process.stdin,
      outputStream: process.stdout
    });
  });
  
});
