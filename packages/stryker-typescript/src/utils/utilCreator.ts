import { Location, Position, Range } from 'stryker-api/core';
import * as ts from 'typescript';
import clone = require('lodash.clone');
import cloneDeep = require('lodash.clonedeep');

export function createLocation(node: ts.Node, sourceFile: ts.SourceFile): Location {
  // create 2 positions , start and end. both take line number and column.
  let lineCharStart: ts.LineAndCharacter = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart(sourceFile));
  let lineCharEnd: ts.LineAndCharacter = ts.getLineAndCharacterOfPosition(sourceFile, node.getEnd());
  let start: Position = { line: lineCharStart.line, column: lineCharStart.character };
  let end: Position = { line: lineCharEnd.line, column: lineCharEnd.character };

  return { start: start, end: end }; // matches Shape of Location interface
}

export function createRange(node: ts.Node, sourceFile: ts.SourceFile): Range {
  let start: number = node.getStart(sourceFile);
  let end: number = node.getEnd();
  return [start, end]; // matches shape of Range
}

export function copyNode<T extends ts.Node>(node: T, deep = true) {
  if (deep) {
    return cloneDeep(node);
  } else {
    return clone(node);
  }
}