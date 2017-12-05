import { TranspilerFactory } from 'stryker-api/transpile';
import WebpackTranspiler from "./WebpackTranspiler";

TranspilerFactory.instance().register('webpack', WebpackTranspiler);