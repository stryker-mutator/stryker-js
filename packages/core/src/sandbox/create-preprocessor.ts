import { commonTokens, Injector, PluginContext, tokens } from '@stryker-mutator/api/plugin';

import { disableTypeChecks } from '@stryker-mutator/instrumenter';

import { coreTokens } from '../di';

import { DisableTypeChecksPreprocessor } from './disable-type-checks-preprocessor';
import { FilePreprocessor } from './file-preprocessor';
import { MultiPreprocessor } from './multi-preprocessor';
import { TSConfigPreprocessor } from './ts-config-preprocessor';

createPreprocessor.inject = tokens(commonTokens.injector);
export function createPreprocessor(injector: Injector<PluginContext>): FilePreprocessor {
  return new MultiPreprocessor([
    injector.provideValue(coreTokens.disableTypeChecksHelper, disableTypeChecks).injectClass(DisableTypeChecksPreprocessor),
    injector.injectClass(TSConfigPreprocessor),
  ]);
}
