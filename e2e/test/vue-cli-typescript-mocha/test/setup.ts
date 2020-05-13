import sinon from 'sinon';
import { fetch } from 'whatwg-fetch';

(globalThis as any).fetch = fetch;
afterEach(() => {
  sinon.restore();
});
