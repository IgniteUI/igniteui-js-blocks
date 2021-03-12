
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridModule, IgxTreeGridComponent } from './public_api';
import { IgxTreeGridFilteringComponent, IgxTreeGridFilteringRowEditingComponent } from '../../test-utils/tree-grid-components.spec';
import { TreeGridFunctions } from '../../test-utils/tree-grid-functions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxStringFilteringOperand, IgxNumberFilteringOperand, IgxDateFilteringOperand } from '../../data-operations/filtering-condition';
import { FilteringStrategy } from '../../data-operations/filtering-strategy';
import { TreeGridFormattedValuesFilteringStrategy } from './tree-grid.filtering.strategy';
import { FilterMode } from '../common/enums';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { wait } from '../../test-utils/ui-interactions.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';

describe('IgxTreeGrid - Filtering actions #tGrid', () => {
    configureTestSuite();
    let fix;
    let grid;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridFilteringComponent, IgxTreeGridFilteringRowEditingComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxTreeGridModule]
        })
        .compileComponents();
    }));

    beforeEach(fakeAsync(/** height/width setter rAF */() => {
        fix = TestBed.createComponent(IgxTreeGridFilteringComponent);
        fix.detectChanges();
        tick(16);
        grid = fix.componentInstance.treeGrid;
    }));

    it('should correctly filter a string column using the \'contains\' filtering conditions', () => {
        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(i))).toEqual(true);
        }

        grid.filter('Name', 'an', IgxStringFilteringOperand.instance().condition('contains'), true);
        fix.detectChanges();

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(0))).toEqual(true);
        expect(grid.getCellByColumn(0, 'Name').value).toEqual('John Winchester');

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(1))).toEqual(true);
        expect(grid.getCellByColumn(1, 'Name').value).toEqual('Michael Langdon');

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(2))).toEqual(true);
        expect(grid.getCellByColumn(2, 'Name').value).toEqual('Monica Reyes');

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(3))).toEqual(true);
        expect(grid.getCellByColumn(3, 'Name').value).toEqual('Roland Mendel');

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(4))).toEqual(true);
        expect(grid.getCellByColumn(4, 'Name').value).toEqual('Ana Sanders');

        grid.clearFilter();
        fix.detectChanges();

        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(i))).toEqual(true);
        }
    });

    it('should correctly filter a string column using the \'endswith\' filtering conditions', () => {
        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(i))).toEqual(true);
        }

        grid.filter('Name', 'n', IgxStringFilteringOperand.instance().condition('endsWith'), true);
        fix.detectChanges();

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(0))).toEqual(true);
        expect(grid.getCellByColumn(0, 'Name').value).toEqual('John Winchester');

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(1))).toEqual(true);
        expect(grid.getCellByColumn(1, 'Name').value).toEqual('Michael Langdon');

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(2))).toEqual(true);
        expect(grid.getCellByColumn(2, 'Name').value).toEqual('Ana Sanders');

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(3))).toEqual(true);
        expect(grid.getCellByColumn(3, 'Name').value).toEqual('Laurence Johnson');

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(4))).toEqual(true);
        expect(grid.getCellByColumn(4, 'Name').value).toEqual('Victoria Lincoln');

        grid.clearFilter();
        fix.detectChanges();

        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(i))).toEqual(true);
        }
    });

    it('should correctly filter a number column using the \'greaterThan\' filtering conditions', () => {
        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(i))).toEqual(true);
        }

        grid.filter('ID', 500, IgxNumberFilteringOperand.instance().condition('greaterThan'));
        fix.detectChanges();

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(0))).toEqual(true);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(147);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(1))).toEqual(true);
        expect(grid.getCellByColumn(1, 'ID').value).toEqual(957);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(2))).toEqual(true);
        expect(grid.getCellByColumn(2, 'ID').value).toEqual(317);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(3))).toEqual(true);
        expect(grid.getCellByColumn(3, 'ID').value).toEqual(711);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(4))).toEqual(true);
        expect(grid.getCellByColumn(4, 'ID').value).toEqual(998);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(5))).toEqual(true);
        expect(grid.getCellByColumn(5, 'ID').value).toEqual(847);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(6))).toEqual(true);
        expect(grid.getCellByColumn(6, 'ID').value).toEqual(663);

        grid.clearFilter();
        fix.detectChanges();

        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(i))).toEqual(true);
        }
    });

    it('should correctly filter a number column using the \'lessThan\' filtering conditions', () => {
        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(i))).toEqual(true);
        }

        grid.filter('ID', 200, IgxNumberFilteringOperand.instance().condition('lessThan'));
        fix.detectChanges();

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(0))).toEqual(true);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(147);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(1))).toEqual(true);
        expect(grid.getCellByColumn(1, 'ID').value).toEqual(847);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(2))).toEqual(true);
        expect(grid.getCellByColumn(2, 'ID').value).toEqual(663);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(3))).toEqual(true);
        expect(grid.getCellByColumn(3, 'ID').value).toEqual(141);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(4))).toEqual(true);
        expect(grid.getCellByColumn(4, 'ID').value).toEqual(19);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(5))).toEqual(true);
        expect(grid.getCellByColumn(5, 'ID').value).toEqual(15);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(6))).toEqual(true);
        expect(grid.getCellByColumn(6, 'ID').value).toEqual(17);

        grid.clearFilter();
        fix.detectChanges();

        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(i))).toEqual(true);
        }
    });

    it('should correctly filter a date column using the \'before\' filtering conditions', () => {
        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(i))).toEqual(true);
        }

        grid.filter('HireDate', new Date(2010, 6, 25), IgxDateFilteringOperand.instance().condition('before'));
        fix.detectChanges();

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(0))).toEqual(true);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(147);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(1))).toEqual(true);
        expect(grid.getCellByColumn(1, 'ID').value).toEqual(957);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(2))).toEqual(true);
        expect(grid.getCellByColumn(2, 'ID').value).toEqual(317);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(3))).toEqual(true);
        expect(grid.getCellByColumn(3, 'ID').value).toEqual(998);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(4))).toEqual(true);
        expect(grid.getCellByColumn(4, 'ID').value).toEqual(847);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(5))).toEqual(true);
        expect(grid.getCellByColumn(5, 'ID').value).toEqual(663);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(6))).toEqual(true);
        expect(grid.getCellByColumn(6, 'ID').value).toEqual(141);

        grid.clearFilter();
        fix.detectChanges();

        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(i))).toEqual(true);
        }
    });

    it('should correctly filter a date column using the \'after\' filtering conditions', () => {
        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(i))).toEqual(true);
        }

        grid.filter('HireDate', new Date(2015, 6, 25), IgxDateFilteringOperand.instance().condition('after'));
        fix.detectChanges();

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(0))).toEqual(true);
        expect(grid.getCellByColumn(0, 'ID').value).toEqual(147);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(1))).toEqual(true);
        expect(grid.getCellByColumn(1, 'ID').value).toEqual(317);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(2))).toEqual(true);
        expect(grid.getCellByColumn(2, 'ID').value).toEqual(711);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(3))).toEqual(true);
        expect(grid.getCellByColumn(3, 'ID').value).toEqual(847);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(4))).toEqual(true);
        expect(grid.getCellByColumn(4, 'ID').value).toEqual(663);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(5))).toEqual(true);
        expect(grid.getCellByColumn(5, 'ID').value).toEqual(17);

        expect(TreeGridFunctions.checkRowIsGrayedOut(grid.getRowByIndex(6))).toEqual(true);
        expect(grid.getCellByColumn(6, 'ID').value).toEqual(12);

        expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(7))).toEqual(true);
        expect(grid.getCellByColumn(7, 'ID').value).toEqual(109);

        grid.clearFilter();
        fix.detectChanges();

        for (let i = 0; i < 5; i++) {
            expect(TreeGridFunctions.checkRowIsNotGrayedOut(grid.getRowByIndex(i))).toEqual(true);
        }
    });

    it('should allow row collapsing after filtering is applied', () => {
        grid.filter('Name', 'an', IgxStringFilteringOperand.instance().condition('contains'), true);
        fix.detectChanges();

        // check initial rows count after applying filtering
        let rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(10);

        // collapse first row
        grid.toggleRow(grid.getRowByIndex(0).rowID);
        fix.detectChanges();
        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(7);
    });

    it('should update expand indicator after filtering is applied', () => {
        grid.filter('ID', 147, IgxStringFilteringOperand.instance().condition('equals'), true);
        fix.detectChanges();

        let rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toBe(1);
        TreeGridFunctions.verifyTreeRowExpandIndicatorVisibility(rows[0], 'hidden');

        grid.clearFilter('ID');
        fix.detectChanges();

        rows = TreeGridFunctions.getAllRows(fix);
        TreeGridFunctions.verifyTreeRowExpandIndicatorVisibility(rows[0]);
        TreeGridFunctions.verifyTreeRowHasExpandedIcon(rows[0]);
    });

    it('should filter cell by its formatted data when using FormattedValuesFilteringStrategy', () => {
        const formattedStrategy = new TreeGridFormattedValuesFilteringStrategy();
        grid.filterStrategy = formattedStrategy;
        const idFormatter = (val: number): number => val % 2;
        grid.columns[0].formatter = idFormatter;
        fix.detectChanges();

        grid.filter('ID', 0, IgxNumberFilteringOperand.instance().condition('equals'));
        fix.detectChanges();
        let rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toEqual(5, 'Wrong rows count');

        grid.filter('ID', 1, IgxNumberFilteringOperand.instance().condition('equals'));
        fix.detectChanges();
        rows = TreeGridFunctions.getAllRows(fix);
        expect(rows.length).toEqual(16, 'Wrong rows count');
    });

    it('\'Blanks\' should be always visible', (async () => {
        const formattedStrategy = new TreeGridFormattedValuesFilteringStrategy();
        grid.filterStrategy = formattedStrategy;
        const idFormatter = (val: Date): string => {
            if (val) {
                if (val.getFullYear() <= 2010) {
                    return 'Senior';
                } else if (val.getFullYear() < 2014) {
                    return 'Middle';
                } else {
                    return 'Junior';
                }
            } else {
                return null;
            }
        };
        const newData = SampleTestData.employeeTreeData();
        newData[0].HireDate = null;
        newData[1].HireDate = null;

        grid.data = newData;
        grid.allowFiltering = true;
        grid.filterMode = FilterMode.excelStyleFilter;
        grid.columns[2].formatter = idFormatter;
        grid.columns[2].dataType = 'string';
        fix.detectChanges();

        GridFunctions.clickExcelFilterIcon(fix, 'HireDate');
        await wait(100);
        fix.detectChanges();
        let searchComponent = GridFunctions.getExcelFilteringSearchComponent(fix, null, 'igx-tree-grid');
        let items = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
        expect(items.length).toBe(5);
        expect(items[1].textContent).toBe(' (Blanks) ');

        const checkboxes = GridFunctions.getExcelStyleFilteringCheckboxes(fix, null, 'igx-tree-grid');
        checkboxes[0].click();
        checkboxes[2].click();
        await wait(100);
        GridFunctions.clickApplyExcelStyleFiltering(fix, null, 'igx-tree-grid');
        fix.detectChanges();

        GridFunctions.clickExcelFilterIcon(fix, 'HireDate');
        await wait(200);
        fix.detectChanges();
        searchComponent = GridFunctions.getExcelFilteringSearchComponent(fix, null, 'igx-tree-grid');
        items = GridFunctions.getExcelStyleSearchComponentListItems(fix, searchComponent);
        expect(items.length).toBe(5);
        expect(items[1].textContent).toBe(' (Blanks) ');
    }));

    describe('Filtering: Row editing', () => {
        let treeGrid: IgxTreeGridComponent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxTreeGridFilteringRowEditingComponent);
            fix.detectChanges();
            tick(16);
            treeGrid = fix.componentInstance.treeGrid;
        }));

        it('should remove a filtered parent row from the filtered list', fakeAsync(() => {
            const newCellValue = 'John McJohn';
            treeGrid.filter('Name', 'in', IgxStringFilteringOperand.instance().condition('contains'), true);
            tick(16);

            // modify the first filtered node
            const targetCell = treeGrid.getCellByColumn(0, 'Name');
            targetCell.update(newCellValue);
            tick(16);
            fix.detectChanges();

            // verify that the edited row was removed from the filtered list
            expect(treeGrid.filteredData.length).toBe(1);

            treeGrid.clearFilter();
            tick(16);
            fix.detectChanges();

            // check if the changes made were preserved
            expect(treeGrid.data.filter(c => c.Name === newCellValue).length).toBeGreaterThan(0);
        }));

        it('should not remove an edited parent node from the filtered list if it has a child node that meets the criteria',
            fakeAsync(() => {
                const newCellValue = 'John McJohn';
                treeGrid.filter('Name', 'on', IgxStringFilteringOperand.instance().condition('contains'), true);
                tick(16);

                // modify a parent node which has a child that matches the filtering condition
                const targetCell = treeGrid.getCellByColumn(0, 'Name');
                targetCell.update(newCellValue);
                tick(16);
                fix.detectChanges();

                // verify that the parent node is still in the filtered list
                expect(treeGrid.filteredData.filter(p => p.Name === targetCell.value).length).toBeGreaterThan(0);

                treeGrid.clearFilter();
                tick(16);
                fix.detectChanges();

                // verify the changes were preserved after the filtering is removed
                expect(treeGrid.data.filter(p => p.Name === targetCell.value).length).toBeGreaterThan(0);
            }));

        it(`should remove the parent node from the filtered list if
                its only matching child is modified and does not match the filtering condition anymore`,
            fakeAsync(() => {
                const newCellValue = 'John McJohn';
                const filterValue = 'Langdon';
                treeGrid.filter('Name', filterValue, IgxStringFilteringOperand.instance().condition('contains'), true);
                tick(16);

                // modify the first child node that meets the filtering condition
                const targetCell = treeGrid.getCellByColumn(1, 'Name');
                targetCell.update(newCellValue);
                tick(16);
                fix.detectChanges();

                // verify that the parent node is no longer in the filtered list
                expect(grid.filteredData).toBeFalsy();

                treeGrid.clearFilter();
                tick(16);
                fix.detectChanges();

                // verify that there is a parent which contains the updated child node
                const filteredParentNodes = treeGrid.data.filter(n => n.Employees.filter(e => e.Name === newCellValue).length !== 0);

                // if there are any parent nodes in this collection then the changes were preserved
                expect(filteredParentNodes.length).toBeGreaterThan(0);
            }));

        it('should not remove a parent node from the filtered list if it has at least one child node which matches the filtering condition',
            fakeAsync(() => {
                const newCellValue = 'Peter Peterson';
                treeGrid.filter('Name', 'h', IgxStringFilteringOperand.instance().condition('contains'), true);
                tick(16);

                // modify the first child node which meets the filtering condition
                const targetCell = treeGrid.getCellByColumn(1, 'Name');
                targetCell.update(newCellValue);
                tick(16);
                fix.detectChanges();

                // check if the edited child row is removed
                expect(treeGrid.filteredData.filter(c => c.Name === newCellValue).length).toBe(0);

                // check if the parent which contains the edited row is not removed
                expect(treeGrid.filteredData.filter(p => p.Name === targetCell.row.treeRow.parent.data.Name).length).toBeGreaterThan(0);

                treeGrid.clearFilter();
                tick(16);
                fix.detectChanges();

                // verify that there is a parent which contains the updated child node
                const filteredParentNodes = treeGrid.data.filter(n => n.Employees.filter(e => e.Name === newCellValue).length !== 0);

                // if there are any parent nodes in this collection then the changes were preserved
                expect(filteredParentNodes.length).toBeGreaterThan(0);
            }));

            it('should be able to apply custom filter strategy', fakeAsync(() => {
                expect(treeGrid.filterStrategy).toBeUndefined();
                treeGrid.filter('Name', 'd', IgxStringFilteringOperand.instance().condition('contains'), true);
                tick(30);
                fix.detectChanges();

                expect(treeGrid.rowList.length).toBe(9);

                treeGrid.clearFilter();
                fix.detectChanges();

                const customFilter = new CustomTreeGridFilterStrategy();
                // apply the same filter condition but with custu
                treeGrid.filterStrategy = customFilter;
                fix.detectChanges();

                treeGrid.filter('Name', 'd', IgxStringFilteringOperand.instance().condition('contains'), true);
                tick(30);
                fix.detectChanges();

                expect(treeGrid.rowList.length).toBe(4);
                expect(treeGrid.filteredData.map(rec => rec.ID)).toEqual([ 847, 225, 663, 141]);
            }));
    });
    class CustomTreeGridFilterStrategy  extends FilteringStrategy {

        public filter(data: [], expressionsTree): any[] {
                const result = [];
                if (!expressionsTree || !expressionsTree.filteringOperands ||
                    expressionsTree.filteringOperands.length === 0 || !data.length) {
                    return data;
                }
                data.forEach((rec: any) => {
                    if (this.matchRecord(rec.data, expressionsTree)) {
                        result.push(rec);
                    }
                });
                return result;
            }
    }
});
