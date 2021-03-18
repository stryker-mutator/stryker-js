declare module 'weapon-regex' {
  export interface Options {
    mutationLevels: number[];
  }

  export interface Mutant {
    description: string;
    pattern: string;
  }

  export function mutate(pattern: string, ops?: Options): Mutant[];
}
