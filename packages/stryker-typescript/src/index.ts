import {MutatorOrchestrator} from "./MutatorOrchestrator";
let files: string[] = [ "HelloWorld.ts", "calculator.ts"]; 
let orchestrator = new MutatorOrchestrator(files);
let mutants = orchestrator.createMutations(); 