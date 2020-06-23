import { Injector, tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Instrumenter, InstrumentResult } from '@stryker-mutator/instrumenter';
import { File } from '@stryker-mutator/api/core';

import { MainContext, coreTokens } from '../di';
import InputFileCollection from '../input/InputFileCollection';
import { Sandbox } from '../sandbox/sandbox';
import { LoggingClientContext } from '../logging';

import { DryRunContext } from './3-DryRunExecutor';

export interface MutantInstrumenterContext extends MainContext {
  [coreTokens.inputFiles]: InputFileCollection;
  [coreTokens.loggingContext]: LoggingClientContext;
}

export class MutantInstrumenterExecutor {
  public static readonly inject = tokens(commonTokens.injector, coreTokens.inputFiles);
  constructor(private readonly injector: Injector<MutantInstrumenterContext>, private readonly inputFiles: InputFileCollection) {}

  public async execute(): Promise<Injector<DryRunContext>> {
    const instrumenter = this.injector.injectClass(Instrumenter);
    const instrumentResult = await instrumenter.instrument(this.inputFiles.filesToMutate);
    const files = this.replaceWith(instrumentResult);
    const sandbox = await this.injector.provideValue(coreTokens.files, files).injectFunction(Sandbox.create);

    return this.injector.provideValue(coreTokens.mutants, instrumentResult.mutants).provideValue(coreTokens.sandbox, sandbox);
  }

  private replaceWith(instrumentResult: InstrumentResult): File[] {
    return this.inputFiles.files.map((inputFile) => {
      const instrumentedFile = instrumentResult.files.find((instrumentedFile) => instrumentedFile.name === inputFile.name);
      if (instrumentedFile) {
        return instrumentedFile;
      } else {
        return inputFile;
      }
    });
  }
}
