import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '../';

describe('Breadcrumb', () => {
  it('should render children', () => {
    const { container } = render(<Breadcrumb>Yo!</Breadcrumb>);

    expect(container.querySelector('ol').innerHTML).toBe('Yo!');
  });

  it('should render "nav" by default', () => {
    render(<Breadcrumb>Yo!</Breadcrumb>);
    expect(screen.getByTestId('breadcrumb').nodeName).toBe('NAV');
  });

  it('should render "ol" by default', () => {
    render(<Breadcrumb>Yo!</Breadcrumb>);
    expect(screen.getByTestId('breadcrumb').firstChild.nodeName).toBe('OL');
  });

  it('should render with the "breadcrumb" class', () => {
    render(<Breadcrumb>Default Breadcrumb</Breadcrumb>);
    const sut = screen.getByTestId('breadcrumb');
    expect(sut.firstChild.classList.contains('breadcrumb')).toBe(true);
  });

  it('should render custom tag', () => {
    render(<Breadcrumb tag="main">Yo!</Breadcrumb>);
    const sut = screen.getByTestId('breadcrumb');
    expect(sut.nodeName).toBe('MAIN');
  });
});
