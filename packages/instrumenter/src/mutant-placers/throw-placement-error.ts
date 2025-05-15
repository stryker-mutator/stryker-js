import path from 'path';

import { NodePath } from '@babel/core';
import { propertyPath } from '@stryker-mutator/util';
import { StrykerOptions } from '@stryker-mutator/api/core';

import { Mutant } from '../mutant.js';

import { MutantPlacer } from './mutant-placer.js';

export function throwPlacementError(
  error: Error,
  nodePath: NodePath,
  placer: MutantPlacer,
  mutants: Mutant[],
  fileName: string,
): never {
  const location = `${path.relative(process.cwd(), fileName)}:${nodePath.node.loc?.start.line}:${nodePath.node.loc?.start.column}`;
  const message = `${placer.name} could not place mutants with type(s): "${mutants.map((mutant) => mutant.mutatorName).join(', ')}"`;
  const errorMessage = `${location} ${message}. Either remove this file from the list of files to be mutated, or exclude the mutator (using ${propertyPath<StrykerOptions>()(
    'mutator',
    'excludedMutations',
  )}). Please report this issue at https://github.com/stryker-mutator/stryker-js/issues/new?assignees=&labels=%F0%9F%90%9B+Bug&template=bug_report.md&title=${encodeURIComponent(
    message,
  )}. Original error: ${error.stack}`;
  let builtError = new Error(errorMessage);
  try {
    // `buildCodeFrameError` is kind of flaky, see https://github.com/stryker-mutator/stryker-js/issues/2695
    builtError = nodePath.buildCodeFrameError(errorMessage);
  } catch {
    // Idle, regular error will have to suffice
  }
  throw builtError;
}
