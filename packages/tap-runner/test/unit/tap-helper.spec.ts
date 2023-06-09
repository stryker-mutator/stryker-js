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
      expect(result).deep.eq(['--file=hook.js', '--test=test.js']);
    });

    it('should be able to replace multiple occurrences of template variables', () => {
      const result = parseArguments(['{{hookFile}}', '--{{hookFile}}={{hookFile}}', '--{{testFile}}={{testFile}}'], 'hook.js', 'test.js');

      // Assert
      expect(result).deep.eq(['hook.js', '--hook.js=hook.js', '--test.js=test.js']);
    });
  });
});
