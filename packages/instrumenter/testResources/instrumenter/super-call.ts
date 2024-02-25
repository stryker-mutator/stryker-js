export class InjectionError extends TypedInjectError {
  constructor(public readonly path: InjectionTarget[], public readonly cause: Error) {
    super(`Could not ${describeInjectAction(path[0])} ${path.map(name).join(' -> ')}. Cause: ${cause.message}`);
  }
}

// See https://github.com/stryker-mutator/stryker-js/issues/4744
export class UniqueKeyFailedError<T> extends UnprocessableEntityException {
  constructor(public readonly fields: ReadonlyArray<keyof T & string>) {
    const errorBody: UnprocessableEntityBody<T> = {
      status: 'uniqueness_failed',
      fields,
    };
    super(errorBody);
    console.log(`${this.message} created`);
  }
}
