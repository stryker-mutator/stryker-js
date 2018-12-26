import { JSDOM } from 'jsdom';

export function selectAllText(htmlFragment: string, selector: string): string[] {
  return selectAll(htmlFragment, selector).map(element => element.textContent || '');
}

export function selectAll(htmlFragment: string, selector: string): HTMLElement[] {
  const dom = JSDOM.fragment(htmlFragment);
  const items = dom.querySelectorAll(selector);
  const elements: HTMLElement[] = [];
  for (let i = 0; i < items.length; i++) {
    elements.push(items.item(i) as HTMLElement);
  }

  return elements;
}
