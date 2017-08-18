import { ConfigEditorFactory } from 'stryker-api/config';
import { MutantGeneratorFactory } from 'stryker-api/mutant';
import TypescriptConfigEditor from './TypescriptConfigEditor';
import TypescriptMutantGenerator from './TypescriptMutantGenerator';

ConfigEditorFactory.instance().register('typescript', TypescriptConfigEditor);
MutantGeneratorFactory.instance().register('typescript', TypescriptMutantGenerator);