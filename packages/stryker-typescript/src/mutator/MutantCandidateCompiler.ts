import MutantCandidate from './MutantCandidate';
import MutableLanguageServiceHost from './MutableLanguageServiceHost';
import * as ts from 'typescript';
import { InputFile } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import { getCompilerOptions, getProjectDirectory } from '../helpers/tsHelpers';
import { Logger, getLogger } from 'log4js';
import * as os from 'os';

export default class MutantCandidateCompiler {
  private languageService: ts.LanguageService;
  private host: MutableLanguageServiceHost;
  private log: Logger;
  private diagnosticsFormatter: ts.FormatDiagnosticsHost;

  constructor(inputFiles: InputFile[], config: Config) {
    this.log = getLogger(MutantCandidateCompiler.name);
    const projectDirectory = getProjectDirectory(config);
    this.host = new MutableLanguageServiceHost(getCompilerOptions(config), inputFiles.map(_ => _.path), projectDirectory);
    this.languageService = ts.createLanguageService(
      this.host,
      ts.createDocumentRegistry());
    this.diagnosticsFormatter = {
      getCurrentDirectory: () => projectDirectory,
      getCanonicalFileName: fileName => fileName,
      getNewLine: () => os.EOL
    };
  }

  validateMutant(mutantCandidate: MutantCandidate): boolean {
    this.host.mutate(mutantCandidate);
    const errors = this.languageService.getSemanticDiagnostics(mutantCandidate.sourceFile.fileName);
    const isValid = !errors.length;
    this.logErrors(errors, mutantCandidate);
    this.host.restore();
    return isValid;
  }

  private logErrors(errors: ts.Diagnostic[], mutantCandidate: MutantCandidate) {
    if (this.log.isTraceEnabled && errors.length) {
      this.log.trace(`Error replacing code ${mutantCandidate.originalText} -> ${mutantCandidate.replacementSourceCode} ${ts.formatDiagnostics(errors, this.diagnosticsFormatter)}`);
    }
  }
}