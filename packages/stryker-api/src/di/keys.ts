import InjectableKey from './InjectorKey';

export default function keys<TS extends InjectableKey[]>(...keys: TS): TS {
  return keys;
}
