import { ConfigEditorFactory } from 'stryker-api/config';
import { MutatorFactory } from 'stryker-api/mutant';
import { TranspilerFactory } from 'stryker-api/transpile';
import TypescriptConfigEditor from './TypescriptConfigEditor';
import TypescriptMutator from './TypescriptMutator';
import TypescriptTranspiler from './TypescriptTranspiler';

ConfigEditorFactory.instance().register('typescript', TypescriptConfigEditor);
MutatorFactory.instance().register('typescript', TypescriptMutator);
TranspilerFactory.instance().register('typescript', TypescriptTranspiler);
