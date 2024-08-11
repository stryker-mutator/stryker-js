import React from 'react';
import { render, screen } from '@testing-library/react';
import ChildComponent from './ChildComponent';

describe('Child Component', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<ChildComponent text="hello" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
