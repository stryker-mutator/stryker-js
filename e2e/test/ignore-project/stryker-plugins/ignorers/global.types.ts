import type babel from '@babel/core';

declare module '@stryker-mutator/api/ignore' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface NodePath extends babel.NodePath {}
}
