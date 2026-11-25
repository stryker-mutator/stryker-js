import {
  tokens,
  Injector,
  commonTokens,
  PluginContext,
} from '@stryker-mutator/api/plugin';

import { disableTypeChecks } from '@stryker-mutator/instrumenter';

import { coreTokens } from '../di/index.js';
import type { TemporaryDirectory } from '../utils/temporary-directory.js';

import { TSConfigPreprocessor } from './ts-config-preprocessor.js';
import { FilePreprocessor } from './file-preprocessor.js';
import { MultiPreprocessor } from './multi-preprocessor.js';
import { DisableTypeChecksPreprocessor } from './disable-type-checks-preprocessor.js';

createPreprocessor.inject = tokens(commonTokens.injector);
export function createPreprocessor(
  injector: Injector<
    PluginContext & {
      [coreTokens.temporaryDirectory]: Pick<TemporaryDirectory, 'path'>;
    }
  >,
): FilePreprocessor {
  return new MultiPreprocessor([
    injector
      .provideValue(coreTokens.disableTypeChecksHelper, disableTypeChecks)
      .injectClass(DisableTypeChecksPreprocessor),
    injector.injectClass(TSConfigPreprocessor),
  ]);
}
