import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnComponent, IgxGridComponent, IgxGridModule, IGridEditEventArgs, IGridEditDoneEventArgs } from './public_api';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import {
    CellEditingTestComponent, CellEditingScrollTestComponent,
    SelectionWithTransactionsComponent,
    ColumnEditablePropertyTestComponent
} from '../../test-utils/grid-samples.spec';
import { DebugElement } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

const DEBOUNCETIME = 30;
const CELL_CSS_CLASS = '.igx-grid__td';
const CELL_CSS_CLASS_NUMBER_FORMAT = '.igx-grid__td--number';
const CELL_CLASS_IN_EDIT_MODE = 'igx-grid__td--editing';
const EDITED_CELL_CSS_CLASS = 'igx-grid__td--edited';

describe('IgxGrid - Cell Editing #grid', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                CellEditingTestComponent,
                CellEditingScrollTestComponent,
                ColumnEditablePropertyTestComponent,
                SelectionWithTransactionsComponent
            ],
            imports: [NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    describe('Base Tests', () => {
        let fixture;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(CellEditingTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('should be able to enter edit mode on dblclick, enter and f2', () => {
            const cell = grid.getCellByColumn(0, 'fullName');

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
            fixture.detectChanges();
            expect(cell.editMode).toBe(false);

            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
            fixture.detectChanges();
            expect(cell.editMode).toBe(false);

            UIInteractions.triggerEventHandlerKeyDown('f2', gridContent);
            fixture.detectChanges();
            expect(cell.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
            fixture.detectChanges();
            expect(cell.editMode).toBe(false);
        });

        it('should be able to edit cell which is a Primary Key', () => {
            grid.primaryKey = 'personNumber';
            fixture.detectChanges();

            const cell = grid.getCellByColumn(0, 'personNumber');
            const cellDomPK = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[4];

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);

            const editTemplate = cellDomPK.query(By.css('input[type=\'number\']'));
            UIInteractions.clickAndSendInputElementValue(editTemplate, 87);

            fixture.detectChanges();
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);

            fixture.detectChanges();
            expect(cell.editMode).toBe(false);
            expect(cell.value).toBe(87);
        });

        it('edit template should be according column data type -- number', () => {
            const cell = grid.getCellByColumn(0, 'age');
            const cellDomNumber = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            const editTemplate = cellDomNumber.query(By.css('input[type=\'number\']'));
            expect(editTemplate).toBeDefined();

            UIInteractions.clickAndSendInputElementValue(editTemplate, 0.3698);
            fixture.detectChanges();
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(parseFloat(cell.value)).toBe(0.3698);
            expect(editTemplate.nativeElement.type).toBe('number');
        });

        it('should validate input data when edit numeric column', () => {
            const cell = grid.getCellByColumn(0, 'age');
            const cellDomNumber = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
            const expectedValue = 0;
            let editValue = 'some696';

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            const editTemplate = cellDomNumber.query(By.css('input[type=\'number\']'));

            UIInteractions.clickAndSendInputElementValue(editTemplate, editValue);
            fixture.detectChanges();
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(parseFloat(cell.value)).toBe(expectedValue);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            editValue = '';
            UIInteractions.clickAndSendInputElementValue(editTemplate, editValue);
            fixture.detectChanges();
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(parseFloat(cell.value)).toBe(expectedValue);
        });

        it('edit template should be according column data type -- boolean', () => {
            const cell = grid.getCellByColumn(0, 'isActive');
            const cellDomBoolean = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[2];

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);

            const editTemplate = cellDomBoolean.query(By.css('.igx-checkbox')).query(By.css('.igx-checkbox__label'));
            expect(editTemplate).toBeDefined();
            expect(cell.value).toBe(true);

            editTemplate.nativeElement.click();
            fixture.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(cell.value).toBe(false);
        });

        it('edit template should be according column data type -- date', () => {
            const cell = grid.getCellByColumn(0, 'birthday');
            const cellDomDate = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];
            const selectedDate = new Date('04/12/2017');

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            const datePicker = cellDomDate.query(By.css('igx-date-picker')).componentInstance;
            expect(datePicker).toBeDefined();

            datePicker.selectDate(selectedDate);
            fixture.detectChanges();

            expect(datePicker.value).toBe(selectedDate);
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(cell.value.getTime()).toBe(selectedDate.getTime());
        });

        it('should be able to change value form date picker input-- date', () => {
            const cell = grid.getCellByColumn(0, 'birthday');
            const cellDomDate = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];
            const selectedDate = new Date('04/12/2017');
            const editValue = '04/12/2017';

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            const datePicker = cellDomDate.query(By.css('igx-date-picker')).componentInstance;
            expect(datePicker).toBeDefined();

            const editTemplate = cellDomDate.query(By.css('.igx-date-picker__input-date'));
            editTemplate.triggerEventHandler('focus', { target: editTemplate.nativeElement });
            fixture.detectChanges();
            UIInteractions.clickAndSendInputElementValue(editTemplate, editValue);
            fixture.detectChanges();

            expect(datePicker.value).toEqual(selectedDate);
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(cell.value.getTime()).toEqual(selectedDate.getTime());
        });

        it('should be able to clear value -- date', () => {
            const cell = grid.getCellByColumn(0, 'birthday');
            const cellDomDate = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[3];

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            const datePicker = cellDomDate.query(By.css('igx-date-picker')).componentInstance;
            expect(datePicker).toBeDefined();

            const clear = cellDomDate.queryAll(By.css('.igx-icon'))[1];
            UIInteractions.simulateClickAndSelectEvent(clear);

            expect(datePicker.value).toBeNull();
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
            expect(cell.value).toBeNull();
        });

        it('Should not revert cell\' value when onDoubleClick while in editMode', (async () => {
            const cellElem = fixture.debugElement.query(By.css(CELL_CSS_CLASS));
            const firstCell = grid.getCellByColumn(0, 'fullName');

            expect(firstCell.nativeElement.textContent).toBe('John Brown');
            expect(firstCell.editMode).toBeFalsy();

            UIInteractions.simulateDoubleClickAndSelectEvent(firstCell);
            fixture.detectChanges();
            const editCell = cellElem.query(By.css('input'));
            expect(editCell.nativeElement.value).toBe('John Brown');
            expect(firstCell.editMode).toBeTruthy();

            UIInteractions.clickAndSendInputElementValue(editCell, 'test');
            fixture.detectChanges();
            cellElem.triggerEventHandler('dblclick', new Event('dblclick'));
            fixture.detectChanges();
            expect(editCell.nativeElement.value).toBe('test');
            expect(firstCell.editMode).toBeTruthy();
        }));

        it('should end cell editing when clearing or applying advanced filter', () => {
            const cell = grid.getCellByColumn(0, 'fullName');

            // Enter cell edit mode
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();
            expect(cell.editMode).toBe(true);

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fixture.detectChanges();

            // Clear the filters.
            GridFunctions.clickAdvancedFilteringClearFilterButton(fixture);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);

            // Close the dialog.
            GridFunctions.clickAdvancedFilteringCancelButton(fixture);
            fixture.detectChanges();

            // Enter cell edit mode
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();
            expect(cell.editMode).toBe(true);

            // Open Advanced Filtering dialog.
            grid.openAdvancedFilteringDialog();
            fixture.detectChanges();

            // Apply the filters.
            GridFunctions.clickAdvancedFilteringApplyButton(fixture);
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
        });
    });

    describe('Scroll, pin and blur', () => {
        let fixture;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(CellEditingScrollTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('edit mode - leaves edit mode on blur', fakeAsync(/** height/width setter rAF */() => {
            const rv = fixture.debugElement.query(By.css(CELL_CSS_CLASS));
            const cell = grid.getCellByColumn(0, 'firstName');
            const button = fixture.debugElement.query(By.css('.btnTest'));

            cell.column.editable = true;
            UIInteractions.simulateClickAndSelectEvent(cell);
            fixture.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);

            button.nativeElement.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
        }));

        it('edit mode - exit edit mode and submit when pin/unpin unpin column', fakeAsync(/** height/width setter rAF */() => {
            let cell = grid.getCellByColumn(0, 'firstName');
            const cacheValue = cell.value;
            const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            expect(grid.crudService.cell).toBeDefined();
            const editTemplate = cellDom.query(By.css('input'));
            UIInteractions.clickAndSendInputElementValue(editTemplate, 'Gary Martin');
            fixture.detectChanges();

            grid.pinColumn('firstName');
            fixture.detectChanges();
            expect(grid.crudService.cell).toBeNull();
            expect(grid.pinnedColumns.length).toBe(1);
            cell = grid.getCellByColumn(0, 'firstName');
            expect(cell.value).toBe(cacheValue);
            cell = grid.getCellByColumn(1, 'firstName');
            const cellValue = cell.value;
            cell.setEditMode(true);
            fixture.detectChanges();

            expect(grid.crudService.cell).toBeDefined();
            grid.unpinColumn('firstName');
            fixture.detectChanges();
            cell = grid.getCellByColumn(1, 'firstName');
            expect(grid.pinnedColumns.length).toBe(0);
            expect(grid.crudService.cell).toBeNull();
            expect(cell.editMode).toBe(false);
            expect(cell.value).toBe(cellValue);
        }));

        it('edit mode - leaves cell in edit mode on scroll', (async () => {
            const cell = grid.getCellByColumn(0, 'firstName');
            const editableCellId = cell.cellID;
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            await wait();
            fixture.detectChanges();

            let editCellID = grid.crudService.cell.id;
            expect(editableCellId.columnID).toBe(editCellID.columnID);
            expect(editableCellId.rowIndex).toBe(editCellID.rowIndex);
            expect(JSON.stringify(editableCellId.rowID)).toBe(JSON.stringify(editCellID.rowID));

            GridFunctions.scrollTop(grid, 1000);
            await wait(100);
            fixture.detectChanges();
            GridFunctions.scrollLeft(grid, 800);
            await wait(100);
            fixture.detectChanges();

            editCellID = grid.crudService.cell.id;
            expect(editableCellId.columnID).toBe(editCellID.columnID);
            expect(editableCellId.rowIndex).toBe(editCellID.rowIndex);
            expect(JSON.stringify(editableCellId.rowID)).toBe(JSON.stringify(editCellID.rowID));
        }));

        it('When cell in editMode and try to navigate with `ArrowDown` - focus should remain over the input.', async () => {
            const verticalScroll = grid.verticalScrollContainer.getScroll();
            const cellElem = fixture.debugElement.query(By.css(CELL_CSS_CLASS)).nativeElement;
            const cell = grid.getCellByColumn(0, 'firstName');
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(false);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();
            await wait(50);

            let inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            expect(cell.editMode).toBeTruthy();
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', inputElem, true);
            fixture.detectChanges();
            await wait(DEBOUNCETIME);

            inputElem = document.activeElement as HTMLInputElement;
            expect(cell.editMode).toBeTruthy();
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            expect(verticalScroll.scrollTop).toBe(0);
        });

        it('When cell in editMode and try to navigate with `ArrowUp` - focus should remain over the input.', (async () => {
            const verticalScroll = grid.verticalScrollContainer.getScroll();
            GridFunctions.scrollTop(grid, 1000);
            await wait(500);
            fixture.detectChanges();

            const testCells = grid.getColumnByName('firstName').cells;
            const cell = testCells[testCells.length - 1];
            const cellElem = cell.nativeElement;

            cellElem.dispatchEvent(new Event('focus'));
            cellElem.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();
            await wait(50);

            let inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            expect(cell.editMode).toBeTruthy();
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            const expectedScroll = verticalScroll.scrollTop;

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', inputElem, true);
            fixture.detectChanges();
            await wait(DEBOUNCETIME);

            inputElem = document.activeElement as HTMLInputElement;
            expect(cell.editMode).toBeTruthy();
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            expect(verticalScroll.scrollTop).toBe(expectedScroll);
        }));

        it('When cell in editMode and try to navigate with `ArrowRight` - focus should remain over the input.', (async () => {
            const cellElem = fixture.debugElement.query(By.css(CELL_CSS_CLASS)).nativeElement;
            const virtRow = grid.getRowByIndex(0).virtDirRow;
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(false);

            cellElem.dispatchEvent(new Event('focus'));
            cellElem.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();
            await wait(50);

            const inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            const cell = grid.getCellByColumn(0, 'firstName');
            expect(cell.editMode).toBeTruthy();
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('arrowright', inputElem, true);
            fixture.detectChanges();
            await wait(DEBOUNCETIME);

            const displayContainer = parseInt(virtRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            expect(cell.editMode).toBeTruthy();
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            expect(displayContainer).toBe(0);
        }));

        it('When cell in editMode and try to navigate with `ArrowLeft` - focus should remain over the input.', (async () => {
            const virtRow = grid.getRowByIndex(0).virtDirRow;

            GridFunctions.scrollLeft(grid, 800);
            await wait(100);
            fixture.detectChanges();

            const testCells = fixture.debugElement.query(By.css('igx-grid-row')).queryAll(By.css('igx-grid-cell'));
            const cellElem = testCells[testCells.length - 1].nativeElement;

            cellElem.dispatchEvent(new Event('focus'));
            cellElem.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();
            await wait(50);

            let inputElem: HTMLInputElement = document.activeElement as HTMLInputElement;
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            const virtRowStyle = parseInt(virtRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', inputElem, fixture);
            await wait(DEBOUNCETIME);
            fixture.detectChanges();

            inputElem = document.activeElement as HTMLInputElement;
            expect(cellElem.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            expect(parseInt(virtRow.dc.instance._viewContainer.element.nativeElement.style.left, 10))
                .toBe(virtRowStyle);
        }));

        it('edit mode - should close calendar when scroll', (async () => {
            GridFunctions.scrollLeft(grid, 800);
            await wait(100);
            fixture.detectChanges();

            let cell = grid.getCellByColumn(1, 'birthday');
            cell.nativeElement.dispatchEvent(new MouseEvent('dblclick'));
            fixture.detectChanges();

            const domDatePicker = fixture.debugElement.query(By.css('igx-date-picker'));
            const iconDate = domDatePicker.query(By.css('.igx-icon'));
            expect(iconDate).toBeDefined();

            UIInteractions.simulateClickAndSelectEvent(iconDate);
            fixture.detectChanges();

            // Verify calendar is opened
            let picker = document.getElementsByClassName('igx-calendar-picker');
            expect(picker.length).toBe(1);

            GridFunctions.scrollTop(grid, 10);
            await wait(100);
            fixture.detectChanges();

            // Verify calendar is closed
            picker = document.getElementsByClassName('igx-calendar-picker');
            expect(picker.length).toBe(0);

            // Verify cell is still in edit mode
            cell = grid.getCellByColumn(1, 'birthday');
            expect(cell.nativeElement.classList.contains(CELL_CLASS_IN_EDIT_MODE)).toBe(true);
            const editCellID = grid.crudService.cell.id;
            expect(4).toBe(editCellID.columnID);
            expect(1).toBe(editCellID.rowIndex);
        }));
    });

    describe('Events', () => {
        let fixture;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        const $destroyer = new Subject<boolean>();

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(CellEditingTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
            grid.ngAfterViewInit();
        }));

        afterEach(fakeAsync(() => {
            $destroyer.next(true);
        }));

        it(`Should properly emit 'cellEditEnter' event`, () => {
            spyOn(grid.cellEditEnter, 'emit').and.callThrough();
            let cell = grid.getCellByColumn(0, 'fullName');
            let initialRowData = {...cell.rowData};
            expect(cell.editMode).toBeFalsy();

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            let cellArgs: IGridEditEventArgs = {
                rowID: cell.row.rowID,
                cellID: cell.cellID,
                rowData: initialRowData,
                oldValue: 'John Brown',
                cancel: false,
                column: cell.column,
                owner: grid,
                event: jasmine.anything() as any
            };
            expect(grid.cellEditEnter.emit).toHaveBeenCalledTimes(1);
            expect(grid.cellEditEnter.emit).toHaveBeenCalledWith(cellArgs);
            expect(cell.editMode).toBeTruthy();

            // press tab on edited cell
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fixture.detectChanges();

            expect(cell.editMode).toBeFalsy();
            cell = grid.getCellByColumn(0, 'age');
            initialRowData = {...cell.rowData};
            cellArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                rowData: initialRowData,
                oldValue: 20,
                cancel: false,
                column: cell.column,
                owner: grid,
                event: jasmine.anything() as any
            };
            expect(grid.cellEditEnter.emit).toHaveBeenCalledTimes(2);
            expect(grid.cellEditEnter.emit).toHaveBeenCalledWith(cellArgs);
            expect(cell.editMode).toBeTruthy();
        });

        it(`Should be able to cancel 'cellEditEnter' event`, () => {
            spyOn(grid.cellEditEnter, 'emit').and.callThrough();
            grid.cellEditEnter.subscribe((e: IGridEditEventArgs) => {
                e.cancel = true;
            });
            let cell = grid.getCellByColumn(0, 'fullName');
            let initialRowData = {...cell.rowData};
            expect(cell.editMode).toBeFalsy();

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            let cellArgs: IGridEditEventArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                rowData: initialRowData,
                oldValue: 'John Brown',
                cancel: true,
                column: cell.column,
                owner: grid,
                event: jasmine.anything() as any
            };
            expect(grid.cellEditEnter.emit).toHaveBeenCalledTimes(1);
            expect(grid.cellEditEnter.emit).toHaveBeenCalledWith(cellArgs);
            expect(cell.editMode).toBeFalsy();

            // press enter on a cell
            cell = grid.getCellByColumn(0, 'age');
            initialRowData = {...cell.rowData};
            UIInteractions.simulateClickAndSelectEvent(cell);
            fixture.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            cellArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                rowData: initialRowData,
                oldValue: 20,
                cancel: true,
                column: cell.column,
                owner: grid,
                event: jasmine.anything() as any
            };
            expect(grid.cellEditEnter.emit).toHaveBeenCalledTimes(2);
            expect(grid.cellEditEnter.emit).toHaveBeenCalledWith(cellArgs);
            expect(cell.editMode).toBeFalsy();
        });

        it(`Should properly emit 'cellEditExit' event`, () => {
            spyOn(grid.cellEditExit, 'emit').and.callThrough();
            let cell = grid.getCellByColumn(0, 'fullName');
            let initialRowData = {...cell.rowData};
            expect(cell.editMode).toBeFalsy();

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            // press tab on edited cell
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fixture.detectChanges();

            let cellArgs: IGridEditDoneEventArgs = {
                rowID: cell.row.rowID,
                cellID: cell.cellID,
                rowData: initialRowData,
                newValue: 'John Brown',
                oldValue: 'John Brown',
                column: cell.column,
                owner: grid,
                event: jasmine.anything() as any
            };

            expect(grid.cellEditExit.emit).toHaveBeenCalledTimes(1);
            expect(grid.cellEditExit.emit).toHaveBeenCalledWith(cellArgs);

            // press tab on edited cell
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fixture.detectChanges();

            expect(cell.editMode).toBeFalsy();
            cell = grid.getCellByColumn(0, 'age');
            initialRowData = {...cell.rowData};
            cellArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                rowData: initialRowData,
                newValue: 20,
                oldValue: 20,
                column: cell.column,
                owner: grid,
                event: jasmine.anything() as any
            };
            expect(grid.cellEditExit.emit).toHaveBeenCalledTimes(2);
            expect(grid.cellEditExit.emit).toHaveBeenCalledWith(cellArgs);
        });

        it(`Should properly emit 'cellEdit' event`, () => {
            spyOn(grid.cellEdit, 'emit').and.callThrough();
            let cellArgs: IGridEditEventArgs;
            let cell = grid.getCellByColumn(0, 'fullName');

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            let editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.clickAndSendInputElementValue(editTemplate, 'New Name');
            fixture.detectChanges();

            // press tab on edited cell
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fixture.detectChanges();

            // TODO: cellEdit should emit updated rowData - issue #7304
            cellArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                rowData: cell.rowData,
                oldValue: 'John Brown',
                newValue: 'New Name',
                cancel: false,
                column: cell.column,
                owner: grid,
                event: jasmine.anything() as any
            };
            expect(grid.cellEdit.emit).toHaveBeenCalledTimes(1);
            expect(grid.cellEdit.emit).toHaveBeenCalledWith(cellArgs);

            cell = grid.getCellByColumn(0, 'age');
            expect(cell.editMode).toBe(true);
            editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.clickAndSendInputElementValue(editTemplate, 1);
            fixture.detectChanges();

            // press enter on edited cell
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            // TODO: cellEdit should emit updated rowData - issue #7304
            cellArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                rowData: cell.rowData,
                oldValue: 20,
                newValue: 1,
                cancel: false,
                column: cell.column,
                owner: grid,
                event: jasmine.anything() as any
            };
            expect(grid.cellEdit.emit).toHaveBeenCalledTimes(2);
            expect(grid.cellEdit.emit).toHaveBeenCalledWith(cellArgs);
        });

        it(`Should be able to cancel 'cellEdit' event`, fakeAsync(() => {
            const emitSpy = spyOn(grid.cellEdit, 'emit').and.callThrough();
            grid.cellEdit.subscribe((e: IGridEditEventArgs) => {
                e.cancel = true;
            });
            const cell = grid.getCellByColumn(0, 'fullName');
            const initialRowData = {...cell.rowData};

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();
            tick(16); // trigger igxFocus rAF
            const editInput = fixture.debugElement.query(By.css('igx-grid-cell input')).nativeElement;

            expect(cell.editMode).toBe(true);
            expect(document.activeElement).toBe(editInput);
            const cellValue = cell.value;
            const newValue = 'new value';
            cell.editValue = newValue;

            grid.endEdit(true);
            fixture.detectChanges();


            const cellArgs: IGridEditEventArgs = {
                rowID: cell.row.rowID,
                cellID: cell.cellID,
                rowData: initialRowData,
                oldValue: cellValue,
                newValue,
                cancel: true,
                column: cell.column,
                owner: grid,
                event: undefined
            };
            expect(grid.cellEdit.emit).toHaveBeenCalledTimes(1);
            expect(grid.cellEdit.emit).toHaveBeenCalledWith(cellArgs);

            emitSpy.calls.reset();
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fixture.detectChanges();

            cellArgs.event = jasmine.anything() as any;
            expect(cell.editMode).toBe(true);
            expect(cell.value).toBe(cellValue);
            expect(document.activeElement).toBe(editInput);
            expect(grid.cellEdit.emit).toHaveBeenCalledTimes(1);
            expect(grid.cellEdit.emit).toHaveBeenCalledWith(cellArgs);

            const nextCell = grid.getCellByColumn(0, 'age');
            expect(nextCell.editMode).toBe(false);

            // activate the new cell
            emitSpy.calls.reset();
            nextCell.activate(new FocusEvent('focus'));
            fixture.detectChanges();
            expect(grid.cellEdit.emit).toHaveBeenCalledTimes(1);
            expect(grid.cellEdit.emit).toHaveBeenCalledWith(cellArgs);

            expect(nextCell.editMode).toBe(false);
            expect(cell.editMode).toBe(true);
            expect(document.activeElement).toBe(editInput);

            emitSpy.calls.reset();
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            expect(document.activeElement).toBe(editInput);
            expect(grid.cellEdit.emit).toHaveBeenCalledTimes(1);
            expect(grid.cellEdit.emit).toHaveBeenCalledWith(cellArgs);
        }));

        it(`Should be able to update other cell in 'cellEdit' event`, () => {
            grid.primaryKey = 'personNumber';
            fixture.detectChanges();

            spyOn(grid.cellEdit, 'emit').and.callThrough();
            grid.cellEdit.subscribe((e: IGridEditEventArgs) => {
                if (e.cellID.columnID === 0) {
                    grid.updateCell(1, e.rowID, 'age');
                }
            });

            let cell = grid.getCellByColumn(0, 'fullName');

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            let editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.clickAndSendInputElementValue(editTemplate, 'New Name');
            fixture.detectChanges();

            // press tab on edited cell
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fixture.detectChanges();

            expect(grid.cellEdit.emit).toHaveBeenCalledTimes(2);
            cell = grid.getCellByColumn(0, 'age');
            expect(cell.editMode).toBe(true);
            expect(cell.value).toEqual(1);
            expect(cell.editValue).toEqual(1);
            editTemplate = fixture.debugElement.query(By.css('input'));
            expect(editTemplate.nativeElement.value).toEqual('1');

            cell = grid.getCellByColumn(0, 'fullName');
            expect(cell.value).toEqual('New Name');
        });

        it(`Should not update data in grid with transactions, when row is updated in cellEdit and cellEdit is canceled`, () => {
            fixture = TestBed.createComponent(SelectionWithTransactionsComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;

            grid.primaryKey = 'ID';
            fixture.detectChanges();

            // update the cell value via updateRow and cancel the event
            grid.cellEdit.subscribe((e: IGridEditEventArgs) => {
                const rowIndex: number = e.cellID.rowIndex;
                const row = grid.getRowByIndex(rowIndex);
                grid.updateRow({[row.columns[e.cellID.columnID].field]: e.newValue}, row.rowID);
                e.cancel = true;
            });

            const cell = grid.getCellByColumn(0, 'Name');
            const initialValue = cell.value;
            const firstNewValue = 'New Value';
            const secondNewValue = 'Very New Value';

            cell.update(firstNewValue);
            fixture.detectChanges();
            expect(cell.value).toBe(firstNewValue);

            cell.update(secondNewValue);
            fixture.detectChanges();
            expect(cell.value).toBe(secondNewValue);

            grid.transactions.undo();
            fixture.detectChanges();
            expect(cell.value).toBe(firstNewValue);

            grid.transactions.undo();
            fixture.detectChanges();
            expect(cell.value).toBe(initialValue);
        });

        it(`Should emit the committed/new rowData cellEditDone`, () => {
            fixture = TestBed.createComponent(SelectionWithTransactionsComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;

            const cell = grid.getCellByColumn(0, 'Name');
            const initialValue = cell.value;
            const newValue = 'New Name';
            const updatedRowData = Object.assign({}, cell.rowData, { Name: newValue });

            spyOn(grid.cellEditDone, 'emit').and.callThrough();

            cell.update(newValue);
            fixture.detectChanges();
            expect(cell.value).toBe(newValue);

            const cellArgs: IGridEditDoneEventArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                rowData: updatedRowData, // fixture is with transactions & without rowEditing
                oldValue: initialValue,
                newValue,
                column: cell.column,
                owner: grid,
                event: undefined
            };
            expect(grid.cellEditDone.emit).toHaveBeenCalledTimes(1);
            expect(grid.cellEditDone.emit).toHaveBeenCalledWith(cellArgs);
        });

        it(`Should properly emit 'cellEditExit' event`, () => {
            spyOn(grid.cellEditExit, 'emit').and.callThrough();
            const cell = grid.getCellByColumn(0, 'fullName');
            const initialRowData = {...cell.rowData};

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            const editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.clickAndSendInputElementValue(editTemplate, 'New Name');
            fixture.detectChanges();

            // press escape on edited cell
            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
            fixture.detectChanges();

            const cellArgs: IGridEditDoneEventArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                rowData: initialRowData,
                oldValue: 'John Brown',
                newValue: 'New Name',
                column: cell.column,
                owner: grid,
                event: jasmine.anything() as any
            };
            expect(grid.cellEditExit.emit).toHaveBeenCalledTimes(1);
            expect(grid.cellEditExit.emit).toHaveBeenCalledWith(cellArgs);

            expect(cell.editMode).toBe(false);
        });

        it(`Should properly emit 'cellEditDone' event`, () => {
            const doneSpy = spyOn(grid.cellEditDone, 'emit').and.callThrough();

            let cellArgs: IGridEditDoneEventArgs;
            let cell = grid.getCellByColumn(0, 'fullName');
            const firstNewValue = 'New Name';
            const secondNewValue = 1;
            let updatedRowData = Object.assign({}, cell.rowData, { fullName: firstNewValue });

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            let editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.clickAndSendInputElementValue(editTemplate, firstNewValue);
            fixture.detectChanges();

            // press tab on edited cell
            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fixture.detectChanges();

            cellArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                rowData: updatedRowData, // fixture is without rowEditing and without transactions
                oldValue: 'John Brown',
                newValue: firstNewValue,
                column: cell.column,
                owner: grid,
                event: jasmine.anything() as any
            };
            expect(grid.cellEditDone.emit).toHaveBeenCalledTimes(1);
            expect(grid.cellEditDone.emit).toHaveBeenCalledWith(cellArgs);

            cell = grid.getCellByColumn(0, 'age');
            expect(cell.editMode).toBe(true);
            editTemplate = fixture.debugElement.query(By.css('input'));
            UIInteractions.clickAndSendInputElementValue(editTemplate, 1);
            fixture.detectChanges();

            // press enter on edited cell
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            updatedRowData = Object.assign({}, cell.rowData, { age: secondNewValue });
            cellArgs = {
                cellID: cell.cellID,
                rowID: cell.row.rowID,
                rowData: cell.rowData, // fixture is without rowEditing and without transactions
                oldValue: 20,
                newValue: secondNewValue,
                column: cell.column,
                owner: grid,
                event: jasmine.anything() as any
            };
            expect(grid.cellEditDone.emit).toHaveBeenCalledTimes(2);
            expect(grid.cellEditDone.emit).toHaveBeenCalledWith(cellArgs);

            const spyDoneArgs = doneSpy.calls.mostRecent().args[0] as IGridEditDoneEventArgs;
            expect(spyDoneArgs.rowData).toBe(grid.data[0]);
        });

        it('Should not enter cell edit when cellEditEnter is canceled', () => {
            let canceled = true;
            const cell = grid.getCellByColumn(0, 'fullName');
            grid.cellEditEnter.pipe(takeUntil($destroyer)).subscribe((evt) => {
                evt.cancel = canceled;
            });

            grid.crudService.enterEditMode(cell);
            fixture.detectChanges();

            expect(grid.crudService.cellInEditMode).toEqual(false);
            grid.crudService.endEditMode();
            fixture.detectChanges();

            canceled = false;
            grid.crudService.enterEditMode(cell);
            fixture.detectChanges();
            expect(grid.crudService.cellInEditMode).toEqual(true);
        });

        it('When cellEdit is canceled the new value of the cell should never be committed nor the editing should be closed', () => {
            const cell = grid.getCellByColumn(0, 'fullName');
            grid.cellEdit.pipe(takeUntil($destroyer)).subscribe((evt) => {
                evt.cancel = true;
            });

            grid.crudService.enterEditMode(cell);
            fixture.detectChanges();

            const cellValue = cell.value;
            cell.update('new value');
            fixture.detectChanges();

            expect(grid.crudService.cellInEditMode).toEqual(true);
            expect(cell.value).toEqual(cellValue);
        });
    });

    describe('Integration tests', () => {
        let fixture;
        let grid: IgxGridComponent;
        let gridContent;
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(CellEditingTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it(`Should exit edit mode when rowEditable changes`, () => {
            const cell = grid.getCellByColumn(0, 'personNumber');
            expect(cell.editMode).toBeFalsy();

            cell.setEditMode(true);
            fixture.detectChanges();

            expect(cell.editMode).toBeTruthy();

            grid.rowEditable = true;
            fixture.detectChanges();

            expect(cell.editMode).toBeFalsy();
        });

        it('should exit edit mode on filtering', () => {
            let cell = grid.getCellByColumn(0, 'fullName');
            const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
            const cellValue = cell.value;

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            const editTemplate = cellDom.query(By.css('input'));
            expect(cell.editMode).toBe(true);

            UIInteractions.clickAndSendInputElementValue(editTemplate, 'Rick Gilmore');
            fixture.detectChanges();

            grid.filter('fullName', 'Al', IgxStringFilteringOperand.instance().condition('equals'));
            fixture.detectChanges();
            cell.gridAPI.clear_filter('fullName');
            fixture.detectChanges();

            cell = grid.getCellByColumn(0, 'fullName');
            expect(cell.editMode).toBe(false);
            expect(cell.value).toBe(cellValue);
        });

        it('should not throw errors when update cell to value, which does not match filter criteria', () => {
            grid.filter('personNumber', 1, IgxStringFilteringOperand.instance().condition('equals'));
            fixture.detectChanges();

            const cell = grid.getCellByColumn(0, 'personNumber');
            const cellDomPK = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[4];
            const previousCell = grid.getCellByColumn(0, 'birthday');

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();
            expect(cell.editMode).toBe(true);

            const editTemplate = cellDomPK.query(By.css('input[type=\'number\']'));
            UIInteractions.clickAndSendInputElementValue(editTemplate, 9);
            fixture.detectChanges();

            expect(() => previousCell.onClick(new MouseEvent('click'))).not.toThrow();
        });

        it('should exit edit mode on sorting', () => {
            const cell = grid.getCellByColumn(0, 'fullName');
            const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];

            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            const editTemplate = cellDom.query(By.css('input'));
            expect(cell.editMode).toBe(true);
            UIInteractions.clickAndSendInputElementValue(editTemplate, 'Rick Gilmore');
            fixture.detectChanges();

            grid.sort({ fieldName: 'age', dir: SortingDirection.Desc, ignoreCase: false });
            fixture.detectChanges();

            expect(grid.crudService.cell).toBeNull();
        });

        it('should update correct cell when sorting is applied', () => {
            grid.sort({ fieldName: 'age', dir: SortingDirection.Desc, ignoreCase: false });
            fixture.detectChanges();

            const cell = grid.getCellByColumn(0, 'fullName');
            const cellDom = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[0];
            UIInteractions.simulateDoubleClickAndSelectEvent(cell);
            fixture.detectChanges();

            const editTemplate = cellDom.query(By.css('input'));
            expect(cell.editMode).toBe(true);
            expect(cell.editValue).toBe('Tom Riddle');
            UIInteractions.clickAndSendInputElementValue(editTemplate, 'Rick Gilmore');
            fixture.detectChanges();

            expect(grid.crudService.cell.editValue).toBe('Rick Gilmore');
            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);

            fixture.detectChanges();
            expect(cell.value).toBe('Rick Gilmore');
            expect(grid.crudService.cell).toBeNull();
        });
    });

    it('Cell editing (when rowEditable=false) - default column editable value is false', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnEditablePropertyTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const columns: IgxColumnComponent[] = grid.columnList.toArray();
        expect(columns[0].editable).toBeFalsy();
        expect(columns[1].editable).toBeFalsy();
        expect(columns[2].editable).toBeTruthy();
        expect(columns[3].editable).toBeTruthy();
        expect(columns[4].editable).toBeFalsy();
        expect(columns[5].editable).toBeFalsy();
    }));

    // Bug #5855
    it('should apply proper style on cell editing when new value equals zero or false', () => {
        const fixture = TestBed.createComponent(SelectionWithTransactionsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const gridContent = GridFunctions.getGridContent(fixture);
        grid.getColumnByName('ParentID').hidden = true;
        grid.getColumnByName('Name').hidden = true;
        grid.getColumnByName('HireDate').hidden = true;
        grid.getColumnByName('Age').editable = true;
        grid.getColumnByName('OnPTO').editable = true;
        fixture.detectChanges();

        let cell = grid.getCellByColumn(0, 'Age');
        let cellDomPK = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS_NUMBER_FORMAT))[1];

        UIInteractions.simulateDoubleClickAndSelectEvent(cell);
        fixture.detectChanges();
        expect(cell.editMode).toBe(true);

        let editTemplate = cellDomPK.query(By.css('input[type=\'number\']'));
        UIInteractions.clickAndSendInputElementValue(editTemplate, 0);
        fixture.detectChanges();
        UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
        fixture.detectChanges();

        expect(cell.editMode).toBe(false);
        expect(cell.value).toBe(0);
        expect(cell.nativeElement.classList).toContain(EDITED_CELL_CSS_CLASS);

        cell = grid.getCellByColumn(1, 'OnPTO');
        cellDomPK = fixture.debugElement.queryAll(By.css(CELL_CSS_CLASS))[5];

        UIInteractions.simulateDoubleClickAndSelectEvent(cell);
        fixture.detectChanges();
        expect(cell.editMode).toBe(true);

        editTemplate = cellDomPK.query(By.css('.igx-checkbox')).query(By.css('.igx-checkbox__label'));
        editTemplate.nativeElement.click();
        fixture.detectChanges();
        UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
        fixture.detectChanges();

        expect(cell.editMode).toBe(false);
        expect(cell.value).toBe(false);
        expect(cell.nativeElement.classList).toContain(EDITED_CELL_CSS_CLASS);
    });
});
