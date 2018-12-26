import { Location, Range } from '../../core';
import MutantStatus from './MutantStatus';

interface MutantResult {
  id: string;
  location: Location;
  mutatedLines: string;
  mutatorName: string;
  originalLines: string;
  range: Range;
  replacement: string;
  sourceFilePath: string;
  status: MutantStatus;
  testsRan: string[];
}

export default MutantResult;
