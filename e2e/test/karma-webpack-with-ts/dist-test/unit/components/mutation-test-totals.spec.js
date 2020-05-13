"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mutation_test_totals_1 = require("../../../src/components/mutation-test-totals");
const CustomElementFixture_1 = require("../helpers/CustomElementFixture");
const chai_1 = require("chai");
const factory_1 = require("../helpers/factory");
describe(mutation_test_totals_1.MutationTestReportTotalsComponent.name, () => {
    let sut;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        sut = new CustomElementFixture_1.CustomElementFixture('mutation-test-report-totals');
        yield sut.whenStable();
    }));
    afterEach(() => {
        sut.dispose();
    });
    it('should not show a table if no data is loaded', () => {
        chai_1.expect(sut.$('table')).eq(null);
    });
    it('should show a table with a single row for a file result', () => __awaiter(void 0, void 0, void 0, function* () {
        sut.element.model = factory_1.createMetricsResult({
            file: factory_1.createFileResult(),
        });
        yield sut.whenStable();
        const table = sut.$('table');
        chai_1.expect(table).ok;
        chai_1.expect(table.querySelectorAll('thead th')).lengthOf(12);
        chai_1.expect(table.querySelectorAll('tbody th, tbody td')).lengthOf(14);
    }));
    it('should show a table with a 3 rows for a directory result with 2 directories and one file', () => __awaiter(void 0, void 0, void 0, function* () {
        const file = factory_1.createMetricsResult({
            name: 'foo.js',
            file: factory_1.createFileResult(),
        });
        sut.element.model = factory_1.createMetricsResult({
            name: 'bar',
            childResults: [file, factory_1.createMetricsResult({ name: 'baz' })],
        });
        yield sut.whenStable();
        const table = sut.$('table');
        chai_1.expect(table).ok;
        chai_1.expect(table.querySelectorAll('tbody tr')).lengthOf(3);
    }));
    it('should flatten a row if the directory only has one file', () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const file = factory_1.createMetricsResult({
            name: 'foo.js',
            file: factory_1.createFileResult(),
        });
        sut.element.model = factory_1.createMetricsResult({
            name: 'bar',
            childResults: [
                factory_1.createMetricsResult({
                    name: 'baz',
                    childResults: [file],
                }),
            ],
        });
        // Act
        yield sut.whenStable();
        // Assert
        const table = sut.$('table');
        chai_1.expect(table).ok;
        const rows = table.querySelectorAll('tbody tr');
        chai_1.expect(rows).lengthOf(2);
        chai_1.expect(rows.item(1).cells.item(1).textContent).eq('baz/foo.js');
    }));
    it('should show N/A when no mutation score is available', () => __awaiter(void 0, void 0, void 0, function* () {
        sut.element.model = factory_1.createMetricsResult({
            name: 'foo',
        });
        sut.element.model.metrics.mutationScore = NaN;
        yield sut.whenStable();
        const table = sut.$('table');
        chai_1.expect(table).ok;
        chai_1.expect(table.querySelectorAll('td span.font-weight-bold')[0].textContent).contains('N/A');
    }));
    it('should show a progress bar when there is a score', () => __awaiter(void 0, void 0, void 0, function* () {
        sut.element.model = factory_1.createMetricsResult({
            name: 'foo',
        });
        const mutationScore = 50;
        sut.element.model.metrics.mutationScore = mutationScore;
        yield sut.whenStable();
        const table = sut.$('table');
        chai_1.expect(table).ok;
        chai_1.expect(table.querySelectorAll('.progress')[0].textContent).contains(mutationScore);
    }));
    it('should show no progress bar when score is NaN', () => __awaiter(void 0, void 0, void 0, function* () {
        sut.element.model = factory_1.createMetricsResult({
            name: 'foo',
        });
        sut.element.model.metrics.mutationScore = NaN;
        yield sut.whenStable();
        const table = sut.$('table');
        chai_1.expect(table).ok;
        chai_1.expect(table.querySelector('.progress')).null;
    }));
});
//# sourceMappingURL=mutation-test-totals.spec.js.map