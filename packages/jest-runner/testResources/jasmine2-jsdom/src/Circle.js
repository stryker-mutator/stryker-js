class CircleElement extends HTMLElement {

  get circumference() {
    return 2 * Math.PI * Number(this.getAttribute('radius'))
  }

  untestedFunction() {
    return 5 / 2 * 3;
  };  
}

customElements.define('my-circle', CircleElement);
