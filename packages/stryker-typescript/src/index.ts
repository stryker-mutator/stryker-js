import { ConfigEditorFactory } from 'stryker-api/config';
import { MutantGeneratorFactory } from 'stryker-api/mutant';
import { TranspilerFactory } from 'stryker-api/transpile';
import TypescriptConfigEditor from './TypescriptConfigEditor';
import TypescriptMutantGenerator from './TypescriptMutantGenerator';
import TypescriptTranspiler from './TypescriptTranspiler';

ConfigEditorFactory.instance().register('typescript', TypescriptConfigEditor);
MutantGeneratorFactory.instance().register('typescript', TypescriptMutantGenerator);
TranspilerFactory.instance().register('typescript', TypescriptTranspiler);