import { TranspilerFactory } from 'stryker-api/transpile';
import { ConfigEditorFactory } from 'stryker-api/config';
import BabelTranspiler from './BabelTranspiler';
import BabelConfigEditor from './BabelConfigEditor';

TranspilerFactory.instance().register('babel', BabelTranspiler);
ConfigEditorFactory.instance().register('babel', BabelConfigEditor);
