import { booleanAttribute, Directive, EventEmitter, input, Input, model, output, Output } from '@angular/core';

@Directive({
  selector: '[appNoop]'
})
export class NoopDirective {
  @Input({ alias: 'decorator-input', transform: booleanAttribute }) decoratorInput = false
  signalInput = input(false, { alias: 'signal-input', transform: booleanAttribute });
  signalRequiredInput = input.required({ alias: 'signal-required-input', transform: booleanAttribute });

  signalModel = model(false, { alias: 'signal-model' });
  signalRequiredModel = model.required<boolean>({ alias: 'signal-required-model' });

  @Output() decoratorOutput = new EventEmitter<boolean>();
  signalOutput = output({ alias: 'signal-output' });
}
