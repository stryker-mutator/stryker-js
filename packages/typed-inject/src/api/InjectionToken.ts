export type InjectorToken = '$injector';
export type TargetToken = '$target';
export const INJECTOR_TOKEN: InjectorToken = '$injector';
export const TARGET_TOKEN: TargetToken = '$target';
export type InjectionToken<TContext> = InjectorToken | TargetToken | keyof TContext;
