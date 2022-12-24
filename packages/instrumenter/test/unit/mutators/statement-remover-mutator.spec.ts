import { expect } from 'chai';

import { statementRemoverMutator as sut } from '../../../src/mutators/statement-remover-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

const code = `import { Hero } from './hero';

export const HEROES: Hero[] = [
  { id: 12, name: 'Dr. Nice' },
];
`;

describe(sut.name, () => {
  it('should have name "StatementRemover"', () => {
    expect(sut.name).eq('StatementRemover');
  });

  describe('statements', () => {
    it('should delete each statements', () => {
      expectJSMutation(sut, 'const a = 3; const b = 2; ', '; const b = 2; ', 'const a = 3; ; ');
    });
    it('should do something with export const', () => {
      expectJSMutation(sut, code);
    });
    it('should not delete block statements', () => {
      expectJSMutation(sut, 'const a = 3; { const b = 2; } ', '; { const b = 2; } ', 'const a = 3; { ; } ');
    });
    it('should not delete import statements', () => {
      expectJSMutation(sut, "import { Hero } from './hero';");
    });
    it('should not delete export statements', () => {
      expectJSMutation(sut, "export const HEROES: Hero[] = [ { id: 12, name: 'Dr. Nice' }, ];");
    });
    it('should not remove class declaration()', () => {
      expectJSMutation(sut, 'class Foo { constructor() {} }');
    });
    it('should not remove function declaration()', () => {
      expectJSMutation(sut, 'function foo() { }');
    });
    it('should not remove super()', () => {
      expectJSMutation(sut, 'class Foo extends Bar { constructor(private baz: string) { super(); } }');
    });
  });
});
