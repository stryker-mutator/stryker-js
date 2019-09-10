import { File } from '@stryker-mutator/api/core';
import { Injector } from '@stryker-mutator/api/plugin';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { transpilerFactory } from '../../../src/transpiler';
import { ChildProcessTranspiler } from '../../../src/transpiler/ChildProcessTranspiler';

describe(transpilerFactory.name, () => {

  let injectorMock: sinon.SinonStubbedInstance<Injector<any>>;
  let childProcessTranspiler: sinon.SinonStubbedInstance<ChildProcessTranspiler>;

  beforeEach(() => {
    childProcessTranspiler = sinon.createStubInstance(ChildProcessTranspiler);
    injectorMock = factory.injector();
    injectorMock.injectClass.withArgs(ChildProcessTranspiler).returns(childProcessTranspiler);
  });

  function act(): Transpiler {
    return transpilerFactory(testInjector.options, injectorMock);
  }

  it('should construct the transpiler in a child process if a transpiler is configured', () => {
    testInjector.options.transpilers.push('fooTranspiler');

    const actual = act();
    expect(actual).eq(childProcessTranspiler);
  });

  it('should construct a pass through transpiler if no transpiler is configured', () => {
    const actual = act();
    const input = [new File('foo.js', 'bar')];
    expect(actual).not.eq(childProcessTranspiler);
    expect(actual.transpile(input)).eventually.eq(input);
  });

});
