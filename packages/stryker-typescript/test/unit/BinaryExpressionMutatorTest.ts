// import { expect } from "chai";
// import {readFileSync} from "fs";
// import { only, skip, slow, suite, test, timeout } from "mocha-typescript";
// import * as ts from "typescript";
// import Mutant from "../Mutant";
// import { MutatorOrchestrator } from "../MutatorOrchestrator";
// import BinaryExpressionMutator  from "../mutators/BinaryExpressionMutator";

// @suite class BinaryExpressionMutatorTest {

//     orchestrator: MutatorOrchestrator;
//     constructor() {
//         console.log("Starting 'BinaryExpressionMutator' tests!");
//     }

//     @test "a file with only 'let a = b + c;' should result in 1 mutant" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1PlusTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(1);
//     }
//     @test "a file with only 'let a = b - c;' should result in 1 mutant" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1MinusTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(1);
//     }
//     @test "a file with only 'let plus = 1 + 2' should result in 'let plus = 1 - 2;'"() {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1PlusTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants[0].getMutatedCode()).to.equal("let plus = 1 - 2;");
//     }
//     @test "a file with only 'let minus = 1 - 2' should result in 'let minus = 1 + 2;'"() {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1MinusTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants[0].getMutatedCode()).to.equal("let minus = 2 + 1;");
//     }
//     @test "a file with only 'let a = 2 / 1;' should result in 1 mutant" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1SlashTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(1);
//     }
//     @test "a file with only 'let slash = 2 / 1' should result in 'let slash = 2 * 1;'"() {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1SlashTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants[0].getMutatedCode()).to.equal("let slash = 2 * 1;");
//     }
//     @test "a file with only 'let a = 2 * 1;' should result in 1 mutant" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1AsteriskTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(1);
//     }
//     @test "a file with only 'let asterisk = 1 * 2' should result in 'let asterisk = 1 / 2;'"() {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1AsteriskTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants[0].getMutatedCode()).to.equal("let asterisk = 1 / 2;");
//     }
//     @test "a file with only 'let a = b % c' should result in 1 mutant" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1PercentageTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(1);
//     }
//     @test "a file with only 'let modulo = 2 % 1' should result in 'let modulo = 2 * 1;'"() {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1PercentageTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants[0].getMutatedCode()).to.equal("let modulo = 2 * 1;");
//     }

//     @test "a file with only 'let a = 4 < 5' should result in 2 mutants" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1LessThanTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(2);
//     }
//     @test "a file with only 'let a = 4 <= 5' should result in 2 mutants" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1LessThanEqualsTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(2);
//     }
//     @test "a file with only 'let greaterthan = 5 > 4' should result in 2 mutants " () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1GreaterThanTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(2);
//     }
//     @test "a file with only 'let greaterthaequalsn = 5 >= 4' should result in 2 mutants " () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1GreaterThanEqualsTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(2);
//     }
//     @test "a file with only 'let equalsequals = false == false' should result in 1 mutant " () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1EqualsEqualsTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(1);
//     }
//     @test "a file with only 'let equalsequals = false == false' should result in 'let equalsequals = false != false'" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1EqualsEqualsTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants[0].getMutatedCode()).to.equal("let equalsequals = false != false;");
//     }
//     @test "a file with only 'let exclamationequals = false != false' should result in 1 mutant " () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1ExclamationEqualsTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(1);
//     }
//     @test "a file with only 'let exclamationsequals = false != false' should result in 'let exclamationequals = false == false'" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1ExclamationEqualsTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants[0].getMutatedCode()).to.equal("let exclamationequals = false == false;");
//     }
//     @test "a file with only 'let equalsequalsequals = false === false' should result in 1 mutant " () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1EqualsEqualsEqualsTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(1);
//     }
//     @test "a file with only 'let equalsequalsequals = false === false' should result in 'let equalsequalsequals = false !== false'" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1EqualsEqualsEqualsTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants[0].getMutatedCode()).to.equal("let equalsequalsequals = false !== false;");
//     }
//     @test "a file with only 'let exclamationequalsequals = false !== false' should result in 1 mutant " () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1ExclamationEqualsEqualsTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(1);
//     }
//     @test "a file with only 'let exclamationequalsequals = false === false' should result in 'let exclamationequalsequals = false === false'" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/binaryExpressionTestFiles/testfileWith1ExclamationEqualsEqualsTokenMutation.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants[0].getMutatedCode()).to.equal("let exclamationequalsequals = false === false;");
//     }
// }