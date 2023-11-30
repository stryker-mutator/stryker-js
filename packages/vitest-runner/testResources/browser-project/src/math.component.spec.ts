import { MathComponent } from './math.component';

describe('my-math', () => {
  let sut: MathComponent;

  beforeEach(() => {
    sut = document.createElement('my-math');
  });

  afterEach(() => {
    sut.remove();
  });

  it('should support simple addition', () => {
    sut.left = 42;
    sut.right = 0;
    expect(sut.innerText).eq('42 + 0 = 42')
  });
  it('should support simple subtraction', () => {
    sut.left = 42;
    sut.right = 2;
    sut.operator = '-';
    expect(sut.innerText).eq('42 - 2 = 40')
  });
});
