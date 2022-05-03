import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../';

describe('Badge', () => {
  it('should render a span by default', () => {
    render(<Badge>Yo!</Badge>);
    
    expect(screen.getByText('Yo!').tagName).toBe('SPAN');
  });

  it('should render an anchor when when href is provided', () => {
    render(<Badge href="#">Yo!</Badge>);

    expect(screen.getByText('Yo!').tagName).toBe('A');
  });

  it('should render a custom tag when provided', () => {
    render(<Badge tag="main">Yo!</Badge>);

    expect(screen.getByText('Yo!').tagName).toBe('MAIN');
  });

  it('should render children', () => {
    render(<Badge>Yo!</Badge>);

    expect(screen.getByText('Yo!').innerHTML).toBe('Yo!');
  });

  it('should render badges with secondary color', () => {
    render(<Badge>Badge</Badge>);

    expect(screen.getByText('Badge').classList.contains('badge-secondary')).toBe(true);
  });

  it('should render Badges with other colors', () => {
    render(<Badge color="danger">Danger Badge</Badge>);

    expect(screen.getByText('Danger Badge').classList.contains('badge-danger')).toBe(true);
  });

  it('should render Badges as pills', () => {
    render(<Badge pill>Pill Badge</Badge>);

    expect(screen.getByText('Pill Badge').classList.contains('badge-pill')).toBe(true);
  });
});
