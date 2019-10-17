import { expect } from 'chai';
import BabelHelper from '../../../src/helpers/BabelHelper';

describe('BabelHelper', () => {
  describe('getNodes', () => {
    it('should get the correct amount of statements', () => {
      const ast = BabelHelper.parse('"use strict"; var a = 1 + 2;');

      const nodes = BabelHelper.getNodes(ast);

      expect(nodes.length).to.equal(9);
    });
  });

  describe('generateCode', () => {
    it('should work with "use strict"', () => {
      const ast = BabelHelper.parse('"use strict"; var a = 1 + 2;');

      const result = BabelHelper.generateCode(ast);

      expect(result).to.equal('"use strict";\n\nvar a = 1 + 2;');
    });

    it('should keep comments', () => {
      const ast = BabelHelper.parse('var a = 1 + 2 /* Comment */;');
      const result = BabelHelper.generateCode(ast.program.body[0]);
      expect(result).to.equal('var a = 1 + 2\n/* Comment */\n;');
    });
  });

  describe('parse', () => {
    it('should support scripts', () => {
      const ast = BabelHelper.parse("var fs = require('fs'); var a = 1 + 2;");

      expect(ast).exist;
    });

    it('should support modules', () => {
      const ast = BabelHelper.parse("import fs from 'fs'; var a = 1 + 2;");

      expect(ast).exist;
    });
  });
});
