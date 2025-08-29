import { render, screen } from '@testing-library/react';
import { Product } from './Product';
import { Discount } from './Discount';
import { expect } from 'chai';

vi.mock('./Discount', () => ({ Discount: vi.fn() }));

afterEach(() => vi.resetAllMocks());

describe('Product', () => {
  it('should render the discount', () => {
    render(<Product name="Product" price={100} discount={10} />);
    const name = screen.getByText('Product');
    const price = screen.getByText('100');

    expect(name).toBeInTheDocument();
    expect(price).toBeInTheDocument();
    expect(Discount).toHaveBeenCalledWith({ discount: 10 }, undefined);
  });
  it("doesn't render the discount when 0", () => {
    render(<Product name="Product" price={100} discount={0} />);
    const name = screen.getByText('Product');
    const price = screen.getByText('100');

    expect(name).toBeInTheDocument();
    expect(price).toBeInTheDocument();
    expect(Discount).not.toHaveBeenCalled();
  });
});
