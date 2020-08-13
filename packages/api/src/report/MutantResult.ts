import { Location, Range } from '../../core';

import { MutantStatus } from './MutantStatus';

export interface MutantResult {
  id: string;
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
