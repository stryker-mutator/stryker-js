import MutantStatus from './MutantStatus';
import {Location, Range} from '../../core';

interface MutantResult {
  sourceFilePath: string;
  mutatorName: string;
  status: MutantStatus;
  replacement: string;
  originalLines: string;
  mutatedLines: string;
  testsRan: string[];
  location: Location;
  range: Range;
}

export default MutantResult;