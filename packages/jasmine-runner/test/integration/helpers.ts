import { TestStatus, SuccessTestResult } from '@stryker-mutator/api/test-runner';

export const jasmineInitResultTestNames = Object.freeze([
  'Player should be able to play a Song',
  'Player when song has been paused should indicate that the song is currently paused',
  'Player when song has been paused should be possible to resume',
  'Player tells the current song if the user has made it a favorite',
  'Player #resume should throw an exception if song is already playing',
]);

export const jasmineInitSuccessResults: ReadonlyArray<Omit<SuccessTestResult, 'timeSpentMs'>> = Object.freeze([
  { id: 'spec0', name: jasmineInitResultTestNames[0], status: TestStatus.Success },
  { id: 'spec1', name: jasmineInitResultTestNames[1], status: TestStatus.Success },
  { id: 'spec2', name: jasmineInitResultTestNames[2], status: TestStatus.Success },
  { id: 'spec3', name: jasmineInitResultTestNames[3], status: TestStatus.Success },
  { id: 'spec4', name: jasmineInitResultTestNames[4], status: TestStatus.Success },
]);
