export class RoboComponent extends HTMLElement {
  by = new Selector(this);
}

export class Selector {
  #element;

  /** @type {Record<string, HTMLElement>} */
  class;
  /** @type {Record<string, HTMLElement>} */
  id;

  /** @param {HTMLElement} element */
  constructor(element) {
    this.#element = element;
    this.class = new Proxy(
      {},
      {
        get: (_, property) => this.#element?.querySelector(`.${String(property)}`),
      },
    );
    this.id = new Proxy(
      {},
      {
        get: (_, property) => this.#element?.querySelector(`#${String(property)}`),
      },
    );
  }
}

/**
 * @param {HTMLTemplateElement} template
 * @returns {HTMLElement}
 */
export function cloneTemplate(template) {
  return /** @type {HTMLElement} */ (template.content.cloneNode(true));
}
