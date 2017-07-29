import Calculator from "./calculator";
import * as ts from "typescript";
import * as glob from "glob";
class HelloWorld {
    private calculator: Calculator;
    constructor() {this.calculator = new Calculator();}

    public sayHelloTo(name: string) {
        let x = new glob.GlobSync("a" + "b");
        console.log("Hello " + name);
    }
}