class FailingElement extends HTMLElement {
  static get is() {
    return 'failing-element';
  }

  get isFailing() {
    return true;
  }

  throw() {
    throw new Error('This element is failing')
  }
}
window.customElements.define(FailingElement.is, FailingElement);