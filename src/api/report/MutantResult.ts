import MutantStatus from './MutantStatus';
import {Location} from '../core';

interface MutantResult {
  sourceFilePath: string;
  mutatorName: string;
  status: MutantStatus;
  replacement: string;
  location: Location;
  originalLines: string;
  mutatedLines: string;
  specsRan: string[];
}

export default MutantResult;