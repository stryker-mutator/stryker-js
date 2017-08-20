import Transpiler from './Transpiler';
import { Config } from '../../config';

export default interface TranspilerOptions {
  /**
   * The stryker config
   */
  config: Config;
  /**
   * The transpiler next in line. 
   * Forward all calls to this. 
   * @link Transpiler
   */
  nextTranspiler: Transpiler;
  
  /**
   * Indicates whether or not the source maps need to be kept.
   * If false, the transpiler may optimize to not calculate source maps.
   */
  keepSourceMaps: boolean;
}