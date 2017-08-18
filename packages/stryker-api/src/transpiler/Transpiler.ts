import TranspileFile from './TranspileFile';
import { Location } from '../../core';

export default interface Transpiler {
  
  transpileAll(files: TranspileFile[]): Promise<void>;

  transpileFile(file: TranspileFile): Promise<void>;

  getMappedLocation(fileName: string, location: Location): Location;
}