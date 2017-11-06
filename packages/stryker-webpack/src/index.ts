import { TranspilerFactory } from 'stryker-api/transpile';
import { ConfigEditorFactory } from 'stryker-api/config';
import WebpackTranspiler from "./WebpackTranspiler";
import WebpackConfigEditor from "./WebpackConfigEditor";

TranspilerFactory.instance().register('webpack', WebpackTranspiler);
ConfigEditorFactory.instance().register('webpack', WebpackConfigEditor);