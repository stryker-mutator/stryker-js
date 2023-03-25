export class InjectionError extends TypedInjectError {
  constructor(public readonly path: InjectionTarget[], public readonly cause: Error) {
    super(`Could not ${describeInjectAction(path[0])} ${path.map(name).join(' -> ')}. Cause: ${cause.message}`);
  }
}
