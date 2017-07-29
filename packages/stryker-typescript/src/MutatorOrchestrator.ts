import {readFileSync} from "fs";
import * as ts from "typescript";
import Mutant from "./Mutant";
import BinaryExpressionMutator from "./mutators/BinaryExpressionMutator";
import RemoveConditionalsMutator from "./mutators/RemoveConditionalsMutator";
import MemoryCompilerHost from "./MemoryCompilerHost";

export class MutatorOrchestrator {
    private binaryExpressionMutator: BinaryExpressionMutator;
    private removeConditionalsMutator: RemoveConditionalsMutator;
    private scriptTarget: ts.ScriptTarget = ts.ScriptTarget.ES5;
    private mutants: Mutant[];
    private invalidMutants: Mutant[];
    private sourceFiles: ts.SourceFile[] = [];
    private host: MemoryCompilerHost;
    private languageService: ts.LanguageService;
    private program: ts.Program;
    private compilerOptions: ts.CompilerOptions = {noEmitOnError: true, target: ts.ScriptTarget.ES5, noImplicitAny: true, module: ts.ModuleKind.CommonJS, allowJs: false, moduleResolution: ts.ModuleResolutionKind.NodeJs};

    constructor(private sourceFilePaths: string[]) {
        console.log("MutatorOrchestrator reporting for duty!");
        this.mutants = new Array<Mutant>();
        this.invalidMutants = new Array<Mutant>();
        this.binaryExpressionMutator = new BinaryExpressionMutator();
        this.removeConditionalsMutator = new RemoveConditionalsMutator();
        this.host = new MemoryCompilerHost(this.compilerOptions, sourceFilePaths);
        this.includeDefaultLibFile();
        console.log(`Found ${this.sourceFilePaths.length} file(s) to mutate`);
        this.changeFilePathsToAbsolutePath();
        this.getCompilerOptions();
        if(this.compilerOptions) {
            for (let filePath of this.sourceFilePaths){
                const file = readFileSync(filePath);
                let sourceFile = ts.createSourceFile(filePath, file.toString(), this.compilerOptions.target, false, ts.ScriptKind.TS);
                this.sourceFiles.push(sourceFile);
                this.host.addFile(filePath, file.toString());
                this.host.addFileToOriginalFiles(filePath, file.toString());
            }
            this.program = ts.createProgram(this.sourceFilePaths, this.compilerOptions, this.host);
        } else {
            console.log("We were unable to find the typescript configuration file. Did you include the right path to tsconfig.json in the options?")
        }
    }

    public createMutations(): Mutant[] {
        if(this.compilerOptions){
            // see if initial program compiles
            // if this is not the case, return false. Generating mutant for an uncompiling project would be unnecessary.
            if(this.compileInitialProgram()){
                console.log("Beginning mutating");
                if (this.sourceFiles.length > 0 ) {
                    for(let i = 0; i < this.sourceFiles.length; i++){
                        let file = this.sourceFiles[i];
                        this.checkNodeForMutants(file, file.fileName, file, i);
                    }
                    console.log(`Done mutating! Generated ${this.mutants.length} valid mutant(s)! Generated ${this.invalidMutants.length} invalid mutant(s).. These will not affect mutation score.`);
                    this.logMutants();
                    return this.mutants;
                } else {
                    console.log("No files to mutate.");
                    return [];
                }
            } else {
                console.log("Program doesn't compile! Fix any compile errors before mutation testing...");
                return [];
            }
        } else {
            return [];
        }
    }
    private checkNodeForMutants(node: ts.Node, fileName: string, sourceFile: ts.SourceFile, index: number) {
        if (node.getChildCount(sourceFile) > 0) {
            node.getChildren(sourceFile).forEach((innerNode) => {
                let mutants: Mutant[];
                switch (innerNode.kind) {
                    case ts.SyntaxKind.BinaryExpression:
                        mutants = this.binaryExpressionMutator.applyMutation(fileName, sourceFile.getFullText(), innerNode, sourceFile);
                    break;
                    case ts.SyntaxKind.IfStatement: // fall through
                    case ts.SyntaxKind.WhileStatement: // fall through
                    case ts.SyntaxKind.DoStatement: // fall through
                    case ts.SyntaxKind.ForStatement: // fall through
                    case ts.SyntaxKind.ConditionalExpression:
                        mutants = this.removeConditionalsMutator.applyMutation(fileName, sourceFile.getFullText(), innerNode, sourceFile);
                    break;
                    default:

                    break;
                }
                if (mutants) {
                    for (let mutant of mutants) {
                        if (this.getCompilationResult(mutant, index)) {
                            this.mutants.push(mutant);
                        } else {
                            this.invalidMutants.push(mutant);
                        }
                    }
                }
                if (innerNode.getChildCount(sourceFile) > 0) {
                    this.checkNodeForMutants(innerNode, fileName, sourceFile, index);
                }
            });
        }
    }
    
