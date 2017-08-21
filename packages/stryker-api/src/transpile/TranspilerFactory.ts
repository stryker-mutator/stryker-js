import { Factory } from '../../core';
import Transpiler from './Transpiler';
import TranspilerOptions from './TranspilerOptions';

namespace TranspilerFactory {
  class TranspilerFactory extends Factory<TranspilerOptions, Transpiler> {
    constructor() {
      super('transpiler');
    }
  }
  const mutatorFactoryInstance = new TranspilerFactory();

  export function instance() {
    return <Factory<TranspilerOptions, Transpiler>>mutatorFactoryInstance;
  }
}

export default TranspilerFactory;