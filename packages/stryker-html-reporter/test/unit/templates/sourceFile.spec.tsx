import { expect } from 'chai';
import { sourceFile } from '../../../src/templates/sourceFile';
import * as producers from '../../helpers/producers';
import Breadcrumb from '../../../src/Breadcrumb';
import * as htmlHelpers from '../../helpers/htmlHelpers';


describe('sourceFile template', () => {


    it('should sort mutant table on range location', () => {
        const mutants = [
            producers.mutantResult({ mutatorName: 'second', range: [4, 5] }),
            producers.mutantResult({ mutatorName: 'first', range: [1, 2] }) // sorted as first mutant
        ];
        const actual = sourceFile(
            producers.scoreResult(),
            producers.sourceFile(),
            mutants,
            Breadcrumb.start,
            producers.thresholds());

        const mutantRows = htmlHelpers.selectAllText(actual, '.mutant-table tbody tr');
        expect(mutantRows[0]).contain('first');
        expect(mutantRows[1]).contain('second');
    });

    it('should sort mutants in code on range location', () => {
        const mutants = [
            producers.mutantResult({ mutatorName: 'second', range: [4, 5] }),
            producers.mutantResult({ mutatorName: 'first', range: [1, 2] }) // sorted as first mutant
        ];
        const actual = sourceFile(
            producers.scoreResult(),
            producers.sourceFile(),
            mutants,
            Breadcrumb.start,
            producers.thresholds());

        const mutantButtons = htmlHelpers.selectAll(actual, '.stryker-mutant-button');
        expect(mutantButtons).lengthOf(2);
        expect(mutantButtons[0].title).eq('first');
        expect(mutantButtons[1].title).eq('second');
    });
});