import path = require('path');

import sinon = require('sinon');
import { expect } from 'chai';

import { requireResolve } from '../../src';

const resolveTestResource: typeof path.resolve = path.resolve.bind(path, __dirname, '..', '..', 'testResources', 'require-resolve');

describe(requireResolve.name, () => {
  it('should be able to require from parent', () => {
    const bar = requireResolve('bar', resolveTestResource());
    expect(bar).eq('bar from parent');
  });

  it('should be able to require from child', () => {
    const bar = requireResolve('bar', resolveTestResource('foo'));
    expect(bar).eq('bar from foo');
  });

  it('should be able to require from current working directory', () => {
    sinon.stub(process, 'cwd').returns(resolveTestResource('baz'));
    const bar = requireResolve('bar');
    expect(bar).eq('bar from baz');
  });
});
