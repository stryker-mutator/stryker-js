import {helloWorld} from "../src";

describe('Hello World', () => {
    it('should output hello world', () => {
        expect(helloWorld()).toBe('hello world');
    });
});
