import { expect } from 'chai';
import BabelParser from '../../../src/helpers/BabelParser';
import { testInjector } from '@stryker-mutator/test-helpers';

describe(BabelParser.name, () => {
  function createSut() {
    return testInjector.injector.injectClass(BabelParser);
  }

  describe('getNodes', () => {
    it('should get the correct amount of statements', () => {
      const sut = createSut();
      const ast = sut.parse('"use strict"; var a = 1 + 2;');
      const nodes = sut.getNodes(ast);
      expect(nodes.length).to.equal(9);
    });
  });

  describe('generateCode', () => {
    it('should work with "use strict"', () => {
      const sut = createSut();
      const ast = sut.parse('"use strict"; var a = 1 + 2;');

      const result = sut.generateCode(ast);

      expect(result).to.equal('"use strict";\n\nvar a = 1 + 2;');
    });

    it('should keep comments', () => {
      const sut = createSut();
      const ast = sut.parse('var a = 1 + 2 /* Comment */;');
      const result = sut.generateCode(ast.program.body[0]);
      expect(result).to.equal('var a = 1 + 2\n/* Comment */\n;');
    });
  });

  describe('parse', () => {
    it('should support scripts', () => {
      const sut = createSut();
      const ast = sut.parse("var fs = require('fs'); var a = 1 + 2;");

      expect(ast).exist;
    });

    it('should support modules', () => {
      const sut = createSut();
      const ast = sut.parse("import fs from 'fs'; var a = 1 + 2;");

      expect(ast).exist;
    });

    it('should allow to override plugins', () => {
      // Arrange
      testInjector.logger.isDebugEnabled.returns(true);
      testInjector.mutatorDescriptor.plugins = ['optionalChaining'];
      const sut = createSut();

      // Act
      const result = sut.parse('foo?.bar()');

      // Assert
      expect(sut.generateCode(result.program)).eq('foo?.bar();');
      expect(testInjector.logger.debug).calledWith('Using options {"plugins":["optionalChaining"],"sourceType":"unambiguous"}');
    });
  });
});
