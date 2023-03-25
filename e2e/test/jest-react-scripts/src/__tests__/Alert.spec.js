import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Alert } from '../';

describe('Alert', () => {
  it('should set some test var (https://github.com/stryker-mutator/stryker-js/issues/3022)', () => {
    expect(process.env.SOME_TEST_VAR).toEqual('true');
  });

  it('should render children', () => {
    render(<Alert>Yo!</Alert>);
    expect(screen.getByText('Yo!').innerHTML).toBe('Yo!');
  });

  it('should pass className down', () => {
    render(<Alert className="test-class-name">Yo!</Alert>);
    expect(screen.getByText('Yo!').classList.contains('test-class-name')).toBe(true);
  });

  it('should pass close className down', () => {
    function noop() {}
    render(
      <Alert toggle={noop} closeClassName="test-class-name">
        Yo!
      </Alert>
    );
    expect(screen.getByText('Yo!').querySelector('.close').classList.contains('test-class-name')).toBe(true);
  });

  it('should pass other props down', () => {
    render(<Alert data-testprop="testvalue">Yo!</Alert>);
    expect(screen.getByText('Yo!').getAttribute('data-testprop')).toContain('testvalue');
  });

  // it('should have default transitionTimeouts', () => {
  //   render(<Alert>Yo!</Alert>);

  //   const transition = screen.getByText('Yo!').querySelector('Transition');
  //   expect(transition.getAttribute('timeout')).toEqual(150);
  //   expect(transition.getAttribute('appear')).toBe(true);
  //   expect(transition.getAttribute('enter')).toBe(true);
  //   expect(transition.getAttribute('exit')).toBe(true);
  // });

  // it('should have support configurable transitionTimeouts', () => {
  //   render(
  //     <Alert transition={{ timeout: 0, appear: false, enter: false, exit: false }}>
  //       Yo!
  //     </Alert>
  //   );

  //   const transition = alert.find('Transition');
  //   expect(transition.prop('timeout')).toEqual(0);
  //   expect(transition.prop('appear')).toBe(false);
  //   expect(transition.prop('enter')).toBe(false);
  //   expect(transition.prop('exit')).toBe(false);
  // });

  it('should have "success" as default color', () => {
    const { container: alert } = render(<Alert>Yo!</Alert>);
    expect(alert.querySelector('div').classList.contains('alert-success')).toBe(true);
  });

  it('should accept color prop', () => {
    const { container: alert } = render(<Alert color="warning">Yo!</Alert>);
    expect(alert.querySelector('div').classList.contains('alert-warning')).toBe(true);
  });

  it('should use a div tag by default', () => {
    const { container: alert } = render(<Alert>Yo!</Alert>);
    expect(alert.querySelector('div')).not.toBe(null);
  });

  it('should be non dismissible by default', () => {
    const { container: alert } = render(<Alert>Yo!</Alert>);
    expect(alert.querySelector('button')).toBe(null);
    expect(alert.classList.contains('alert-dismissible')).toBe(false);
  });

  it('should show dismiss button if passed toggle', () => {
    const { container: alert } = render(
      <Alert color="danger" toggle={() => {}}>
        Yo!
      </Alert>
    );
    expect(alert.querySelector('button')).toBeTruthy();
    expect(alert.querySelector('div').classList.contains('alert-dismissible')).toBe(true);
  });

  it('should support custom tag', () => {
    const { container: alert } = render(<Alert tag="p">Yo!</Alert>);
    expect(alert.querySelector('p')).toBeTruthy();
  });

  it('should be empty if not isOpen', () => {
    const { container: alert } = render(<Alert isOpen={false}>Yo!</Alert>);
    expect(alert.innerHTML).toBe('');
  });

  it('should be dismissible', () => {
    const onClick = jest.fn();
    const { container: alert } = render(
      <Alert color="danger" toggle={onClick}>
        Yo!
      </Alert>
    );
    fireEvent.click(alert.querySelector('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should render close button with custom aria-label', () => {
    const { container: alert } = render(
      <Alert toggle={() => {}} closeAriaLabel="oseclay">
        Yo!
      </Alert>
    );
    const closeButton = alert.querySelector('button');
    expect(closeButton.getAttribute('aria-label')).toBe('oseclay');
  });
});
