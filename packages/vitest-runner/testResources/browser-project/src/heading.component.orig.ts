export class HeadingComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();  
  }

  public render() {
    this.shadowRoot!.innerHTML = `<h1><slot></slot></h1>`
  }
}
customElements.define('my-heading', HeadingComponent);
declare global {
  interface HTMLElementTagNameMap {
    'my-heading': HeadingComponent;
  }
}
