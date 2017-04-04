import { Factory } from '../../../core';
import { expect } from 'chai';

describe('Factory', () => {

  class TestFactory extends Factory<{ settings: string }, { someInstance: string }>  {
  }

  class TestItem {
    constructor(private s: { settings: string }) { }

    get someInstance() {
      return this.s.settings;
    }
  }

  describe('when creating a sub-class', () => {
    let sut = new TestFactory('test');

    it('should have empty known names', () => {
      expect(sut.knownNames()).to.be.empty;
    });

    it('should throw an error if it is requested to create a non-existing item', () => {
      expect(() => sut.create('not-exist', { settings: 'not exist' }))
        .to.throw(Error, 'Could not find a test with name not-exist, did you install it correctly (for example: npm install --save-dev stryker-not-exist)?');
    });

    describe('when registering a test class "some-item"', () => {
      beforeEach(() => {
        sut.register('some-item', TestItem);
      });

      it('should retrieve a new item when `create` is called with "some-item"', () => {
        expect(sut.create('some-item', { settings: 'some item' })).to.be.instanceof(TestItem);
      });

    });
  });
});