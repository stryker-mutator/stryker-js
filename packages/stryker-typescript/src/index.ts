import { ConfigEditorFactory } from 'stryker-api/config';
import TypescriptConfigEditor from './TypescriptConfigEditor';

ConfigEditorFactory.instance().register('typescript', TypescriptConfigEditor);