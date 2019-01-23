// error: false
import { rootInjector, tokens } from '../src/index';

class Baz {
  public baz = 'baz';
}

function bar(baz: Baz) {
  return { baz };
}
bar.inject = tokens('baz');

class Foo {
  constructor(public bar: { baz: Baz }, public baz: Baz, public qux: boolean) { }
  public static inject = tokens('bar', 'baz', 'qux');
}

const fooInjector = rootInjector
  .provideValue('qux', true)
  .provideClass('baz', Baz)
  .provideFactory('bar', bar);

const foo: Foo = fooInjector.injectClass(Foo);
