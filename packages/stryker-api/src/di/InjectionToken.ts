import Container from './Container';
import { Injectable } from '../../di';

type InjectionToken = keyof Container | Injectable<any, any>;
export default InjectionToken;

export function token<T, TS extends InjectionToken[]>(injectable: Injectable<T, TS>): InjectionToken {
  return injectable;
}
