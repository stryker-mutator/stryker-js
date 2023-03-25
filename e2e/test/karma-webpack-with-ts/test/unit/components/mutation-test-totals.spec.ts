import { MutationTestReportTotalsComponent } from '../../../src/components/mutation-test-totals';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { expect } from 'chai';
import { createMetricsResult, createFileResult } from '../helpers/factory';
import { TemplateResult } from 'lit-element';

describe(MutationTestReportTotalsComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportTotalsComponent>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mutation-test-report-totals');
    await sut.whenStable();
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should not show a table if no data is loaded', () => {
    expect(sut.$('table')).eq(null);
  });

  it('should show a table with a single row for a file result', async () => {
    sut.element.model = createMetricsResult({
      file: createFileResult(),
    });
    await sut.whenStable();
    const table = sut.$('table') as HTMLTableElement;
    expect(table).ok;
    expect(table.querySelectorAll('thead th')).lengthOf(12);
    expect(table.querySelectorAll('tbody th, tbody td')).lengthOf(14);
  });

  it('should show a table with a 3 rows for a directory result with 2 directories and one file', async () => {
    const file = createMetricsResult({
      name: 'foo.js',
      file: createFileResult(),
    });
    sut.element.model = createMetricsResult({
      name: 'bar',
      childResults: [file, createMetricsResult({ name: 'baz' })],
    });
    await sut.whenStable();
    const table = sut.$('table') as HTMLTableElement;
    expect(table).ok;
    expect(table.querySelectorAll('tbody tr')).lengthOf(3);
  });

  it('should flatten a row if the directory only has one file', async () => {
    // Arrange
    const file = createMetricsResult({
      name: 'foo.js',
      file: createFileResult(),
    });
    sut.element.model = createMetricsResult({
      name: 'bar',
      childResults: [
        createMetricsResult({
          name: 'baz',
          childResults: [file],
        }),
      ],
    });

    // Act
    await sut.whenStable();

    // Assert
    const table = sut.$('table') as HTMLTableElement;
    expect(table).ok;
    const rows = table.querySelectorAll('tbody tr');
    expect(rows).lengthOf(2);
    expect(((rows.item(1) as HTMLTableRowElement).cells.item(1) as HTMLTableCellElement).textContent).eq('baz/foo.js');
  });

  it('should show N/A when no mutation score is available', async () => {
    sut.element.model = createMetricsResult({
      name: 'foo',
    });

    sut.element.model.metrics.mutationScore = NaN;

    await sut.whenStable();
    const table = sut.$('table') as HTMLTableElement;
    expect(table).ok;
    expect(table.querySelectorAll('td span.font-weight-bold')[0].textContent).contains('N/A');
  });

  it('should show a progress bar when there is a score', async () => {
    sut.element.model = createMetricsResult({
      name: 'foo',
    });
    const mutationScore = 50;

    sut.element.model.metrics.mutationScore = mutationScore;

    await sut.whenStable();
    const table = sut.$('table') as HTMLTableElement;
    expect(table).ok;
    expect(table.querySelectorAll('.progress')[0].textContent).contains(mutationScore);
  });

  it('should show no progress bar when score is NaN', async () => {
    sut.element.model = createMetricsResult({
      name: 'foo',
    });

    sut.element.model.metrics.mutationScore = NaN;

    await sut.whenStable();
    const table = sut.$('table') as HTMLTableElement;
    expect(table).ok;
    expect(table.querySelector('.progress')).null;
  });

  it('should provide a TemplateResult on renderHead()', () => {
    const result: TemplateResult | undefined = sut.element.renderHead();
    expect(result).ok;
  })
});
