import { Location, Range } from "stryker-api/core";
import * as ts from "typescript";
import Mutant from "../Mutant";
import {createLocation, createRange} from "../utils/utilCreator";
import Mutator from "../Mutator";

export default class BinaryExpressionMutator implements Mutator {
    name: string = "BinaryExpressionMutator";
    replaceTokens: {[original: number]: string[]} = {
        [ts.SyntaxKind.PlusToken] : ["-"],
        [ts.SyntaxKind.MinusToken] : ["+"],
        [ts.SyntaxKind.SlashToken] : ["*"],
        [ts.SyntaxKind.AsteriskToken] : ["/"],
        [ts.SyntaxKind.PercentToken] : ["*"],
        [ts.SyntaxKind.LessThanToken] : ["<=", ">="],
        [ts.SyntaxKind.LessThanEqualsToken] : ["<", ">"],
        [ts.SyntaxKind.GreaterThanToken] : [">=", "<="],
        [ts.SyntaxKind.GreaterThanEqualsToken] : [">", "<"],
        [ts.SyntaxKind.EqualsEqualsToken] : ["!="],
        [ts.SyntaxKind.ExclamationEqualsToken] : ["=="],
        [ts.SyntaxKind.EqualsEqualsEqualsToken] : ["!=="],
        [ts.SyntaxKind.ExclamationEqualsEqualsToken] : ["==="],
    };

    applyMutation(fileName: string, originalCode: string, node: ts.Node, sourceFile: ts.SourceFile): Mutant[] {
        let binaryExpression = (<ts.BinaryExpression>node);
        let replaceWith: string[] = this.replaceTokens[(<ts.BinaryExpression>node).operatorToken.kind];
        let mutants = new Array<Mutant>();
        if (replaceWith) {
            for (let replacement of replaceWith) {
                let mutant: Mutant = new Mutant(this.name + ` (${replacement})`, fileName, originalCode, replacement, createLocation(binaryExpression.operatorToken, sourceFile), createRange(binaryExpression.operatorToken, sourceFile));
                mutants.push(mutant);
            }
            return mutants;
        } else {
            return [];
        }
    }
}