import InjectionToken from './InjectionToken';

export default function tokens<TS extends InjectionToken[]>(...tokens: TS): TS {
  return tokens;
}
