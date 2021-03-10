
import { DebugElement } from '@angular/core';
import { TestBed, waitForAsync, fakeAsync, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './public_api';
import {
    ColumnPinningTestComponent,
    ColumnGroupsPinningTestComponent,
    ColumnPinningWithTemplateTestComponent
} from '../../test-utils/grid-base-components.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { ControlsFunction } from '../../test-utils/controls-functions.spec';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
describe('Column Pinning UI #grid', () => {
    configureTestSuite();
    let fix: ComponentFixture<ColumnPinningTestComponent>;
    let grid: IgxGridComponent;
    let columnChooser: IgxColumnActionsComponent;
    let columnChooserElement: DebugElement;

    const verifyCheckbox = ControlsFunction.verifyCheckbox;
    const verifyColumnIsPinned = GridFunctions.verifyColumnIsPinned;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnPinningTestComponent,
                ColumnGroupsPinningTestComponent,
                ColumnPinningWithTemplateTestComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule
            ]
        }).compileComponents();
    }));

    describe('', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ColumnPinningTestComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = GridFunctions.getColumnPinningElement(fix);
        }));

        it('title is initially empty.', waitForAsync(() => {
            const title = GridFunctions.getColumnChooserTitle(columnChooserElement);
            expect(title).toBe(null);
        }));

        it('title can be successfully changed.', waitForAsync(() => {
            columnChooser.title = 'Pin/Unpin Columns';
            fix.detectChanges();

            const titleElement = GridFunctions.getColumnChooserTitle(columnChooserElement).nativeElement as HTMLHeadingElement;
            expect(columnChooser.title).toBe('Pin/Unpin Columns');
            expect(titleElement.textContent).toBe('Pin/Unpin Columns');

            columnChooser.title = undefined;
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserTitle(columnChooserElement)).toBeNull();

            columnChooser.title = null;
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserTitle(columnChooserElement)).toBeNull();
        }));

        it(`filter input visibility is controlled via 'hideFilter' property.`, () => {
            let filterInputElement = GridFunctions.getColumnHidingHeaderInput(columnChooserElement);
            expect(filterInputElement).not.toBeNull();

            fix.componentInstance.hideFilter = true;
            fix.detectChanges();

            filterInputElement = GridFunctions.getColumnHidingHeaderInput(columnChooserElement);
            expect(filterInputElement).toBeNull();

            fix.componentInstance.hideFilter = false;
            fix.detectChanges();

            filterInputElement = GridFunctions.getColumnHidingHeaderInput(columnChooserElement);
            expect(filterInputElement).not.toBeNull();
        });

        it('shows all checkboxes unchecked.', () => {
            const checkboxes = GridFunctions.getColumnChooserItems(columnChooserElement);
            expect(checkboxes.filter((chk) => !chk.nativeElement.checked).length).toBe(5);
        });

        it(`- toggling column checkbox checked state successfully changes the column's pinned state.`, () => {
            const checkbox = GridFunctions.getColumnChooserItemElement(columnChooserElement, 'ReleaseDate');
            verifyCheckbox('ReleaseDate', false, false, columnChooserElement);

            const column = grid.getColumnByName('ReleaseDate');
            verifyColumnIsPinned(column, false, 0);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(true);
            verifyColumnIsPinned(column, true, 1);

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');
            fix.detectChanges();

            expect(GridFunctions.getColumnChooserItemInput(checkbox).checked).toBe(false);
            verifyColumnIsPinned(column, false, 0);
        });

        it('Checks order of columns after unpinning', () => {
            for (const column of grid.columns) {
                column.pin();
            }
            fix.detectChanges();
            grid.getColumnByName('ID').unpin();
            grid.getColumnByName('ReleaseDate').unpin();
            grid.getColumnByName('Downloads').unpin();
            grid.getColumnByName('ProductName').unpin();
            grid.getColumnByName('Released').unpin();
            fix.detectChanges();
            grid.unpinnedColumns.forEach((column, index) => {
                if (index === grid.unpinnedColumns.length - 1) {
                    return;
                }
                expect(
                    column.index < grid.unpinnedColumns[index + 1].index
                ).toBe(true);
            });
        });

        it('reflects properly grid column pinned value changes.', () => {
            const name = 'ReleaseDate';
            verifyCheckbox(name, false, false, columnChooserElement);
            const column = grid.getColumnByName(name);

            column.pinned = true;
            fix.detectChanges();

            verifyCheckbox(name, true, false, columnChooserElement);
            verifyColumnIsPinned(column, true, 1);

            column.pinned = false;
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement);
            verifyColumnIsPinned(column, false, 0);

            column.pinned = undefined;
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement);
            verifyColumnIsPinned(column, false, 0);

            column.pinned = true;
            fix.detectChanges();
            verifyColumnIsPinned(column, true, 1);

            column.pinned = null;
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement);
            verifyColumnIsPinned(column, false, 0);
        });

        it('onColumnPinning event is fired on toggling checkboxes.', waitForAsync(() => {
            spyOn(grid.onColumnPinning, 'emit').and.callThrough();
            spyOn(grid.columnPinned, 'emit').and.callThrough();

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');
            fix.detectChanges();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(1);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ReleaseDate'), insertAtIndex: 0, isPinned: false, cancel: false });

            expect(grid.columnPinned.emit).toHaveBeenCalledTimes(1);
            expect(grid.columnPinned.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ReleaseDate'), insertAtIndex: 0, isPinned: true });

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Downloads');
            fix.detectChanges();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(2);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('Downloads'), insertAtIndex: 1, isPinned: false, cancel: false });

            expect(grid.columnPinned.emit).toHaveBeenCalledTimes(2);
            expect(grid.columnPinned.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('Downloads'), insertAtIndex: 1, isPinned: true });

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ReleaseDate');
            fix.detectChanges();

            // When unpinning columns onColumnPinning event should be fired
            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(3);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ReleaseDate'), insertAtIndex: 3, isPinned: true, cancel: false });

            expect(grid.columnPinned.emit).toHaveBeenCalledTimes(3);
            expect(grid.columnPinned.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ReleaseDate'), insertAtIndex: 3, isPinned: false });


            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Downloads');
            fix.detectChanges();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(4);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('Downloads'), insertAtIndex: 2, isPinned: true, cancel: false });

            expect(grid.columnPinned.emit).toHaveBeenCalledTimes(4);
            expect(grid.columnPinned.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('Downloads'), insertAtIndex: 2, isPinned: false });

            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ProductName');
            fix.detectChanges();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(5);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ProductName'), insertAtIndex: 0, isPinned: false, cancel: false });

            expect(grid.columnPinned.emit).toHaveBeenCalledTimes(5);
            expect(grid.columnPinned.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ProductName'), insertAtIndex: 0, isPinned: true });
        }));

        it('onColumnPinning event should fire when pinning and unpining using api', waitForAsync(() => {
            spyOn(grid.onColumnPinning, 'emit').and.callThrough();
            spyOn(grid.columnPinned, 'emit').and.callThrough();

            grid.columns[0].pin();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(1);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ID'), insertAtIndex: 0, isPinned: false, cancel: false });

            expect(grid.columnPinned.emit).toHaveBeenCalledTimes(1);
            expect(grid.columnPinned.emit).toHaveBeenCalledWith(
                    { column: grid.getColumnByName('ID'), insertAtIndex: 0, isPinned: true });

            // onColumnPinning should not be fired if column is already pinned
            grid.columns[0].pin();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(1);
            expect(grid.columnPinned.emit).toHaveBeenCalledTimes(1);

            grid.columns[0].unpin();

            expect(grid.onColumnPinning.emit).toHaveBeenCalledTimes(2);
            expect(grid.onColumnPinning.emit).toHaveBeenCalledWith(
                { column: grid.getColumnByName('ID'), insertAtIndex: 0, isPinned: true, cancel: false });

            expect(grid.columnPinned.emit).toHaveBeenCalledTimes(2);
            expect(grid.columnPinned.emit).toHaveBeenCalledWith(
                    { column: grid.getColumnByName('ID'), insertAtIndex: 0, isPinned: false });
        }));

        it('does pin columns if unpinned area width will become less than the defined minimum.', () => {
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ID');
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'ProductName');
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Downloads');
            fix.detectChanges();

            verifyColumnIsPinned(grid.columns[0], true, 3);
            verifyColumnIsPinned(grid.columns[1], true, 3);
            verifyColumnIsPinned(grid.columns[2], true, 3);
        });

        it('toolbar should contain only pinnable columns', () => {
            fix.detectChanges();

            const pinningUIButton = GridFunctions.getColumnPinningButton(fix);
            pinningUIButton.click();
            fix.detectChanges();

            expect(GridFunctions.getOverlay(fix).querySelectorAll('igx-checkbox').length).toEqual(5);

            grid.columns[0].disablePinning = true;
            fix.detectChanges();

            pinningUIButton.click();
            fix.detectChanges();

            expect(GridFunctions.getOverlay(fix).querySelectorAll('igx-checkbox').length).toEqual(4);
        });

            it('Checks order of columns after unpinning', () => {
            for (const column of grid.columns) {
                column.pin();
            }
            fix.detectChanges();
            grid.getColumnByName('ID').unpin();
            grid.getColumnByName('ReleaseDate').unpin();
            grid.getColumnByName('Downloads').unpin();
            grid.getColumnByName('ProductName').unpin();
            grid.getColumnByName('Released').unpin();
            fix.detectChanges();
            grid.unpinnedColumns.forEach((column, index) => {
                if (index === grid.unpinnedColumns.length - 1) {
                    return;
                }
                expect(
                    column.index < grid.unpinnedColumns[index + 1].index
                ).toBe(true);
            });
        });
    });

    describe('', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(ColumnGroupsPinningTestComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = GridFunctions.getColumnPinningElement(fix);
        }));

        it('shows only top level columns.', () => {
            const columnNames = GridFunctions.getColumnActionsColumnList(columnChooserElement);
            expect(columnNames).toEqual(['Missing', 'General Information', 'ID']);
        });

        it('- pinning group column pins all children.', () => {
            fix.detectChanges();
            const columnName = 'General Information';
            GridFunctions.clickColumnChooserItem(columnChooserElement, 'Missing');
            GridFunctions.clickColumnChooserItem(columnChooserElement, columnName);
            fix.detectChanges();

            verifyCheckbox(columnName, true, false, columnChooserElement);
            expect(grid.columns[1].allChildren.every((col) => col.pinned)).toBe(true);
        });

        it('- unpinning group column unpins all children.', () => {
            const columnName = 'General Information';
            grid.columns[0].unpin();
            grid.columns[1].pin();
            fix.detectChanges();

            verifyCheckbox(columnName, true, false, columnChooserElement);
            expect(grid.columns[1].allChildren.every((col) => col.pinned)).toBe(true);

            GridFunctions.clickColumnChooserItem(columnChooserElement, columnName);
            fix.detectChanges();
            verifyCheckbox(columnName, false, false, columnChooserElement);
            expect(grid.columns[1].allChildren.every((col) => !col.pinned)).toBe(true);
        });
    });

    it('- should size cells correctly when there is a large pinned templated column', fakeAsync(/** height/width setter rAF */() => {
        fix = TestBed.createComponent(ColumnPinningWithTemplateTestComponent);
        fix.detectChanges();
        grid = fix.componentInstance.grid;
        // verify all cells have 100px height
        const cells = GridFunctions.getRowCells(fix, 0);
        cells.forEach((cell) => {
            expect(cell.nativeElement.offsetHeight).toBe(100);
        });
    }));
});
