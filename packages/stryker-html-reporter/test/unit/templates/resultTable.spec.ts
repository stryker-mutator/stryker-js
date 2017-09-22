import { expect } from 'chai';
import { resultTable } from '../../../src/templates/resultTable';
import { scoreResult } from '../../helpers/producers';

describe('resultTable', () => {
  it('should color the progress bar and mutation score text according to the given thresholds', () => {
    const actualTable = resultTable(scoreResult({
      name: 'name-70.01', mutationScore: 70.01, totalMutants: 0, childResults: [
        scoreResult({ name: 'name-70', mutationScore: 70, totalMutants: 1 }),
        scoreResult({ name: 'name-69.99', mutationScore: 69.99, totalMutants: 2 }),
        scoreResult({ name: 'name-60.01', mutationScore: 60.01, totalMutants: 3 }),
        scoreResult({ name: 'name-60', mutationScore: 60, totalMutants: 4 }),
        scoreResult({ name: 'name-59.99', mutationScore: 59.99, totalMutants: 5 })
      ]
    }), 'name-70.01', { high: 70, low: 60, break: null });
    
    expect(actualTable).matches(/name-70\.01(?:.|\n|\r)*bg-success(?:.|\n|\r)*text-success(?:.|\n|\r)*70\.01(?:.|\n|\r)*<th class="text-center">0<\/th><\/tr>/g);
    expect(actualTable).matches(/name-70(?:.|\n|\r)*bg-success(?:.|\n|\r)*text-success(?:.|\n|\r)*70\.00(?:.|\n|\r)*<th class="text-center">1<\/th><\/tr>/g);
    expect(actualTable).matches(/name-69\.99(?:.|\n|\r)*bg-warning(?:.|\n|\r)*text-warning(?:.|\n|\r)*69\.99(?:.|\n|\r)*<th class="text-center">2<\/th><\/tr>/g);
    expect(actualTable).matches(/name-60(?:.|\n|\r)*bg-warning(?:.|\n|\r)*text-warning(?:.|\n|\r)*60\.00(?:.|\n|\r)*<th class="text-center">4<\/th><\/tr>/g);
    expect(actualTable).matches(/name-59\.99(?:.|\n|\r)*bg-danger(?:.|\n|\r)*text-danger(?:.|\n|\r)*59\.99(?:.|\n|\r)*<th class="text-center">5<\/th><\/tr>/g);
  });
});