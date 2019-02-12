import * as typedHtml from 'typed-html';
import { ScoreResult } from '@stryker-mutator/api/report';
import { MutationScoreThresholds } from '@stryker-mutator/api/core';
import { resultTable } from './resultTable';
import { layout } from './layout';
import Breadcrumb from '../Breadcrumb';

export function directory(scoreResult: ScoreResult, breadcrumb: Breadcrumb, thresholds: MutationScoreThresholds) {
    return layout(breadcrumb, <div class='col-lg-12'>
        <div class='row'>
            <div class='totals col-sm-11'>
                {resultTable(scoreResult, breadcrumb.title, thresholds)}
            </div>
        </div>
    </div>);
}
