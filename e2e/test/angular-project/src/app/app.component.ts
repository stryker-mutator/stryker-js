import { booleanAttribute, Component, contentChild, contentChildren, Directive, EventEmitter, Input, input, model, output, Output, TemplateRef, viewChild, viewChildren } from '@angular/core';

@Directive({ selector: '[stepDetail]' })
class StepDetailDirective {}

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent {
  @Input({ alias: 'decorator-input', transform: booleanAttribute }) decoratorInput = false
  signalInput = input(false, { alias: 'signal-input', transform: booleanAttribute });
  signalRequiredInput = input.required({ alias: 'signal-required-input', transform: booleanAttribute });

  signalModel = model(false, { alias: 'signal-model' });
  signalRequiredModel = model.required<boolean>({ alias: 'signal-required-model' });

  @Output() decoratorOutput = new EventEmitter<boolean>();
  signalOutput = output({ alias: 'signal-output' });

  public title = 'angular' + '-project';

  public contentChildSignal = contentChild(StepDetailDirective, { read: TemplateRef })
  public contentChildrenSignal = contentChildren(StepDetailDirective, { read: TemplateRef, descendants: true })
  public viewChildSignal = viewChild('tpl', { read: TemplateRef })
  public viewChildrenSignal = viewChildren('tpl', { read: TemplateRef })

  public contentChildRequiredSignal = contentChild.required(StepDetailDirective, { read: TemplateRef })
  public viewChildRequiredSignal = viewChild.required('tpl', { read: TemplateRef })

  public contentChildNoOptionsSignal = contentChild(StepDetailDirective)
}
