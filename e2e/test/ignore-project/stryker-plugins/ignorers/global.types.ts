/// <reference types="@stryker-mutator/api/ignore" />
import type babel from '@babel/core';

declare module '@stryker-mutator/api/ignore' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface NodePath extends babel.NodePath {
    // Make "NodePath" extend the babe.NodePath interface
  }
}
