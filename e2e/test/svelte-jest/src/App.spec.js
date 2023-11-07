import App, { sum, isOldEnough } from './App.svelte';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';

describe('App.svelte', () => {
  afterEach(() => {
    cleanup();
  });

  it("says 'hello world!'", () => {
    render(App);
    const node = screen.queryByText('Hello world!');
    expect(node).not.toBeNull();
  });

  it('add one when hitting the button', async () => {
    render(App);
    const button = screen.getByText('Hits 0');
    await fireEvent.click(button);
    expect(button.textContent).toEqual('Hits 1');
  });

  it('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  it('check if age goes over ', () => {
    expect(isOldEnough(18)).toBe(true);
  });
});
