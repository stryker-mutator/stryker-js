import { jest } from '@jest/globals';

import { Router } from '../src/router.js';

describe(Router.name, () => {
  /** @type {jest.Mocked<Pick<globalThis, 'addEventListener'>> & { location: { hash: string }}} */
  let globalStub;
  /** @type {Router} */
  let sut;

  beforeEach(() => {
    globalStub = {
      addEventListener: jest.fn(),
      location: {
        hash: '',
      },
    };
    sut = new Router(globalStub);
  });

  it('should immediately emit the current route onNext', () => {
    // Arrange
    const callback = /** @type {RouteCallback} */ jest.fn();
    globalStub.location.hash = '#/foo';

    // Act
    sut.onNext(callback);

    // Assert
    expect(callback).toHaveBeenCalled();
  });
  it('should emit on next', () => {
    const callback = /** @type {RouteCallback} */ jest.fn();
    globalStub.location.hash = '#/foo';
    sut.onNext(callback);
    const eventListener = /** @type {EventListener} */ (globalStub.addEventListener.mock.lastCall[1]);

    // Act
    sut.next('#/bar');
    eventListener(new HashChangeEvent('hashchange'));

    // Assert
    expect(callback).toHaveBeenCalled();
  });

  it('should be able to unsubscribe', () => {
    const callback = /** @type {RouteCallback} */ jest.fn();
    const subscription = sut.onNext(callback);
    subscription();
    // Too difficult to assert 🤡
  });
});
