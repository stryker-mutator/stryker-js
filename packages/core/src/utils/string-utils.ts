export function wrapInClosure(codeFragment: string): string {
  return `
    (function (window) {
      ${codeFragment}
    })((Function('return this'))());`;
}

export function padLeft(input: string): string {
  return input
    .split('\n')
    .map((str) => '\t' + str)
    .join('\n');
}

export function plural(items: number): string {
  if (items > 1) {
    return 's';
  } else {
    return '';
  }
}

export function serialize(thing: unknown): string {
  return JSON.stringify(thing);
}

export function deserialize<T>(stringified: string): T {
  return JSON.parse(stringified);
}
