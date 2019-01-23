// error: "Property 'inject' is missing in type 'typeof Foo'"
import { rootInjector, Injector } from '../src/index';

rootInjector.injectClass(class Foo {
  constructor(public injector: Function | Injector<{}> | undefined) { }
});
