import { input, model, output, Directive } from '@angular/core';

const inputOutsideClass = input('', { alias: 'input-outside-class' });
const modelOutsideClass = model('', { alias: 'model-outside-class' });
const outputOutsideClass = output<string>({ alias: 'output-outside-class' });

@Directive({ selector: '[appDirective]' })
export class AppDirective {
  normalInput = input('', { alias: 'normal-input' });
  requiredInput = input.required<string>({ alias: 'required-input' });

  normalModel = model('', { alias: 'normal-model' });
  requiredModel = model.required<string>({ alias: 'required-model' });

  normalOutput = output<string>({ alias: 'normal-output' });

  public publicFunction(): void {
    const inputInsideFunction = input('', { alias: 'input-inside-function' });
    const modelInsideFunction = model('', { alias: 'model-inside-function' });
    const outputInsideFunction = output<string>({ alias: 'output-inside-function' });
  }
}
