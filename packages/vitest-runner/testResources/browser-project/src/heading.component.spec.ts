import { HeadingComponent } from './heading.component';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

describe(HeadingComponent.name, () => {
  let sut: HeadingComponent;

  beforeEach(() => {
    sut = document.createElement('my-heading');
  });

  afterEach(() => {
    sut.remove();
  });

  it('should project its content', () => {
    sut.innerHTML = 'Hello World';
    document.body.appendChild(sut);
    const slot = sut.shadowRoot!.querySelector('slot')!;
    const slotContent = slot.assignedNodes()[0] as Text;
    expect(slotContent.data).toContain('Hello World');
  });
});
