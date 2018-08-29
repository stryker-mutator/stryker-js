import { expect } from 'chai';
import BabelParser from '../../../src/helpers/BabelParser';

describe('BabelParser', () => {
  describe('removeUseStrict', () => {
    it('should be able to remove "use strict"', () => {
      const ast = BabelParser.getAst('"use strict"; var a = 1 + 2;');

      BabelParser.removeUseStrict(ast);

      expect(ast.program.directives).to.deep.equal([]);
    });

    it('should do nothing if there is no "use strict"', () => {
      const ast = BabelParser.getAst('var a = 1 + 2;');

      BabelParser.removeUseStrict(ast);

      expect(ast.program.directives).to.deep.equal([]);
    });
  });

  describe('getNodes', () => {
    it('should get the correct amount of statements', () => {
      const ast = BabelParser.getAst('"use strict"; var a = 1 + 2;');

      const nodes = BabelParser.getNodes(ast);

      expect(nodes.length).to.equal(9);
    });
  });

  describe('generateCode', () => {
    it('should work with "use strict"', () => {
      const ast = BabelParser.getAst('"use strict"; var a = 1 + 2;');

      const result = BabelParser.generateCode(ast, ast.program.body[0]);

      expect(result).to.equal('"use strict";\n\nvar a = 1 + 2;');
    });

    it('should work without "use strict"', () => {
      const ast = BabelParser.getAst('"use strict"; var a = 1 + 2;');
      BabelParser.removeUseStrict(ast);

      const result = BabelParser.generateCode(ast, ast.program.body[0]);
      
      expect(result).to.equal('var a = 1 + 2;');
    });

    it('should keep comments', () => {
      const ast = BabelParser.getAst('"use strict"; var a = 1 + 2 /* Comment */;');
      BabelParser.removeUseStrict(ast);

      const result = BabelParser.generateCode(ast, ast.program.body[0]);
      
      expect(result).to.equal('var a = 1 + 2\n/* Comment */\n;');
    });
  });

  describe('getAst', () => {
    it('should support scripts', () => {
      const ast = BabelParser.getAst(`var fs = require('fs'); var a = 1 + 2;`);

      expect(ast).exist;
    });

    it('should support modules', () => {
      const ast = BabelParser.getAst(`import fs from 'fs'; var a = 1 + 2;`);

      expect(ast).exist;
    });
  });
});