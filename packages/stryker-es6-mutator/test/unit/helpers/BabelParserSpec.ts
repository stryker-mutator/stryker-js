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

    it('should identify the nodes', () => {
      const ast = BabelParser.getAst('"use strict"; var a = 1 + 2;');

      const nodes = BabelParser.getNodes(ast);

      expect(nodes[0].nodeID).to.equal(0);
      expect(nodes[1].nodeID).to.equal(1);
    });
  });

  describe('generateCode', () => {
    it('should work with "use strict"', () => {
      const ast = BabelParser.getAst('"use strict"; var a = 1 + 2;');

      const result = BabelParser.generateCode(ast, ast.program.body[0]);

      expect(result).to.equal('"use strict";\nvar a = 1 + 2;');
    });

    it('should work without "use strict"', () => {
      const ast = BabelParser.getAst('"use strict"; var a = 1 + 2;');
      BabelParser.removeUseStrict(ast);

      const result = BabelParser.generateCode(ast, ast.program.body[0]);
      
      expect(result).to.equal('var a = 1 + 2;');
    });
  });
});