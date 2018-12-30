import InjectorKey from './InjectorKey';
import { Injectable } from '../../di';

type Inject = <T, TArgKeys extends InjectorKey[]>(Constructor: Injectable<T, TArgKeys>) => T;

export default Inject;
