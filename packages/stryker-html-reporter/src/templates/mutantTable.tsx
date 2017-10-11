import * as typedHtml from 'typed-html';
import { MutantResult, MutantStatus } from 'stryker-api/report';

export function mutantTable(mutants: MutantResult[], sourceCode: string) {

    return <table class="table table-sm table-hover">
        <thead>
            <tr>
                <th>#</th>
                <th>Mutator</th>
                <th>State</th>
                <th>Location</th>
                <th>Original</th>
                <th>Replacement</th>
            </tr>
        </thead>
        <tbody>
            {mutants.map(row(sourceCode))}
        </tbody>
    </table>;
}

function row(sourceCode: string) {
    return (mutant: MutantResult, index: number) => {
        return <tr>
            <th>{index}</th>
            <td>{mutant.mutatorName}</td>
            <td>{MutantStatus[mutant.status]}</td>
            <td>{mutant.location.start.line}:{mutant.location.start.column}</td>
            <td><code>{shorten(sourceCode.substring(mutant.range[0], mutant.range[1]))}</code></td>
            <td><code>{shorten(mutant.replacement)}</code></td>
        </tr>;
    };
}

function shorten(input: string) {
    input = input.replace(/\w/g, ' ').trim();
    if (input.length > 15) {
        return `${input.substr(0, 5)}...${input.substr(input.length - 5)}`;
    } else {
        return input;
    }
}