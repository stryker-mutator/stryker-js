import { testInjector } from '@stryker-mutator/test-helpers';
import type { requireResolve } from '@stryker-mutator/util';
import { expect } from 'chai';
import sinon from 'sinon';

import { strykerKarmaConfigPath } from '../../../src/karma-plugins/stryker-karma.conf.js';

import { KarmaRunnerOptionsWithStrykerOptions } from '../../../src/karma-runner-options-with-stryker-options.js';
import { pluginTokens } from '../../../src/plugin-tokens.js';
import { AngularProjectStarter } from '../../../src/starters/angular-starter.js';

describe('angularStarter', () => {
  let requireResolveStub: sinon.SinonStubbedMember<typeof requireResolve>;
  let cliStub: sinon.SinonStub;
  let sut: AngularProjectStarter;
  let options: KarmaRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    cliStub = sinon.stub();
    requireResolveStub = sinon.stub();
    requireResolveStub.withArgs('@angular/cli').returns(cliStub);
    sut = testInjector.injector.provideValue(pluginTokens.requireResolve, requireResolveStub).injectClass(AngularProjectStarter);
    options = testInjector.options as KarmaRunnerOptionsWithStrykerOptions;
    options.karma = { projectType: 'angular-cli' };
  });

  it('should throw an error if angular cli version < 6.1.0', async () => {
    setAngularVersion('6.0.8');
    await expect(sut.start()).rejectedWith('Your @angular/cli version (6.0.8) is not supported. Please install 6.1.0 or higher');
  });

  it('should support version 6.1.0 and up inc release candidates', async () => {
    cliStub.resolves();
    requireResolveStub
      .withArgs('@angular/cli/package')
      .onFirstCall()
      .returns({ version: '6.1.0-rc.0' })
      .onSecondCall()
      .returns({ version: '6.2.0' })
      .onThirdCall()
      .returns({ version: '6.2.0-rc.0' });
    await expect(sut.start()).not.rejected;
    await expect(sut.start()).not.rejected;
    await expect(sut.start()).not.rejected;
  });

  it('should execute the cli', async () => {
    cliStub.resolves();
    setAngularVersion();
    await sut.start();
    expect(cliStub).calledWith({
      cliArgs: ['test', '--progress=false', `--karma-config=${strykerKarmaConfigPath}`],
    });
  });

  it('should forward ngOptions', async () => {
    options.karma.ngConfig = {
      testArguments: {
        baz: 'true',
        foo: 'bar',
        fooBar: 'baz',
      },
    };
    setAngularVersion();
    cliStub.resolves();
    await sut.start();
    expect(cliStub).calledWith({
      cliArgs: ['test', '--progress=false', `--karma-config=${strykerKarmaConfigPath}`, '--baz=true', '--foo=bar', '--foo-bar=baz'],
    });
  });

  it('should reject when ngOptions are prefixed', async () => {
    options.karma.ngConfig = {
      testArguments: {
        '--project': '@ns/myproj',
      },
    };
    setAngularVersion();
    return expect(sut.start()).rejectedWith(
      "Don't prefix arguments with dashes ('-'). Stryker will do this automatically. Problematic arguments are --project"
    );
  });

  function setAngularVersion(version = '100') {
    requireResolveStub.withArgs('@angular/cli/package').returns({ version });
  }
});
