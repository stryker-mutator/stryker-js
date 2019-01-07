import { CorrespondingTypes } from './CorrespondingType';
import { InjectionToken } from './InjectionToken';

export interface InjectableClass<TContext, R, Tokens extends InjectionToken<TContext>[]> {
  new(...args: CorrespondingTypes<TContext, Tokens>): R;
  readonly inject?: Tokens;
}

export interface InjectableFunction<TContext, R, Tokens extends InjectionToken<TContext>[]> {
  (...args: CorrespondingTypes<TContext, Tokens>): R;
  readonly inject?: Tokens;
}

export type Injectable<TContext, R, Tokens extends InjectionToken<TContext>[]> = InjectableClass<TContext, R, Tokens> | InjectableFunction<TContext, R, Tokens>;
