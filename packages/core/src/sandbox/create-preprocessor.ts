import { tokens, Injector, commonTokens, PluginContext } from '@stryker-mutator/api/plugin';

import { TSConfigPreprocessor } from './ts-config-preprocessor';
import { FileHeaderPreprocessor } from './file-header-preprocessor';
import { FilePreprocessor } from './file-preprocessor';
import { MultiPreprocessor } from './multi-preprocessor';
import { StripCommentsPreprocessor } from './strip-comments-preprocessor';

createPreprocessor.inject = tokens(commonTokens.injector);
export function createPreprocessor(injector: Injector<PluginContext>): FilePreprocessor {
  return new MultiPreprocessor([
    injector.injectClass(StripCommentsPreprocessor),
    injector.injectClass(TSConfigPreprocessor),
    injector.injectClass(FileHeaderPreprocessor),
  ]);
}
