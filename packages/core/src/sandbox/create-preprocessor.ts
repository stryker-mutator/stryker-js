import { tokens, Injector, commonTokens, PluginContext } from '@stryker-mutator/api/plugin';

import { disableTypeChecking } from '@stryker-mutator/instrumenter';

import { coreTokens } from '../di';

import { TSConfigPreprocessor } from './ts-config-preprocessor';
import { FilePreprocessor } from './file-preprocessor';
import { MultiPreprocessor } from './multi-preprocessor';
import { DisableTypeCheckingPreprocessor } from './disable-type-checking-preprocessor';

createPreprocessor.inject = tokens(commonTokens.injector);
export function createPreprocessor(injector: Injector<PluginContext>): FilePreprocessor {
  return new MultiPreprocessor([
    injector.provideValue(coreTokens.disableTypeCheckingHelper, disableTypeChecking).injectClass(DisableTypeCheckingPreprocessor),
    injector.injectClass(TSConfigPreprocessor),
  ]);
}
