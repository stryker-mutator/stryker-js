import { expect } from 'chai';
import { Config } from '../../../config';
import { MutatorFactory } from '../../../mutant';

describe('MutantFactory', () => {

  describe('when correct mutator is not installed', () => {

    const sut = MutatorFactory.instance();

    it('should throw an error with package name "stryker-javascript-mutator" when using the "javascript" mutator', () => {
      expect(() => sut.create('javascript', new Config()))
        .to.throw(Error, 'Could not find a mutant-generator with name javascript, did you install it correctly (for example: npm install --save-dev stryker-javascript-mutator)?');
    });

    it('should throw an error with package name "stryker-vue-mutator" when using the "vue" mutator', () => {
      expect(() => sut.create('vue', new Config()))
        .to.throw(Error, 'Could not find a mutant-generator with name vue, did you install it correctly (for example: npm install --save-dev stryker-vue-mutator)?');
    });

    it('should throw an error with package name "stryker-typescript" when using the "typescript" mutator', () => {
      expect(() => sut.create('typescript', new Config()))
        .to.throw(Error, 'Could not find a mutant-generator with name typescript, did you install it correctly (for example: npm install --save-dev stryker-typescript)?');
    });
  });
});
