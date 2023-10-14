import { Ignorer } from '@stryker-mutator/api/ignore';
import { NodePath, types } from '@babel/core';
import { expect } from 'chai';

import { IgnorerBookkeeper } from '../../../src/transformers/ignorer-bookkeeper.js';
import { createIdentifierNodePath } from '../../helpers/factories.js';

describe(IgnorerBookkeeper.name, () => {
  let sut: IgnorerBookkeeper;
  let ignorers: Ignorer[];
  let path: NodePath<types.Identifier>;

  beforeEach(() => {
    ignorers = [];
    sut = new IgnorerBookkeeper(ignorers);
    path = createIdentifierNodePath('foo');
  });

  it('should not set the active ignore message when no ignorers are listed', () => {
    sut.enterNode(path);
    expect(sut.currentIgnoreMessage).undefined;
  });

  it('should set the active ignore message when the ignorer returns a message', () => {
    ignorers.push({
      shouldIgnore: () => 'ignore me',
    });
    sut.enterNode(path);
    expect(sut.currentIgnoreMessage).eq('ignore me');
  });

  it('should not set the active ignore message when the ignorer returns an empty message', () => {
    ignorers.push({
      shouldIgnore: () => '',
    });
    sut.enterNode(path);
    expect(sut.currentIgnoreMessage).undefined;
  });

  it('should not override an active ignore message', () => {
    // Arrange
    const barNode = createIdentifierNodePath('bar');
    ignorers.push({
      shouldIgnore: (n) => {
        if (n === path) {
          return 'ignore foo';
        }
        if (n === barNode) {
          return 'ignore bar';
        }
        return;
      },
    });

    // Act
    sut.enterNode(path);
    sut.enterNode(barNode);

    // Assert
    expect(sut.currentIgnoreMessage).eq('ignore foo');
  });

  it('should clear the active ignore message when the node is left', () => {
    // Arrange
    ignorers.push({
      shouldIgnore: () => 'ignore me',
    });

    // Act
    sut.enterNode(path);
    sut.leaveNode(path);

    // Assert
    expect(sut.currentIgnoreMessage).undefined;
  });

  it('should not clear the active ignore message when another node is left', () => {
    // Arrange
    const barNode = createIdentifierNodePath('bar');
    ignorers.push({
      shouldIgnore: () => 'ignore me',
    });

    // Act
    sut.enterNode(path);
    sut.leaveNode(barNode);

    // Assert
    expect(sut.currentIgnoreMessage).eq('ignore me');
  });
});
