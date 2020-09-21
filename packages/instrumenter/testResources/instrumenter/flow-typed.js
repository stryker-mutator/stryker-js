declare module 'react-test-renderer' {
  // eslint-disable-next-line no-inner-declarations
}
declare type ReactTestRenderer = {
  toJSON(): null | ReactTestRendererJSON,
  toTree(): null | ReactTestRendererTree,
  unmount(nextElement?: React$Element<any>): void,
  update(nextElement: React$Element<any>): void,
  getInstance(): ?ReactComponentInstance,
  root: ReactTestInstance,
};

declare type Thenable = {
  then(resolve: () => mixed, reject?: () => mixed): mixed,
};

declare function create(
  nextElement: React$Element<any>,
  options?: TestRendererOptions
): ReactTestRenderer;

declare function act(callback: () => ?Thenable): Thenable;

