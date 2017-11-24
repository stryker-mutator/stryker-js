// import { TranspilerFactory } from 'stryker-api/transpile';
import { ConfigEditorFactory } from 'stryker-api/config';
import BabelConfigEditor from './BabelConfigEditor';

ConfigEditorFactory.instance().register('babel', BabelConfigEditor);