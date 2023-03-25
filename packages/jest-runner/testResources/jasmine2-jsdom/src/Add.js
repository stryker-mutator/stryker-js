
class CalculatorElement extends HTMLElement {

  connectedCallback() {
    switch (this.getAttribute('operator')) {
      case 'add':
        this.innerHTML = Number(this.getAttribute('a')) + Number(this.getAttribute('b'));
        break;
      case 'addOne':
        this.innerHTML = Number(this.getAttribute('a')) + 1;
        break;
      case 'negate':
        this.innerHTML = -(Number(this.getAttribute('a')));
        break;
      case 'isNegative':
        const a = (Number(this.getAttribute('a')));
        this.innerHTML = a < 0;
        break;
    }
  }
}

customElements.define('my-calculator', CalculatorElement);
