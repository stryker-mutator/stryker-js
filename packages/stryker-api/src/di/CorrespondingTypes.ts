import InjectionToken from './InjectionToken';
import CorrespondingType from './CorrespondingType';

type CorrespondingTypes<TS extends InjectionToken[]> = {
  [K in keyof TS]: TS[K] extends InjectionToken ? CorrespondingType<TS[K]> : never;
};

export default CorrespondingTypes;
