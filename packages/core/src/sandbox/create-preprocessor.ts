import { tokens, Injector, commonTokens, OptionsContext } from '@stryker-mutator/api/plugin';

import { SandboxTSConfigPreprocessor } from './sandbox-tsconfig-preprocessor';
import { SandboxFileHeaderPreprocessor } from './sandbox-file-header-preprocessor';
import { FilePreprocessor } from './file-preprocessor';
import { MultiPreprocessor } from './multi-preprocessor';

createPreprocessor.inject = tokens(commonTokens.injector);
export function createPreprocessor(injector: Injector<OptionsContext>): FilePreprocessor {
  return new MultiPreprocessor([injector.injectClass(SandboxTSConfigPreprocessor), injector.injectClass(SandboxFileHeaderPreprocessor)]);
}
