import { notEmpty } from './not-empty.js';

export interface UnserializableDescription {
  path: string[];
  reason: string;
}

export function findUnserializables(
  thing: unknown,
): UnserializableDescription[] | undefined {
  switch (typeof thing) {
    case 'number':
      return !isFinite(thing)
        ? [
            {
              reason: `Number value \`${thing}\` has no JSON representation`,
              path: [],
            },
          ]
        : undefined;
    case 'string':
    case 'boolean':
    case 'undefined':
      return;
    case 'bigint':
    case 'function':
    case 'symbol':
      return [
        {
          path: [],
          reason: `Primitive type "${typeof thing}" has no JSON representation`,
        },
      ];
    case 'object': {
      // Either a plain object, null, array or instance of a class
      if (thing === null) {
        return;
      }
      if (Array.isArray(thing)) {
        const things = thing
          .flatMap((child, index) =>
            findUnserializables(child)?.map((description) => {
              description.path.unshift(index.toString());
              return description;
            }),
          )
          .filter(notEmpty);
        return things.length ? things : undefined;
      }
      const thingProto = Object.getPrototypeOf(thing);
      if (thingProto === Object.prototype || thingProto === null) {
        const things = Object.entries(thing)
          .flatMap(([key, val]) =>
            findUnserializables(val)?.map((description) => {
              description.path.unshift(key);
              return description;
            }),
          )
          .filter(notEmpty);
        return things.length ? things : undefined;
      }
      const protoClassName = thing.constructor.name || '<anonymous class>';
      return [
        {
          path: [],
          reason: `Value is an instance of "${protoClassName}", this detail will get lost in translation during serialization`,
        },
      ];
    }
  }
}
