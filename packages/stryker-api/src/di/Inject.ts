import InjectionToken from './InjectionToken';
import { Injectable } from '../../di';

type Inject = <T, TArgKeys extends InjectionToken[]>(Constructor: Injectable<T, TArgKeys>) => T;

export default Inject;
