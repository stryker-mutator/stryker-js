import { expect } from 'chai';

import { parseArguments } from '../../src/tap-helper.js';

describe('tap-helper', () => {
  describe(parseArguments.name, () => {
    it('should add the hook file and test file to the arguments', () => {
      const result = parseArguments(['custom-arg'], 'hook.js', 'test.js');

      // Assert
      expect(result).to.eql(['-r', 'hook.js', 'custom-arg', 'test.js']);
    });

    it('should replace {{hookFile}} and {{testFile}} in the arguments', () => {
      const result = parseArguments(['--file={{hookFile}}', '--test={{testFile}}'], 'hook.js', 'test.js');

      // Assert
      expect(result).deep.eql(['--file=hook.js', '--test=test.js']);
    });
  });
});
