export abstract class TypedInjectError extends Error {}
export type InjectionTarget = Function | symbol | number | string | undefined;

function describeInjectAction(target: InjectionTarget) {
  if (typeof target === 'function') {
    return 'inject';
  } else {
    return 'resolve';
  }
}

function name(target: InjectionTarget) {
  if (typeof target === 'function') {
    if (target.toString().startsWith('class')) {
      return `[class ${target.name || '<anonymous>'}]`;
    } else {
      return `[function ${target.name || '<anonymous>'}]`;
    }
  } else {
    return `[token "${String(target)}"]`;
  }
}


export class InjectionError extends TypedInjectError {
  constructor(public readonly path: InjectionTarget[], public readonly cause: Error) {
    super(`Could not ${describeInjectAction(path[0])} ${path.map(name).join(' -> ')}. Cause: ${cause.message}`);
  }

  static create(target: InjectionTarget, error: Error) {
    if (error instanceof InjectionError) {
      return new InjectionError([target, ...error.path], error.cause);
    } else {
      return new InjectionError([target], error);
    }
  }
}
