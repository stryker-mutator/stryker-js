import Transpiler from './Transpiler';
import { Config } from '../../config';

export default interface TranspilerOptions {
  config: Config;
  nextTranspiler: Transpiler;
}