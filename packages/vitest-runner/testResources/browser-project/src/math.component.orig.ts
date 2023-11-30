type Operator = '+' | '-';
const operators = Object.freeze(new Set(['+', '-']));

const left = 'left';
const right = 'right';
const operator = 'operator';
const plus = '+';
const min = '-';
const defaultOperator = plus;
export class MathComponent extends HTMLElement {
  #left = 0;
  #right = 0;
  #operator: Operator = defaultOperator;
  static observedAttributes = [left, right];

  connectedCallback() {
    this.left = this.getAttribute(left) ?? 0;
    this.right = this.getAttribute(right) ?? 0;
    this.operator = this.getAttribute(operator) ?? defaultOperator;
    this.render();
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === left) {
      this.left = newValue;
    }
    if (name === right) {
      this.right = newValue;
    }
    if (name === operator) {
      this.operator = newValue;
    }
  }

  public get left(): number {
    return this.#left;
  }
  public set left(value: string | number) {
    this.#left = +value;
  }
  public get right(): number {
    return this.#right;
  }
  public set right(value: string | number) {
    this.#right = +value;
    this.render();
  }
  public get operator(): Operator {
    return this.#operator;
  }
  public set operator(value: string) {
    if (operators.has(value)) {
      this.#operator = value as Operator;
    } else {
      throw new Error(`Value "${value}" is not a supported operator`);
    }
    this.render();
  }

  private get answer() {
    switch (this.#operator) {
      case plus:
        return this.left + this.right;
      case min:
        return this.left - this.right;
    }
  }

  public render() {
    this.innerText = `${this.left} ${this.operator} ${this.right} = ${this.answer}`;
  }
}
customElements.define('my-math', MathComponent);
declare global {
  interface HTMLElementTagNameMap {
    'my-math': MathComponent;
  }
}
