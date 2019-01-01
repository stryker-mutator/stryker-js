import InjectionToken from './InjectionToken';
import Injectable from './Injectable';

export default function token<T, TS extends InjectionToken[]>(injectable: Injectable<T, TS>): InjectionToken {
  return injectable;
}