    private getCompilationResult(mutant: Mutant, index: number): boolean {
        // reset to original program
        this.host.resetToOriginalFiles();
        // insert mutant in program
        this.host.addFile(this.sourceFilePaths[index], mutant.getMutatedCode());
        this.program = ts.createProgram(this.sourceFilePaths, this.host.getCompilationSettings(), this.host, this.program);
        let emitResult = this.program.emit();
        let diagnostics = emitResult.diagnostics;
        diagnostics.forEach(diagnostic => {
            console.log(diagnostic.file.fileName + " " +diagnostic.start.toPrecision() + ": " +  ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
        });
        console.log(`Emitting mutated version of '${this.sourceFilePaths[index]}' containing ${mutant.mutatorName}... EmitSkipped: ${emitResult.emitSkipped}`);
        return emitResult.emitSkipped ? false : true;
    }

    private includeDefaultLibFile(){
        // File necessary for compilation
        let libFile = readFileSync(this.host.getDefaultLibFileLocation());
        this.host.addFile("lib.d.ts", libFile.toString());
        this.host.addFileToOriginalFiles("lib.d.ts", libFile.toString());
    }

   /* private includeDefaultNodeFile() {
        // File necessary for node functions
        let nodeFile = readFileSync("./node_modules/@types/node/index.d.ts");
        this.host.addFile("/Users/thomaspeters/Desktop/is-thomaspe/node_modules/@types/node/index.d.ts", nodeFile.toString()); 
        this.host.addFileToOriginalFiles("/Users/thomaspeters/Desktop/is-thomaspe/node_modules/@types/node/index.d.ts", nodeFile.toString());
    }*/
    private changeFilePathsToAbsolutePath(){
        let compilerHost = ts.createCompilerHost(this.compilerOptions);
        for(let i = 0; i < this.sourceFilePaths.length; i++){
            this.sourceFilePaths[i] = compilerHost.realpath(this.sourceFilePaths[i]);
        }
    }

    private getCompilerOptions(){
        console.log("Looking for typescript configuration file");
        let result: any | ts.Diagnostic = ts.readConfigFile("tsconfig.json", () => readFileSync("./tsconfig.json").toString());
        if(result.config) {
            this.compilerOptions = result.config;
        } else {
            this.compilerOptions = undefined;
        }
    }

    private compileInitialProgram(): boolean {
        let emitResult = this.program.emit();
        if(emitResult.emitSkipped) {
            let diagnostics = emitResult.diagnostics;
            diagnostics.forEach(diagnostic => {
                console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
            });
        } else {
            console.log("Initial program compiles!");
        }
        return !emitResult.emitSkipped // reversie value because emitSkipped == true is the bad situation 
    }

    private logMutants() {
        for (let mutant of this.mutants) {
              //console.log(`File: ${mutant.filename} at ${mutant.location.start.line}:${mutant.location.start.column}\nMutator: ${mutant.mutatorName}`);
        }
    }
}