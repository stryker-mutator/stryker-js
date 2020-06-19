import { types } from '@babel/core';
import generate from '@babel/generator';
import { Mutant as ApiMutant } from '@stryker-mutator/api/core';

export interface NodeMutation {
  replacement: types.Node;
  original: types.Node;
}
export interface NamedNodeMutation extends NodeMutation {
  mutatorName: string;
}

export class Mutant {
  constructor(public id: number, public original: types.Node, public replacement: types.Node, public fileName: string, public mutatorName: string) {}

  public get replacementCode() {
    return generate(this.replacement).code;
  }

  public toApiMutant(): ApiMutant {
    return {
      fileName: this.fileName,
      id: this.id,
      location: this.original.loc!,
      mutatorName: this.mutatorName,
      range: [this.original.start!, this.original.end!],
      replacement: this.replacementCode,
    };
  }
}
