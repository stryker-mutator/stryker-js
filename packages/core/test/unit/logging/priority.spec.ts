import { expect } from 'chai';
import { minPriority } from '../../../src/logging/priority.js';
import { LogLevel } from '@stryker-mutator/api/core';

describe('Logging priority', () => {
  describe(minPriority.name, () => {
    it('should return the minimum priority', () => {
      expect(minPriority(LogLevel.Trace, LogLevel.Debug)).eq('trace');
      expect(minPriority(LogLevel.Debug, LogLevel.Trace)).eq('trace');
      expect(minPriority(LogLevel.Trace, LogLevel.Trace)).eq('trace');
      expect(minPriority(LogLevel.Error, LogLevel.Fatal)).eq('error');
      expect(minPriority(LogLevel.Fatal, LogLevel.Error)).eq('error');
      expect(minPriority(LogLevel.Error, LogLevel.Error)).eq('error');
    });
  });
});
