import { MutationScoreThresholds } from 'stryker-api/core';
import { ScoreResult } from 'stryker-api/report';
import * as typedHtml from 'typed-html';
import Breadcrumb from '../Breadcrumb';
import { layout } from './layout';
import { resultTable } from './resultTable';

export function directory(scoreResult: ScoreResult, breadcrumb: Breadcrumb, thresholds: MutationScoreThresholds) {
  return layout(breadcrumb, <div class='col-lg-12'>
    <div class='row'>
      <div class='totals col-sm-11'>
        {resultTable(scoreResult, breadcrumb.title, thresholds)}
      </div>
    </div>
  </div>);
}
