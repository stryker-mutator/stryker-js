// import { expect } from "chai";
// import {readFileSync} from "fs";
// import { only, skip, slow, suite, test, timeout } from "mocha-typescript";
// import * as ts from "typescript";
// import Mutant from "../Mutant";
// import { MutatorOrchestrator } from "../MutatorOrchestrator";
// import RemoveConditionalMutator  from "../mutators/RemoveConditionalsMutator";

// @suite class RemoveConditionalMutatorTest {
//     orchestrator: MutatorOrchestrator;
//     constructor() {
//         console.log("Starting 'RemoveConditionalsMutator' tests!");
//     }

//     @test "a file with a conditional expression as 'let x = true ? 1 : 2;' should result in 2 mutants " () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/removeConditionalsTestFiles/testfileWith1ConditionalExpression.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(2);
//     }
//     @test "a file with an if statement like 'if (true) {}' should result in 2 mutants " () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/removeConditionalsTestFiles/testfileWith1IfStatement.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(2);
//     }
//     @test "a file with a while loop like 'while (true) {}' should result in 1 mutant" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/removeConditionalsTestFiles/testfileWith1WhileStatement.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(1);
//     }
//     @test "a file with a while loop like 'while (true) {}' should result in 'while (false) {}' only so it won't create an infinite loop" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/removeConditionalsTestFiles/testfileWith1WhileStatement.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants[0].getMutatedCode()).to.equal("while (false) {}");
//     }
//     @test "a file with a do statment like 'do {} while (true)' should result in 1 mutant" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/removeConditionalsTestFiles/testfileWith1DoStatement.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(1);
//     }
//     @test "a file with a do statement like 'do {} while (true)' should result in 'do {} while (false)' only so it won't create an infinite loop" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/removeConditionalsTestFiles/testfileWith1DoStatement.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants[0].getMutatedCode()).to.equal("do {} while (false)");
//     }
//     @test "a file with a for-loop like 'for (let i = 0; true; 1++) {}' should result in 2 mutants" () {
//         this.orchestrator = new MutatorOrchestrator(["test/files/removeConditionalsTestFiles/testfileWith1ForStatement.ts"]);
//         let mutants: Mutant[] = this.orchestrator.createMutations();
//         expect(mutants.length).to.equal(2);
//     }
// }