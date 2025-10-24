/// <reference types="@vitest/browser/matchers" />
import { vi, describe, afterEach, it, expect } from 'vitest';
import { render } from 'vitest-browser-react';
import { Product } from './Product';
import { Discount } from './Discount';

vi.mock('./Discount', () => ({ Discount: vi.fn() }));
afterEach(() => vi.resetAllMocks());

describe('Product', () => {
  it('should render the discount', async () => {
    const screen = render(<Product name="Product" price={100} discount={10} />);
    const name = screen.getByText('Product');
    const price = screen.getByText('100');

    await expect.element(name).toBeInTheDocument();
    await expect.element(price).toBeInTheDocument();
    expect(Discount).toHaveBeenCalledWith({ discount: 10 }, undefined);
  });
  it("doesn't render the discount when 0", async () => {
    const screen = render(<Product name="Product" price={100} discount={0} />);
    const name = screen.getByText('Product');
    const price = screen.getByText('100');

    await expect.element(name).toBeInTheDocument();
    await expect.element(price).toBeInTheDocument();
    expect(Discount).not.toHaveBeenCalled();
  });
});
