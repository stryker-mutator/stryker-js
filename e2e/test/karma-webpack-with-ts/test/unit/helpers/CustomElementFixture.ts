import { LitElement } from 'lit-element';

export class CustomElementFixture<TCustomElement extends LitElement> {
  public readonly element: TCustomElement;

  constructor(nodeName: string) {
    this.element = document.createElement(nodeName) as TCustomElement;
    document.body.append(this.element);
  }

  public async whenStable() {
    while (!(await this.element.updateComplete));
  }

  public waitFor(action: () => boolean, timeout = 500) {
    const step = 50;
    return new Promise((res, rej) => {
      function tick(timeLeft: number) {
        if (action()) {
          res();
        } else if (timeLeft <= 0) {
          rej(new Error(`Condition not met in ${timeout} ms: ${action}`));
        } else {
          setTimeout(() => tick(timeLeft - step), step);
        }
      }
      tick(timeout);
    });
  }

  public $(selector: string, inShadow = true): HTMLElement {
    if (inShadow) {
      return (this.element.shadowRoot as ShadowRoot).querySelector(selector) as HTMLElement;
    } else {
      return this.element.querySelector(selector) as HTMLElement;
    }
  }

  public $$(selector: string): Element[] {
    return [...(this.element.shadowRoot as ShadowRoot).querySelectorAll(selector)];
  }

  public get style(): CSSStyleDeclaration {
    return getComputedStyle(this.element);
  }

  public dispose() {
    return this.element.remove();
  }

  public async catchEvent<T extends Event = Event>(eventType: string, act: () => Promise<void> | void) {
    let actual: Event | undefined;
    const eventListener = (evt: Event) => (actual = evt);
    this.element.addEventListener(eventType, eventListener);
    try {
      await act();
      await this.whenStable();
    } finally {
      this.element.removeEventListener(eventType, eventListener);
    }
    return actual as T;
  }
}
