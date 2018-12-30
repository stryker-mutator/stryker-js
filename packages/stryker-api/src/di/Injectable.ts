import InjectableKey from './InjectorKey';
import ContainerValues from './ContainerValues';

interface Injectable<T, TArgKeys extends InjectableKey[]> {
  new(...args: ContainerValues<TArgKeys>): T;
  readonly inject: TArgKeys;
}

export default Injectable;
