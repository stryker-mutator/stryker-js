import InjectableKey from './InjectableKey';
import ContainerValues from './ContainerValues';

interface Injectable<T, TS extends InjectableKey[]> {
  new(...args: ContainerValues<TS>): T;
  inject: TS;
}

export default Injectable;
