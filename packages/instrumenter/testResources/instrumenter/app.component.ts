import { input, model, output, Component } from '@angular/core';

const inputOutsideClass = input('', { alias: 'input-outside-class' });
const modelOutsideClass = model('', { alias: 'model-outside-class' });
const outputOutsideClass = output<string>({ alias: 'output-outside-class' });

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

  title = 'angular-app';

  public publicFunction(): void {
    const inputInsideFunction = input('', { alias: 'input-inside-function' });
    const modelInsideFunction = model('', { alias: 'model-inside-function' });
    const outputInsideFunction = output<string>({ alias: 'output-inside-function' });
  }
}
