import Range from './Range';
import Location from './Location';

interface Mutant {
  id: number;
  mutatorName: string;
  fileName: string;
  range: Range;
  location: Location;
  replacement: string;
}

export default Mutant;
