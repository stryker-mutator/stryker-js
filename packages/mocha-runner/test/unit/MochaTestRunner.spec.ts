import { EventEmitter } from 'events';

import { commonTokens } from '@stryker-mutator/api/plugin';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as Mocha from 'mocha';

import sinon = require('sinon');

import { RunOptions } from '@stryker-mutator/api/test_runner';

import { MochaTestRunner } from '../../src/MochaTestRunner';
import { StrykerMochaReporter } from '../../src/StrykerMochaReporter';
import * as utils from '../../src/utils';
import { MochaAdapter } from '../../src/MochaAdapter';
import * as pluginTokens from '../../src/plugin-tokens';
import MochaOptionsLoader from '../../src/MochaOptionsLoader';
import { createMochaOptions } from '../helpers/factories';

describe(MochaTestRunner.name, () => {
  let mocha: sinon.SinonStubbedInstance<Mocha> & { suite: sinon.SinonStubbedInstance<EventEmitter> };
  let mochaAdapterMock: sinon.SinonStubbedInstance<MochaAdapter>;
  let mochaOptionsLoaderMock: sinon.SinonStubbedInstance<MochaOptionsLoader>;
  let sandboxFileNames: string[];

  beforeEach(() => {
    sinon.stub(utils, 'evalGlobal');
    sandboxFileNames = [];
    mochaAdapterMock = sinon.createStubInstance(MochaAdapter);
    mochaOptionsLoaderMock = sinon.createStubInstance(MochaOptionsLoader);
    mocha = sinon.createStubInstance(Mocha) as any;
    mocha.suite = sinon.createStubInstance(EventEmitter) as Mocha.Suite & sinon.SinonStubbedInstance<EventEmitter>;
    mochaAdapterMock.create.returns(mocha);
  });

  afterEach(() => {
    // These keys can be used to test the nodejs cache
    delete require.cache['foo.js'];
    delete require.cache['bar.js'];
    delete require.cache['baz.js'];
    delete StrykerMochaReporter.log;
  });

  function createSut(): MochaTestRunner {
    return testInjector.injector
      .provideValue(commonTokens.sandboxFileNames, sandboxFileNames)
      .provideValue(pluginTokens.mochaAdapter, mochaAdapterMock)
      .provideValue(pluginTokens.loader, mochaOptionsLoaderMock)
      .injectClass(MochaTestRunner);
  }

  describe('constructor', () => {
    it('should set the static `log` property on StrykerMochaReporter', () => {
      createSut();
      expect(StrykerMochaReporter.log).eq(testInjector.logger);
    });
  });

  describe('init', () => {
    let sut: MochaTestRunner;
    beforeEach(() => {
      sut = createSut();
    });

    it('should load mocha options', async () => {
      mochaOptionsLoaderMock.load.returns({});
      await sut.init();
      expect(mochaOptionsLoaderMock.load).calledWithExactly(testInjector.options);
    });

    it('should collect the files', async () => {
      const expectedTestFileNames = ['foo.js', 'foo.spec.js'];
      const mochaOptions = Object.freeze(createMochaOptions({ timeout: 23 }));
      mochaOptionsLoaderMock.load.returns(mochaOptions);
      mochaAdapterMock.collectFiles.returns(expectedTestFileNames);

      await sut.init();

      expect(mochaAdapterMock.collectFiles).calledWithExactly(mochaOptions);
      expect(sut.testFileNames).eq(expectedTestFileNames);
    });

    it('should not handle requires when there are not requires', async () => {
      mochaOptionsLoaderMock.load.returns({});
      await sut.init();
      expect(mochaAdapterMock.handleRequires).not.called;
    });

    it('should handle requires and collect root hooks', async () => {
      const requires = ['test/setup.js'];
      const expectedRootHooks = { beforeEach() {} };
      mochaOptionsLoaderMock.load.returns(createMochaOptions({ require: requires }));
      mochaAdapterMock.handleRequires.returns(expectedRootHooks);

      await sut.init();

      expect(sut.rootHooks).eq(expectedRootHooks);
    });
  });

  describe('run', () => {
    let sut: MochaTestRunner;
    let testFileNames: string[];
    beforeEach(() => {
      testFileNames = [];
      sut = createSut();
      sut.testFileNames = testFileNames;
      sut.mochaOptions = {};
    });

    it('should pass along supported options to mocha', async () => {
      // Arrange
      testFileNames.push('foo.js', 'bar.js', 'foo2.js');
      sut.mochaOptions['async-only'] = true;
      sut.mochaOptions.grep = 'grepme';
      sut.mochaOptions.opts = 'opts';
      sut.mochaOptions.require = [];
      sut.mochaOptions.timeout = 2000;
      sut.mochaOptions.ui = 'exports';

      // Act
      await actRun();

      // Assert
      expect(mocha.asyncOnly).called;
      expect(mocha.timeout).calledWith(2000);
      expect(mocha.ui).calledWith('exports');
      expect(mocha.grep).calledWith('grepme');
    });

    it("should don't set asyncOnly if asyncOnly is false", async () => {
      sut.mochaOptions['async-only'] = false;
      await actRun();
      expect(mocha.asyncOnly).not.called;
    });

    it('should pass rootHooks to the mocha instance', async () => {
      const rootHooks = { beforeEach() {} };
      sut.rootHooks = rootHooks;
      await actRun();
      expect(mochaAdapterMock.create).calledWithMatch({ rootHooks });
    });

    it('should add collected files ', async () => {
      sut.testFileNames.push('foo.js', 'bar.js', 'foo2.js');
      await actRun();
      expect(mocha.addFile).calledThrice;
      expect(mocha.addFile).calledWith('foo.js');
      expect(mocha.addFile).calledWith('foo2.js');
      expect(mocha.addFile).calledWith('bar.js');
    });

    it('should evaluate additional testHooks if required (in global mocha context)', async () => {
      testFileNames.push('');
      await actRun({ timeout: 0, testHooks: 'foobar();' });
      expect(utils.evalGlobal).calledWith('foobar();');
      expect(mocha.suite.emit).calledWith('pre-require', global, '', mocha);
      expect(mocha.suite.emit).calledWith('require', undefined, '', mocha);
      expect(mocha.suite.emit).calledWith('post-require', global, '', mocha);
    });

    it('should purge cached sandbox files', async () => {
      // Arrange
      sandboxFileNames.push('foo.js', 'bar.js');
      testFileNames.push('foo.js'); // should still purge 'bar.js'
      require.cache['foo.js'] = 'foo' as any;
      require.cache['bar.js'] = 'bar' as any;
      require.cache['baz.js'] = 'baz' as any;

      // Act
      await actRun();

      // Assert
      expect(require.cache['foo.js']).undefined;
      expect(require.cache['bar.js']).undefined;
      expect(require.cache['baz.js']).eq('baz');
    });

    async function actRun(options: RunOptions = { timeout: 0 }) {
      mocha.run.callsArg(0);
      return sut.run(options);
    }
  });
});
