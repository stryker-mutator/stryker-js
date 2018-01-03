import { TranspilerFactory } from 'stryker-api/transpile';
import BabelTranspiler from './BabelTranspiler';

TranspilerFactory.instance().register('babel', BabelTranspiler);
