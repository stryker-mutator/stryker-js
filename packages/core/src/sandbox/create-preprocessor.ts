import { tokens, Injector, commonTokens, PluginContext } from '@stryker-mutator/api/plugin';

import { disableTypeChecks } from '@stryker-mutator/instrumenter';

import { coreTokens } from '../di';

import { TSConfigPreprocessor } from './ts-config-preprocessor';
import { FilePreprocessor } from './file-preprocessor';
import { MultiPreprocessor } from './multi-preprocessor';
import { DisableTypeChecksPreprocessor } from './disable-type-checks-preprocessor';

createPreprocessor.inject = tokens(commonTokens.injector);
export function createPreprocessor(injector: Injector<PluginContext>): FilePreprocessor {
  return new MultiPreprocessor([
    injector.provideValue(coreTokens.disableTypeChecksHelper, disableTypeChecks).injectClass(DisableTypeChecksPreprocessor),
    injector.injectClass(TSConfigPreprocessor),
  ]);
}
