import React from 'react';
import { render } from '@testing-library/react';
import ParentComponent from './ParentComponent';

describe('Parent Component', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<ParentComponent />);
    expect(asFragment()).toMatchSnapshot();
  });
});
