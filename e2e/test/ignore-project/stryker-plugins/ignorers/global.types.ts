import type babel from '@babel/core';
declare module '@stryker-mutator/api/ignorer' {
  interface NodePath extends babel.NodePath {}
}
