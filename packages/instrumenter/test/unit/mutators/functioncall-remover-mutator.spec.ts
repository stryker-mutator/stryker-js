import { expect } from 'chai';

import { functioncallRemoverMutator as sut } from '../../../src/mutators/functioncall-remover-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
  it('should have name "FunctionCallRemover"', () => {
    expect(sut.name).eq('FunctionCallRemover');
  });

  describe('statements', () => {
    it('should substitue each functioncall with an unknown', () => {
      expectJSMutation(sut, 'const foo = call(call1());', 'const foo = call(unknown);', 'const foo = unknown;');
    });
  });
});
