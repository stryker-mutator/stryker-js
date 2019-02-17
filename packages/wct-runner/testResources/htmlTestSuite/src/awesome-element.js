class AwesomeElement extends HTMLElement {
  static get is() {
    return 'awesome-element';
  }
  get isAwesome() {
    return true;
  }
}
window.customElements.define(AwesomeElement.is, AwesomeElement);