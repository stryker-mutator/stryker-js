import { expect } from 'chai';
import MyMath from './MyMath.js';

describe('MyMath with mutantActivation', () => {

  // Bad practice, but on purpose.
  const math = new MyMath();
  
  it('should give pi = 3.14', () => {
    expect(math.pi).eq(3.14);
  });

  it('should give 6.28 for pi + pi', () => {
    expect(math.add(math.pi, math.pi)).eq(6.28);
  });
});
