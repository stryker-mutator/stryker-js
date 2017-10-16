import { expect } from "chai";
import Main from "../src/index";

describe("index.js", () => {
    let main: Main;

    beforeEach(() => {
         main = new Main();
    });

    it("should return \"Hello World\" when the hello function is called", () => {
        expect(main.hello()).to.equal("Hello World!");
    });
});
