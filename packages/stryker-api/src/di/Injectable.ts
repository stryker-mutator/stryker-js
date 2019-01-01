import InjectionToken from './InjectionToken';
import CorrespondingTypes from './CorrespondingTypes';

interface Injectable<T, Tokens extends InjectionToken[]> {
  new(...args: CorrespondingTypes<Tokens>): T;
  readonly inject: Tokens;
}

export default Injectable;
