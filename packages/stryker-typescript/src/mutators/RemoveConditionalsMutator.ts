import { Location, Range } from "stryker-api/core";
import * as ts from "typescript";
import Mutant from "../Mutant";
import {createLocation, createRange} from "../utils/utilCreator";
import Mutator from "../Mutator";

export default class RemoveConditionalsMutator implements Mutator {
    name: string = "RemoveConditionalsMutator";
    replaceTokens: {[original: number]: string[]} = {
        [ts.SyntaxKind.ConditionalExpression] : ["true", "false"],
        [ts.SyntaxKind.IfStatement] : ["true", "false"],
        [ts.SyntaxKind.WhileStatement] : ["false"],
        [ts.SyntaxKind.DoStatement] : ["false"],
        [ts.SyntaxKind.ForStatement] : ["true", "false"],
    };

    public applyMutation(fileName: string, originalCode: string, node: ts.Node, sourceFile: ts.SourceFile): Mutant[] {
        let condition = this.getExpressionToReplace(node);
        let mutants = new Array<Mutant>();
        let replaceTokens = this.replaceTokens[node.kind];
        for (let replaceToken of replaceTokens){
            let mutant: Mutant = new Mutant(this.name + ` '${replaceToken}'`, fileName, originalCode, replaceToken, createLocation(condition, sourceFile), createRange(condition, sourceFile));
            mutants.push(mutant);
        }
        return mutants;
    }
    private getExpressionToReplace(node: ts.Node) {
        switch (node.kind) {
            case ts.SyntaxKind.ConditionalExpression:
                return (<ts.ConditionalExpression>node).condition;
            case ts.SyntaxKind.IfStatement:
                return (<ts.IfStatement>node).expression;
            case ts.SyntaxKind.WhileStatement:
                return (<ts.WhileStatement>node).expression;
            case ts.SyntaxKind.DoStatement:
                return (<ts.DoStatement>node).expression;
            case ts.SyntaxKind.ForStatement:
                return (<ts.ForStatement>node).condition;
        }
    }
}