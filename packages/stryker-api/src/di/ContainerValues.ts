import Container from './Container';
import InjectorKey from './InjectorKey';

type ContainerValues<TS extends InjectorKey[]> = {
  [K in keyof TS]: TS[K] extends keyof Container ? Container[TS[K]] : never;
};

export default ContainerValues;
