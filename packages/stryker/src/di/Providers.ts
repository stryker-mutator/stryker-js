import { Container } from 'stryker-api/di';

export type Providers = {
  readonly [K in keyof Container]: Provider<Container[K]>;
};

export type Provider<T> = ValueProvider<T> | FactoryProvider<T>;

export interface ValueProvider<T> {
  value: T;
}

export interface FactoryProvider<T> {
  factory(target: Function): T;
}
