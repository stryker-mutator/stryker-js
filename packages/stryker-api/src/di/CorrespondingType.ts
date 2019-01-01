import { InjectionToken, Container } from '../../di';

type CorrespondingType<T extends InjectionToken> =
  T extends keyof Container ? Container[T] : T extends new (...args: any[]) => any ? InstanceType<T> : never;

export default CorrespondingType;
