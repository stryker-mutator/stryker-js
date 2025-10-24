/// <reference types="@vitest/browser/matchers" />
import { expect, describe, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { Counter } from './Counter';

describe('Counter', () => {
  it('increments', async () => {
    const screen = render(<Counter />);
    const incrementButton = screen.getByText('Increment');
    const counter = screen.getByTestId('counter');

    await incrementButton.click();
    await expect.element(counter).toHaveTextContent('1');
  });
});
