import * as contextCreators from '../../../src/di/contextCreators';
import { PluginLoader } from '../../../src/di/PluginLoader';
import * as typedInject from 'typed-inject';
import * as sinon from 'sinon';
import { Injector } from 'typed-inject';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { commonTokens } from 'stryker-api/plugin';
import { Config } from 'stryker-api/config';
import { TestFramework } from 'stryker-api/test_framework';
import TestFrameworkOrchestrator from '../../../src/TestFrameworkOrchestrator';
import { coreTokens } from '../../../src/di';

describe('contextCreators', () => {

  let testFrameworkOrchestratorMock: sinon.SinonStubbedInstance<TestFrameworkOrchestrator>;
  let pluginLoaderMock: sinon.SinonStubbedInstance<PluginLoader>;
  let injectorMock: sinon.SinonStubbedInstance<Injector>;
  let testFrameworkMock: TestFramework;

  beforeEach(() => {
    testFrameworkMock = factory.testFramework();
    testFrameworkOrchestratorMock = sinon.createStubInstance(TestFrameworkOrchestrator);
    testFrameworkOrchestratorMock.determineTestFramework.returns(testFrameworkMock);
    injectorMock = factory.injector();
    sinon.stub(typedInject, 'rootInjector').value(injectorMock);
    pluginLoaderMock = sinon.createStubInstance(PluginLoader);
    injectorMock.injectClass
      .withArgs(PluginLoader).returns(pluginLoaderMock)
      .withArgs(TestFrameworkOrchestrator).returns(testFrameworkOrchestratorMock);
  });

  describe('loadCoreInjector', () => {
    it('should load plugins', () => {
      contextCreators.createCoreInjector(new Config());
      expect(injectorMock.provideFactory).calledWith(commonTokens.pluginResolver, sinon.match.func);
      injectorMock.provideFactory.withArgs(commonTokens.pluginResolver).callArgWith(1, injectorMock);
      expect(pluginLoaderMock.load).to.have.been.calledWith();
    });

    it('should determine the testFramework', () => {
      contextCreators.createCoreInjector(new Config());
      expect(injectorMock.provideFactory).calledWith(coreTokens.testFramework, sinon.match.func);
      injectorMock.provideFactory.withArgs(coreTokens.testFramework).callArgWith(1, injectorMock);
      expect(testFrameworkOrchestratorMock.determineTestFramework).called;
    });

  });
});
