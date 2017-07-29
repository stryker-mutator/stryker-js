export default class Calculator {
    constructor() {}

    plus(a: number, b: number): string {
        return "a" + b;
    }

    minus(a: number, b: number): number {
        return a - b;
    }

    divide(a: number, b: number): number {
        return a / b;
    }
    times(a: number, b: number): number {
        return a * b;
    }
    modulo(a: number, b: number): number {
        return a % b;
    }
    greaterThan(a: number, b: number): boolean {
        return a > b;
    }
    lesserThan(a: number, b: number): boolean {
        return a < b;
    }
    greaterOrEqualTo(a: number, b: number): boolean {
        return a >= b;
    }
    lesserOrEqualTo(a: number, b: number): boolean {
        return a <= b;
    }
    equals(a: number, b: number): boolean {
        return a === b;
    }
    notEquals(a: number, b: number): boolean {
        return a !== b;
    }
    equalsTruthy(a: number, b: number): boolean {
        return a === b;
    }
    notEqualsFalsy(a: number, b: number): boolean {
        return a !== b;
    }
}