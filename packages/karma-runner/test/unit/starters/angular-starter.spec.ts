import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import * as sut from '../../../src/starters/angularStarter';
import * as utils from '../../../src/utils';

describe('angularStarter', () => {
  let requireModuleStub: sinon.SinonStub;
  let cliStub: sinon.SinonStub;
  let getLogger: LoggerFactoryMethod;

  beforeEach(() => {
    cliStub = sinon.stub();
    requireModuleStub = sinon.stub(utils, 'requireModule');
    requireModuleStub.withArgs('@angular/cli').returns(cliStub);
    getLogger = () => testInjector.logger;
  });

  it('should throw an error if angular cli version < 6.1.0', async () => {
    setAngularVersion('6.0.8');
    await expect(sut.start(getLogger)).rejectedWith('Your @angular/cli version (6.0.8) is not supported. Please install 6.1.0 or higher');
  });

  it('should support version 6.1.0 and up inc release candidates', async () => {
    cliStub.resolves();
    requireModuleStub
      .withArgs('@angular/cli/package')
      .onFirstCall()
      .returns({ version: '6.1.0-rc.0' })
      .onSecondCall()
      .returns({ version: '6.2.0' })
      .onThirdCall()
      .returns({ version: '6.2.0-rc.0' });
    await expect(sut.start(getLogger)).not.rejected;
    await expect(sut.start(getLogger)).not.rejected;
    await expect(sut.start(getLogger)).not.rejected;
  });

  it('should execute the cli', async () => {
    cliStub.resolves();
    setAngularVersion();
    await sut.start(getLogger);
    expect(cliStub).calledWith({
      cliArgs: ['test', '--progress=false', `--karma-config=${require.resolve('../../../src/starters/stryker-karma.conf')}`],
      inputStream: process.stdin,
      outputStream: process.stdout,
    });
  });

  it('should reject if cliStub resolves with `1` (exit code)', async () => {
    setAngularVersion();
    cliStub.resolves(1);
    await expect(sut.start(getLogger)).rejectedWith('`ng test` command failed with exit code 1');
  });

  it('should forward ngOptions', async () => {
    setAngularVersion();
    cliStub.resolves();
    await sut.start(getLogger, {
      testArguments: {
        baz: 'true',
        foo: 'bar',
        fooBar: 'baz',
      },
    });
    expect(cliStub).calledWith({
      cliArgs: [
        'test',
        '--progress=false',
        `--karma-config=${require.resolve('../../../src/starters/stryker-karma.conf')}`,
        '--baz=true',
        '--foo=bar',
        '--foo-bar=baz',
      ],
      inputStream: process.stdin,
      outputStream: process.stdout,
    });
  });

  it('should reject when ngOptions are prefixed', async () => {
    setAngularVersion();
    return expect(
      sut.start(getLogger, {
        testArguments: {
          '--project': '@ns/myproj',
        },
      })
    ).rejectedWith("Don't prefix arguments with dashes ('-'). Stryker will do this automatically. Problematic arguments are --project");
  });

  function setAngularVersion(version = '100') {
    requireModuleStub.withArgs('@angular/cli/package').returns({ version });
  }
});
