
export class HelloComponent extends HTMLElement {
  connectedCallback() {
    this.innerText = 'hello world';
  }
}
window.customElements.define('jest-hello', HelloComponent);
