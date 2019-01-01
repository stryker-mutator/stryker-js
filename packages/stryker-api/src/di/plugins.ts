import { StrykerPlugin as P, InjectionToken as I } from '../../di';

export default function plugins<T1, TArgs1 extends I[]>(plugin: P<T1, TArgs1>): [P<T1, TArgs1>];
export default function plugins<T1, TArgs1 extends I[], T2, TArgs2 extends I[]>(plugin: P<T1, TArgs1>, plugin2: P<T2, TArgs2>): [P<T1, TArgs1>, P<T2, TArgs2>];
export default function plugins<T1, TArgs1 extends I[], T2, TArgs2 extends I[], T3, TArgs3 extends I[]>(plugin: P<T1, TArgs1>, plugin2: P<T2, TArgs2>, plugin3: P<T3, TArgs3>): [P<T1, TArgs1>, P<T2, TArgs2>, P<T3, TArgs3>];
export default function plugins<T1, TArgs1 extends I[], T2, TArgs2 extends I[], T3, TArgs3 extends I[], T4, TArgs4 extends I[]>(plugin: P<T1, TArgs1>, plugin2: P<T2, TArgs2>, plugin3: P<T3, TArgs3>, plugin4: P<T4, TArgs4>): [P<T1, TArgs1>, P<T2, TArgs2>, P<T3, TArgs3>, P<T4, TArgs4>];
export default function plugins<T1, TArgs1 extends I[], T2, TArgs2 extends I[], T3, TArgs3 extends I[], T4, TArgs4 extends I[], T5, TArgs5 extends I[]>(plugin: P<T1, TArgs1>, plugin2: P<T2, TArgs2>, plugin3: P<T3, TArgs3>, plugin4: P<T4, TArgs4>, plugin5: P<T5, TArgs5>): [P<T1, TArgs1>, P<T2, TArgs2>, P<T3, TArgs3>, P<T4, TArgs4>, P<T5, TArgs5>];
export default function plugins<T1, TArgs1 extends I[], T2, TArgs2 extends I[], T3, TArgs3 extends I[], T4, TArgs4 extends I[], T5, TArgs5 extends I[], T6, TArgs6 extends I[]>(plugin: P<T1, TArgs1>, plugin2: P<T2, TArgs2>, plugin3: P<T3, TArgs3>, plugin4: P<T4, TArgs4>, plugin5: P<T5, TArgs5>, plugin6: P<T6, TArgs6>): [P<T1, TArgs1>, P<T2, TArgs2>, P<T3, TArgs3>, P<T4, TArgs4>, P<T5, TArgs5>, P<T6, TArgs6>];
export default function plugins(...plugins: P<any, any>[]) {
  return plugins;
}
