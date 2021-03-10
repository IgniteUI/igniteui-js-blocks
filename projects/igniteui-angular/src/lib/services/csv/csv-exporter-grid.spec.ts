import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxGridModule } from '../../grids/grid/public_api';
import { IgxGridComponent } from '../../grids/grid/grid.component';
import { IColumnExportingEventArgs, IRowExportingEventArgs } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { TestMethods } from '../exporter-common/test-methods.spec';
import { IgxCsvExporterService } from './csv-exporter';
import { CsvFileTypes, IgxCsvExporterOptions } from './csv-exporter-options';
import { CSVWrapper } from './csv-verification-wrapper.spec';
import { IgxTreeGridPrimaryForeignKeyComponent } from '../../test-utils/tree-grid-components.spec';
import { IgxTreeGridModule, IgxTreeGridComponent } from '../../grids/tree-grid/public_api';
import { ReorderedColumnsComponent, GridIDNameJobTitleComponent, ProductsComponent } from '../../test-utils/grid-samples.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { first } from 'rxjs/operators';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxStringFilteringOperand, IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { wait } from '../../test-utils/ui-interactions.spec';

describe('CSV Grid Exporter', () => {
    configureTestSuite();
    let exporter: IgxCsvExporterService;
    let options: IgxCsvExporterOptions;
    const data = SampleTestData.personJobData();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                ReorderedColumnsComponent,
                GridIDNameJobTitleComponent,
                IgxTreeGridPrimaryForeignKeyComponent,
                ProductsComponent
            ],
            imports: [IgxGridModule, IgxTreeGridModule, NoopAnimationsModule]
        })
            .compileComponents();
    }));

    beforeEach(waitForAsync(() => {
        exporter = new IgxCsvExporterService();
        options = new IgxCsvExporterOptions('CsvGridExport', CsvFileTypes.CSV);

        // Spy the saveBlobToFile method so the files are not really created
        spyOn(ExportUtilities as any, 'saveBlobToFile');
    }));

    afterEach(waitForAsync(() => {
        exporter.columnExporting.unsubscribe();
        exporter.rowExporting.unsubscribe();
    }));

    it('should export grid as displayed.', async () => {
        const currentGrid: IgxGridComponent = null;

        await TestMethods.testRawData(currentGrid, async (grid) => {
            const wrapper = await getExportedData(grid, options);
            wrapper.verifyData(wrapper.simpleGridData);
        });
    });

    it('should honor \'ignoreFiltering\' option.', async () => {

        const result = await TestMethods.createGridAndFilter();
        const fix = result.fixture;
        const grid = result.grid;

        options = new IgxCsvExporterOptions('TestCsv', CsvFileTypes.CSV);
        options.ignoreFiltering = false;
        fix.detectChanges();

        let wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.gridOneSeniorDev, 'One row only should have been exported!');

        options.ignoreFiltering = true;
        fix.detectChanges();
        wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.simpleGridData, 'All 10 rows should have been exported!');
    });

    it('should honor filter criteria changes.', async () => {

        const result = await TestMethods.createGridAndFilter();
        const fix = result.fixture;
        const grid = result.grid;

        expect(grid.rowList.length).toEqual(1);

        let wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.gridOneSeniorDev, 'One row should have been exported!');

        grid.filter('JobTitle', 'Director', IgxStringFilteringOperand.instance().condition('equals'), true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(2, 'Invalid number of rows after filtering!');
        wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.gridTwoDirectors, 'Two rows should have been exported!');
    });

    it('should honor \'ignoreColumnsVisibility\' option.', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.columns[0].hidden = true;
        options.ignoreColumnsVisibility = false;

        fix.detectChanges();
        expect(grid.visibleColumns.length).toEqual(2, 'Invalid number of visible columns!');
        let wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.gridNameJobTitle, 'Two columns data should have been exported!');

        options.ignoreColumnsVisibility = true;
        fix.detectChanges();
        wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.simpleGridData, 'All three columns data should have been exported!');
    });

    it('should honor columns visibility changes.', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.ignoreColumnsOrder = true;
        fix.detectChanges();

        expect(grid.visibleColumns.length).toEqual(3, 'Invalid number of visible columns!');
        let wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.simpleGridData, 'All columns data should have been exported!');

        grid.columns[0].hidden = true;
        fix.detectChanges();
        expect(grid.visibleColumns.length).toEqual(2, 'Invalid number of visible columns!');
        wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.gridNameJobTitle, 'Two columns data should have been exported!');

        grid.columns[0].hidden = false;
        fix.detectChanges();
        expect(grid.visibleColumns.length).toEqual(3, 'Invalid number of visible columns!');
        wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.simpleGridData, 'All columns data should have been exported!');

        grid.columns[0].hidden = undefined;
        fix.detectChanges();
        expect(grid.visibleColumns.length).toEqual(3, 'Invalid number of visible columns!');
        wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.simpleGridData, 'All columns data should have been exported!');
    });

    it('should honor columns declaration order.', async () => {
        const fix = TestBed.createComponent(ReorderedColumnsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;

        const wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.gridNameJobTitleID);
    });

    it('should honor applied sorting.', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        grid.sort({fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: true});
        fix.detectChanges();

        const wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.sortedSimpleGridData);
    });

    it('should honor changes in applied sorting.', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.sort({fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: true});
        fix.detectChanges();
        let wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.sortedSimpleGridData);

        grid.sort({fieldName: 'Name', dir: SortingDirection.Desc, ignoreCase: true});
        fix.detectChanges();
        wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.sortedDescSimpleGridData);

        grid.clearSort();
        grid.sort({fieldName: 'ID', dir: SortingDirection.Asc, ignoreCase: true});
        fix.detectChanges();
        wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.simpleGridData);
    });

    it('should display pinned columns data in the beginning.', async () => {
        const result = await TestMethods.createGridAndPinColumn([1]);
        const fix = result.fixture;
        const grid = result.grid;
        fix.detectChanges();

        const wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.gridNameIDJobTitle, 'Name should have been the first field!');
    });

    it('should not display pinned columns data first when ignoreColumnsOrder is true.', async () => {
        const result = await TestMethods.createGridAndPinColumn([1]);
        const fix = result.fixture;
        const grid = result.grid;
        options.ignoreColumnsOrder = true;

        fix.detectChanges();
        const wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.simpleGridData, 'Name should not have been the first field!');
    });

    it('should fire \'columnExporting\' for each grid column.', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const cols = [];

        exporter.columnExporting.subscribe((value) => {
            cols.push({ header: value.header, index: value.columnIndex });
        });

        const wrapper = await getExportedData(grid, options);
        expect(cols.length).toBe(3);
        expect(cols[0].header).toBe('ID');
        expect(cols[0].index).toBe(0);
        expect(cols[1].header).toBe('Name');
        expect(cols[1].index).toBe(1);
        expect(cols[2].header).toBe('JobTitle');
        expect(cols[2].index).toBe(2);
        wrapper.verifyData(wrapper.simpleGridData);
    });

    it('should fire \'columnExporting\' for each visible grid column.', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const cols = [];

        exporter.columnExporting.subscribe((value) => {
            cols.push({ header: value.header, index: value.columnIndex });
        });

        grid.columns[0].hidden = true;
        options.ignoreColumnsVisibility = false;
        fix.detectChanges();

        const wrapper = await getExportedData(grid, options);
        expect(cols.length).toBe(2);
        expect(cols[0].header).toBe('Name');
        expect(cols[0].index).toBe(0);
        expect(cols[1].header).toBe('JobTitle');
        expect(cols[1].index).toBe(1);
        wrapper.verifyData(wrapper.gridNameJobTitle);
    });

    it('should not export columns when \'columnExporting\' is canceled.', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        exporter.columnExporting.subscribe((value: IColumnExportingEventArgs) => {
            value.cancel = true;
        });

        const wrapper = await getExportedData(grid, options);
        wrapper.verifyData('');
    });

    it('should fire \'rowExporting\' for each grid row.', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const rows = [];

        exporter.rowExporting.subscribe((value: IRowExportingEventArgs) => {
            rows.push({ data: value.rowData, index: value.rowIndex });
        });

        await getExportedData(grid, options);

        expect(rows.length).toBe(10);
        for (let i = 0; i < rows.length; i++) {
            expect(rows[i].index).toBe(i);
            expect(JSON.stringify(rows[i].data)).toBe(JSON.stringify(data[i]));
        }
    });

    it('should not export rows when \'rowExporting\' is canceled.', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;

        exporter.rowExporting.subscribe((value: IRowExportingEventArgs) => {
            value.cancel = true;
        });

        const wrapper = await getExportedData(grid, options);
        wrapper.verifyData('');
    });

    it('should skip column formatter when \'onColunmExporting\' skipFormatter is true', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.columns[1].formatter = ((val: string) => val.toUpperCase());
        grid.columns[2].formatter = ((val: string) => val.toLowerCase());
        grid.cdr.detectChanges();

        let wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.simpleGridDataFormatted, 'Columns\' formatter should not be skipped.');

        exporter.columnExporting.subscribe((val: IColumnExportingEventArgs) => {
            val.skipFormatter = true;
        });
        grid.cdr.detectChanges();
        wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.simpleGridData, 'Columns formatter should be skipped.');

        exporter.columnExporting.subscribe((val: IColumnExportingEventArgs) => {
            val.skipFormatter = false;
        });
        grid.cdr.detectChanges();
        wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.simpleGridDataFormatted, 'Columns\' formatter should not be skipped.');
    });

    it('Should honor the Advanced filters when exporting', async () => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const tree = new FilteringExpressionsTree(FilteringLogic.And);
        tree.filteringOperands.push({
            fieldName: 'Name',
            searchVal: 'a',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            ignoreCase: true
        });
        tree.filteringOperands.push({
            fieldName: 'Name',
            searchVal: 'r',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            ignoreCase: true
        });
        tree.filteringOperands.push({
            fieldName: 'ID',
            searchVal: 5,
            condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
        });

        grid.advancedFilteringExpressionsTree = tree;
        fix.detectChanges();

        expect(grid.filteredData.length).toBe(4);
        const wrapper = await getExportedData(grid, options);
        wrapper.verifyData(wrapper.gridWithAdvancedFilters, 'Should export only filtered data.');
    });

    describe('', () => {
        let fix;
        let treeGrid: IgxTreeGridComponent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
        }));

        it('should export tree grid as displayed.', async () => {
            const wrapper = await getExportedData(treeGrid, options);
            wrapper.verifyData(wrapper.treeGridData);
        });

        it('should export sorted tree grid properly.', async () => {
            treeGrid.sort({fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: true, strategy: DefaultSortingStrategy.instance()});
            options.ignoreSorting = true;
            fix.detectChanges();

            let wrapper = await getExportedData(treeGrid, options);
            wrapper.verifyData(wrapper.treeGridData);

            options.ignoreSorting = false;

            wrapper = await getExportedData(treeGrid, options);
            wrapper.verifyData(wrapper.treeGridDataSorted);

            treeGrid.clearSort();
            fix.detectChanges();

            wrapper = await getExportedData(treeGrid, options);
            wrapper.verifyData(wrapper.treeGridData);
        });

        it('should export filtered tree grid properly.', async () => {
            treeGrid.filter('ID', 3, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            options.ignoreFiltering = true;
            fix.detectChanges();

            let wrapper = await getExportedData(treeGrid, options);
            wrapper.verifyData(wrapper.treeGridData);

            options.ignoreFiltering = false;

            wrapper = await getExportedData(treeGrid, options);
            wrapper.verifyData(wrapper.treeGridDataFiltered);

            treeGrid.clearFilter();
            fix.detectChanges();

            wrapper = await getExportedData(treeGrid, options);
            wrapper.verifyData(wrapper.treeGridData);
        });

        it('should export filtered and sorted tree grid properly.', async () => {
            treeGrid.filter('ID', 3, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();
            treeGrid.sort({fieldName: 'Name', dir: SortingDirection.Desc, ignoreCase: true, strategy: DefaultSortingStrategy.instance()});
            fix.detectChanges();

            const wrapper = await getExportedData(treeGrid, options);
            wrapper.verifyData(wrapper.treeGridDataFilterSorted);
        });

        it('should fire \'rowExporting\' for each tree grid row.', async () => {
            const rows = [];

            exporter.rowExporting.subscribe((value: IRowExportingEventArgs) => {
                rows.push({ data: value.rowData, index: value.rowIndex });
            });

            await getExportedData(treeGrid, options);

            expect(rows.length).toBe(8);
            for (let i = 0; i < rows.length; i++) {
                expect(rows[i].index).toBe(i);
                expect(JSON.stringify(rows[i].data)).toBe(JSON.stringify(SampleTestData.employeeTreeDataDisplayOrder()[i]));
            }
        });

        it('should skip the column formatter when columnExportinging skipFormatter is true.', async () => {
            treeGrid.columns[3].formatter = ((val: string) => val.toLowerCase());
            treeGrid.columns[4].formatter = ((val: number) =>
                 val * 12 // months
            );
            treeGrid.cdr.detectChanges();
            let wrapper = await getExportedData(treeGrid, options);
            wrapper.verifyData(wrapper.treeGridDataFormatted, 'Columns\' formatter should be applied.');

            exporter.columnExporting.subscribe((val: IColumnExportingEventArgs) => {
                val.skipFormatter = true;
            });
            wrapper = await getExportedData(treeGrid, options);
            wrapper.verifyData(wrapper.treeGridData, 'Columns\' formatter should be skipped.');

            exporter.columnExporting.subscribe((val: IColumnExportingEventArgs) => {
                val.skipFormatter = false;
            });
            wrapper = await getExportedData(treeGrid, options);
            wrapper.verifyData(wrapper.treeGridDataFormatted, 'Columns\' formatter should be applied.');
        });

        it('Should honor the Advanced filters when exporting', async () => {
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Name',
                searchVal: 'a',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            tree.filteringOperands.push({
                fieldName: 'Name',
                searchVal: 'r',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });
            treeGrid.advancedFilteringExpressionsTree = tree;
            fix.detectChanges();
            await wait();
            expect(treeGrid.filteredData.length).toBe(5);

            const wrapper = await getExportedData(treeGrid, options);
            wrapper.verifyData(wrapper.treeGridWithAdvancedFilters, 'Should export only filtered data!');
        });
    });

    const getExportedData = (grid, csvOptions: IgxCsvExporterOptions) => {
        const result = new Promise<CSVWrapper>((resolve) => {
            exporter.exportEnded.pipe(first()).subscribe((value) => {
                const wrapper = new CSVWrapper(value.csvData, csvOptions.valueDelimiter);
                resolve(wrapper);
            });
            exporter.export(grid, csvOptions);
        });
        return result;
    };
});
