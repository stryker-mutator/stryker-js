import { Range } from './Range';
import { Location } from './Location';

export interface Mutant {
  id: number;
  mutatorName: string;
  fileName: string;
  range: Range;
  location: Location;
  replacement: string;
}
