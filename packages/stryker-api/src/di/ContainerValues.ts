import { Injections } from './Injections';

type ContainerValues<TS extends (keyof Injections)[]> = {
  [K in keyof TS]: TS[K] extends keyof Injections ? Injections[TS[K]] : never;
};

export default ContainerValues;
