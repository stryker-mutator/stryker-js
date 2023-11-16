import { HeadingComponent } from './heading.component';

describe(HeadingComponent.name, () => {
  let sut: HeadingComponent;

  beforeEach(() => {
    sut = document.createElement('my-heading');
  });

  it('should project its content', () => {
    sut.innerHTML = 'Hello World';
    document.body.appendChild(sut);
    expect(sut.shadowRoot!.innerHTML).toContain('Hello World');
  });
});
