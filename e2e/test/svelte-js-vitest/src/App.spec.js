import { describe, it, expect } from 'vitest';
import App from './App.svelte';
import { sum, isOldEnough, loop} from './App.svelte';
import { render, screen } from '@testing-library/svelte'

describe("basic test", () => {
  it("says 'hello world!'", () => {
    render(App);
    const node = screen.queryByText("Hello world!");
    expect(node).not.toBeNull();
  })

  it('adds 1 + 2 to equal 3', () => {
      expect(sum(1, 2)).toBe(3);
  });

  it('check if age goes over ', () => {
    expect(isOldEnough(18)).toBe(true);
  });

  it('should result in 15 for n=5 and a sum function', () => {
    let result = 0;
    loop(5, (n) => (result += n));
    expect(result).toEqual(15);
  });
})




