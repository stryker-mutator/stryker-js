import './hello-component';

describe('hello-component', () => {

  fit('should show a "hello world" message', () => {
    const element = document.createElement('jest-hello');
    document.body.appendChild(element);
    expect(element.innerText).toEqual('hello world');
    document.body.removeChild(element);
  });
});
