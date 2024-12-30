import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';

describe('Counter', () => {
  it('increments', () => {
    render(<Counter  />);
    const incrementButton = screen.getByText('Increment');
    const counter = screen.getByTestId('counter');

    fireEvent.click(incrementButton);
    expect(counter).toHaveTextContent('1');
  });
});
