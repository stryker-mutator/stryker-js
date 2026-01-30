import { input, model, output, Component, contentChild, contentChildren, viewChild, viewChildren, TemplateRef, Directive } from '@angular/core';

@Directive({ selector: '[stepDetail]' })
class StepDetailDirective {}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  normalInput = input('', { alias: 'normal-input' });
  requiredInput = input.required<string>({ alias: 'required-input' });

  normalModel = model('', { alias: 'normal-model' });
  requiredModel = model.required<string>({ alias: 'required-model' });

  normalOutput = output<string>({ alias: 'normal-output' });

  inputFalseAlias = input({ alias: 'this-is-actually-the-default-value' });
  modelFalseAlias = model({ alias: 'this-is-actually-the-default-value' });

  readonly contentChildField = contentChild(StepDetailDirective, { read: TemplateRef });
  readonly contentChildrenField = contentChildren(StepDetailDirective, { read: TemplateRef, descendants: true });
  readonly viewChildField = viewChild('tpl', { read: TemplateRef });
  readonly viewChildrenField = viewChildren('tpl', { read: TemplateRef });

  readonly contentChildRequiredField = contentChild.required(StepDetailDirective, { read: TemplateRef });
  readonly viewChildRequiredField = viewChild.required('tpl', { read: TemplateRef });

  readonly contentChildNoOptionsField = contentChild(StepDetailDirective);

  title = 'angular-app';
}
