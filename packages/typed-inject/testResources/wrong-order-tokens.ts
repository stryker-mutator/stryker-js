// error: "Types of parameters 'bar' and 'args_0' are incompatible"
import { rootInjector, tokens } from '../src/index';

class Foo {
  constructor(bar: string, baz: number) { }
  public static inject = tokens('baz', 'bar');
}

const foo: Foo = rootInjector
  .provideValue('bar', 'bar')
  .provideValue('baz', 42)
  .injectClass(Foo);
