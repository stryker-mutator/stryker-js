[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/typed-inject.svg)](https://www.npmjs.com/package/typed-inject)
[![Node version](https://img.shields.io/node/v/typed-inject.svg)](https://img.shields.io/node/v/stryker-utils.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Typed Inject

> Type safe dependency injection for TypeScript

A tiny, 100% type safe dependency injection framework for TypeScript. You can inject classes, interfaces or primitives. If your project compiles, you know for sure your dependencies are resolved at runtime and have their declared types.

_If you are new to 'Dependency Injection'/'Inversion of control', please read up on it [in this blog article about it](https://medium.com/@samueleresca/inversion-of-control-and-dependency-injection-in-typescript-3040d568aabe)_

## 🗺️ Installation

Install typed-inject locally within your project folder, like so:

```shell
npm i typed-inject
```

Or with yarn:

```shell
yarn add typed-inject
```

_Note: this package uses advanced TypeScript features. Only TS 3.0 and above is supported!_

## 🎁 Usage

An example:

```ts
import { rootInjector, tokens } from 'typed-inject';

interface Logger {
    info(message: string): void;
}

const logger: Logger = {
  info(message: string) {
    console.log(message);
  }
};

class HttpClient {
    constructor(private log: Logger) { }
    public static inject = tokens('logger');
}

class MyService {
    constructor(private http: HttpClient, private log: Logger) { }
    public static inject = tokens('httpClient', 'logger');
}

const appInjector = rootInjector
  .provideValue('logger', logger)
  .provideClass('httpClient', HttpClient);

const myService = appInjector.injectClass(MyService);
// Dependencies for MyService validated and injected
```

In this example: 

* The `logger` is injected into a new instance of `HttpClient` by value.
* The instance of `HttpClient` and the `logger` are injected into a new instance of `MyService`.

Dependencies are resolved using the static `inject` property on their classes. They must match the names given to the dependencies when configuring the injector with `provideXXX` methods. 

Expect compiler errors when you mess up the order of tokens or forget it completely.

```ts
import { rootInjector, tokens } from 'typed-inject';

// Same logger as before

class HttpClient {
    constructor(private log: Logger) { }
    // ERROR! Property 'inject' is missing in type 'typeof HttpClient' but required
}

class MyService {
    constructor(private http: HttpClient, private log: Logger) { }
    public static inject = tokens('logger', 'httpClient');
    // ERROR! Types of parameters 'http' and 'args_0' are incompatible
}

const appInjector = rootInjector
  .provideValue('logger', logger)
  .provideClass('httpClient', HttpClient);

const myService = appInjector.injectClass(MyService);
```

The error messages are a bit cryptic at times, but it sure is better than running into them at runtime.

## ✨ Magic tokens

Any `Injector` instance can always inject the following tokens:

| Token name | Token value | Description |
| - | - | - | 
| `INJECTOR_TOKEN` | `'$injector'` | Injects the current injector |
| `TARGET_TOKEN` | `'$target'` | The class or function in which the current values is injected, or `undefined` if resolved directly |  

An example:

```ts
import { rootInjector, Injector, tokens, TARGET_TOKEN, INJECTOR_TOKEN } from 'typed-inject';

class Foo {
    constructor(injector: Injector<{}>, target: Function | undefined) {}
    static inject = tokens(INJECTOR_TOKEN, TARGET_TOKEN);
}

const foo = rootInjector.inject(Foo);
```

## 💭 Motivation

JavaScript and TypeScript development already has a great dependency injection solution with [InversifyJS](https://github.com/inversify/InversifyJS). However, InversifyJS comes with 2 caveats.

### InversifyJS uses Reflect-metadata

InversifyJS works with a nice API using decorators. Decorators is in Stage 2 of ecma script proposal at the moment of writing this, so will most likely land in ESNext. However, it also is opinionated in that it requires you to use [reflect-metadata](https://rbuckton.github.io/reflect-metadata/), which [is supposed to be an ecma script proposal, but isn't yet (at the moment of writing this)](https://github.com/rbuckton/reflect-metadata/issues/96). It might take years for reflect-metadata to land in Ecma script, if it ever does.

### InversifyJS is not type-safe

InversifyJS is also _not_ type-safe. There is no check to see of the injected type is actually injectable or that the corresponding type adheres to the expected type.

## 🗝️ Type safe? How?

Type safe dependency injection works by combining awesome TypeScript features. Some of those features are:

* [Literal types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#string-literal-types)
* [Intersection types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
* [Mapped types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types)
* [Conditional types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#conditional-types)
* [Rest parameters with tuple types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#rest-parameters-with-tuple-types)

## 📖 API reference

_Note: some generic parameters are omitted for clarity._

### `Injector<TContext>`

The `Injector<TContext>` is the core interface of typed-inject. It provides the ability to inject your class or function with `injectClass` and `injectFunction` respectively. You can create new _child injectors_ from it using the `provideXXX` methods.

The `TContext` generic arguments is a [lookup type](https://blog.mariusschulz.com/2017/01/06/typescript-2-1-keyof-and-lookup-types). The keys in this type are the tokens that can be injected, the values are the exact types of those tokens. For example, if `TContext extends { foo: string, bar: number }`, you can let a token `'foo'` be injected of type `string`, and a token `'bar'` of type `number`.

Typed inject comes with only one implementation. The `rootInjector`. It implements `Injector<{}>` interface, meaning that it does not provide any tokens (except for [magic tokens](#magic-tokens)) Import it with `import { rootInjector } from 'typed-inject'`. From the `rootInjector`, you can create child injectors. 

Don't worry about reusing the `rootInjector` in your application. It is stateless and read-only, so safe for concurrent use.

#### `injector.injectClass(injectable: InjectableClass)`

This method creates a new instance of class `injectable` and returns it. 
When there are any problems in the dependency graph, it gives a compiler error.

```ts
class Foo {
    constructor(bar: number) { }
    static inject = tokens('bar');
}
const foo /*: Foo*/ = injector.injectClass(Foo);
```

#### `injector.injectFunction(fn: InjectableFunction)`

This methods injects the function with requested tokens and returns the return value of the function.
When there are any problems in the dependency graph, it gives a compiler error.

```ts
function foo(bar: number) {
    return bar + 1;
}
foo.inject = tokens('bar');
const baz /*: number*/ = injector.injectFunction(Foo);
```

#### `injector.resolve(token: Token): CorrespondingType<TContext, Token>`

The `resolve` method lets you resolve tokens by hand. 

```ts
const foo = injector.resolve('foo');
// Equivalent to:
function retrieveFoo(foo: number){
    return foo;
}
retrieveFoo.inject = tokens('foo');
const foo2 = injector.injectFunction(retrieveFoo);
```

#### `injector.provideValue(token: Token, value: R): Injector<ChildContext<TContext, Token, R>>`

Create a child injector that can provide value `value` for token `'token'`. The new child injector can resolve all tokens the parent injector can as well as `'token'`.

```ts
const fooInjector = injector.provideValue('foo', 42);
```

#### `injector.provideFactory(token: Token, factory: InjectableFunction<TContext>, scope = Scope.Singleton): Injector<ChildContext<TContext, Token, R>>`

Create a child injector that can provide a value using `factory` for token `'token'`. The new child injector can resolve all tokens the parent injector can, as well as the new `'token'`.

With `scope` you can decide whether the value must be cached after the factory is invoked once. Use `Scope.Singleton` to enable caching (default), or `Scope.Transient` to disable caching.

```ts
const fooInjector = injector.provideFactory('foo', () => 42);
function loggerFactory(target: Function | undefined) {
    return new Logger((target && target.name) || '');
}
loggerFactory.inject = tokens(TARGET_TOKEN);
const fooBarInjector = fooInjector.provideFactory('logger', loggerFactory, Scope.Transient)
```

#### `injector.provideFactory(token: Token, Class: InjectableClass<TContext>, scope = Scope.Singleton): Injector<ChildContext<TContext, Token, R>>`

Create a child injector that can provide a value using instances of `Class` for token `'token'`. The new child injector can resolve all tokens the parent injector can, as well as the new `'token'`.

Scope is also supported here, for more info, see `provideFactory`.

### `Scope`

The `Scope` enum indicates the scope of a provided injectable (class or factory). Possible values: `Scope.Transient` (new injection per resolve) or `Scope.Singleton` (inject once, and reuse values). It generally defaults to `Singleton`. 

### `tokens`

The `tokens` function is a simple helper method that makes sure that an `inject` array is filled with a [tuple type filled with literal strings](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#rest-parameters-with-tuple-types).

```ts
const inject = tokens('foo', 'bar');
// Equivalent to:
const inject: ['foo', 'bar'] = ['foo', 'bar'].
```

_Note: hopefully [TypeScript will introduce explicit tuple syntax](https://github.com/Microsoft/TypeScript/issues/16656), so this helper method can be removed_

### `InjectableClass<TContext, R, Tokens extends InjectionToken<TContext>[]>`

The `InjectableClass` interface is used to identify the (static) interface of classes that can be injected. It is defined as follows:

```ts
{
  new(...args: CorrespondingTypes<TContext, Tokens>): R;
  readonly inject: Tokens;
}
```

In other words, it makes sure that the `inject` tokens is corresponding with the constructor types.

### `InjectableFunction<TContext, R, Tokens extends InjectionToken<TContext>[]>`

Comparable to `InjectableClass`, but for (non-constructor) functions.

## 🤝 Commendation

This entire framework would not be possible without the awesome guys working on TypeScript. Guys like [Ryan](https://github.com/RyanCavanaugh), [Anders](https://github.com/ahejlsberg) and the rest of the team: a heartfelt thanks! 💖

Inspiration for the API with static `inject` method comes from years long AngularJS development. Special thanks to the Angular team.

