import { InjectionToken, InjectorToken, TargetToken } from './InjectionToken';
import { Injector } from './Injector';

export type CorrespondingType<TContext, T extends InjectionToken<TContext>> =
  T extends InjectorToken ? Injector<TContext>
  : T extends TargetToken ? Function | undefined
  : T extends keyof TContext ? TContext[T] : never;

export type CorrespondingTypes<TContext, TS extends InjectionToken<TContext>[]> = {
  [K in keyof TS]: TS[K] extends InjectionToken<TContext> ? CorrespondingType<TContext, TS[K]> : never;
};
