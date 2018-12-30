import { Container } from 'stryker-api/di';

type Providers = {
  readonly [K in keyof Container]: Provider<Container[K]>;
};

export type Provider<T> = ValueProvider<T> | FactoryProvider<T>; '';

export enum ProviderKind {
  'Value',
  'Factory'
}

interface ValueProvider<T> {
  kind: ProviderKind.Value;
  value: T;
}

interface FactoryProvider<T> {
  kind: ProviderKind.Factory;
  factory(target: Function): T;
}

export default Providers;
