import * as _ from 'lodash';
import * as typedHtml from 'typed-html';
import { resultTable } from './resultTable';
import { layout } from './layout';
import { ScoreResult, SourceFile, MutantResult, MutantStatus } from 'stryker-api/report';

export function sourceFile(result: ScoreResult, sourceFile: SourceFile | undefined, mutants: MutantResult[], depth: number) {
    return layout(result.name, depth,
        <div class="col-md-12">
            <div class="row">
                <div class="col-xs-11">
                    {resultTable(result, result.name)}
                </div>
            </div>
            <div class="row">
                <div class="col-sm-6">
                    <a href="#" class="stryker-collapse-expand-all">Expand all</a>
                </div>
                <div class="col-sm-offset-2 col-sm-4">
                    <label>
                        <input class="stryker-display-killed" type="checkbox"></input> Also show killed mutants
            </label>
                </div>
            </div>
            {code(sourceFile, mutants)}
        </div>);
}
function code(sourceFile: SourceFile | undefined, mutants: MutantResult[]) {
    if (sourceFile) {
        return annotateCode(sourceFile, mutants);
    }else {
        return <pre><code>The source code itself was not reported at the `stryker-html-reporter`. Please report this issue at https://github.com/stryker-mutator/stryker/issues</code></pre>;
    }
}

function annotateCode(sourceFile: SourceFile, mutants: MutantResult[]) {
    const currentCursorMutantStatuses = {
        killed: 0,
        survived: 0,
        timeout: 0,
        noCoverage: 0
    };
    const maxIndex = sourceFile.content.length - 1;
    const numberedMutants = _
        .sortBy(mutants, m => m.range[0] * 10000 + m.range[1] * -1)
        .map((mutant, index) => ({ mutant, index }));

    const adjustCurrentMutantResult = (valueToAdd: number) => (numberedMutant: { mutant: MutantResult, index: number }) => {
        switch (numberedMutant.mutant.status) {
            case MutantStatus.Killed:
                currentCursorMutantStatuses.killed += valueToAdd;
                break;
            case MutantStatus.Survived:
                currentCursorMutantStatuses.survived += valueToAdd;
                break;
            case MutantStatus.TimedOut:
                currentCursorMutantStatuses.timeout += valueToAdd;
                break;
            case MutantStatus.NoCoverage:
                currentCursorMutantStatuses.noCoverage += valueToAdd;
                break;
        }
    };

    const determineBackground = () => {
        if (currentCursorMutantStatuses.survived > 0) {
            return getContextClassForStatus(MutantStatus.Survived);
        } else if (currentCursorMutantStatuses.noCoverage > 0) {
            return getContextClassForStatus(MutantStatus.NoCoverage);
        } else if (currentCursorMutantStatuses.timeout > 0) {
            return getContextClassForStatus(MutantStatus.TimedOut);
        } else if (currentCursorMutantStatuses.killed > 0) {
            return getContextClassForStatus(MutantStatus.Killed);
        }
        return null;
    };

    const annotate = (char: string, index: number) => {
        const mutantsStarting = numberedMutants.filter(m => m.mutant.range[0] === index);
        const mutantsEnding = numberedMutants.filter(m => m.mutant.range[1] === index);
        mutantsStarting.forEach(adjustCurrentMutantResult(1));
        mutantsEnding.forEach(adjustCurrentMutantResult(-1));
        const backgroundColorAnnotation = mutantsStarting.length || mutantsEnding.length || index === 0 ? `<span class="bg-${determineBackground()}">` : '';
        const backgroundColorEndAnnotation = ((mutantsStarting.length || mutantsEnding.length) && index > 0) || index === maxIndex ? '</span>' : '';
        try {
            const mutantsAnnotations = mutantsStarting.map(m =>
                <a href="#" class="stryker-mutant-button" data-mutant-status-annotation={getContextClassForStatus(m.mutant.status)} data-mutant={m.index}>
                    <span class={`label label-${getContextClassForStatus(m.mutant.status)}`}>{m.index}</span>
                </a>
                + <span class="label label-info stryker-mutant-replacement" hidden="hidden" data-mutant={m.index}>{escapeHtml(m.mutant.replacement)}</span>);
            const originalCodeStartAnnotations = mutantsStarting.map(m => `<span class="stryker-original-code" data-mutant="${m.index}">`);
            const originalCodeEndAnnotations = mutantsEnding.map(m => '</span>');

            return `${backgroundColorEndAnnotation}${originalCodeEndAnnotations.join('')}${mutantsAnnotations.join('')}${originalCodeStartAnnotations.join('')}${backgroundColorAnnotation}${escapeHtml(char)}`;
        } catch (err) {
            console.log(err);
        }
    };
    return <pre><code class="lang-javascript">{mapString(sourceFile.content, annotate).join('')}</code></pre>;
}


function escapeHtml(unsafe: string) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


function getContextClassForStatus(status: MutantStatus) {
    switch (status) {
        case MutantStatus.Killed:
            return 'success';
        case MutantStatus.NoCoverage:
        case MutantStatus.Survived:
            return 'danger';
        case MutantStatus.TimedOut:
        case MutantStatus.Error:
            return 'warning';
    }
}


/**
 * A `map` function, as in [1, 2].map(i => i+1), but for a string 
 */
function mapString<T>(source: string, fn: (char: string, index?: number) => T): T[] {
    let results: T[] = [];
    for (let i = 0; i < source.length; i++) {
        results.push(fn(source[i], i));
    }
    return results;
}
