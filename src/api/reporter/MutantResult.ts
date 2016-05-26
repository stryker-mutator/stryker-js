import MutantStatus from './MutantStatus';
import {Location} from '../core';

interface MutantResult {
  sourceFilePath: string;
  mutatorName: string;
  status: MutantStatus;
  replacement: string;
  location: Location;
  specsRan: string[];
}

export default MutantResult;