/**
 * @jest-environment @stryker-mutator/jest-runner/jest-env/jsdom
 */
import { titleSum } from './title-sum';

describe('title-sum', () => {

  it('should add a h1', () => { 
    titleSum(3, 0);
    const h1 = document.querySelector ('h1');
    expect(h1.textContent).toBe('3 + 0 = 3');
  });

});
