import { By } from '@angular/platform-browser';
import { IgxTreeGridComponent, IgxRowDirective, IgxGridBaseDirective, IgxGridCellComponent } from '../grids/tree-grid/public_api';
import { IGridDataBindable } from '../grids/common/grid.interface';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { UIInteractions, wait } from './ui-interactions.spec';
import { GridFunctions } from './grid-functions.spec';

// CSS class should end with a number that specified the row's level
const TREE_CELL_DIV_INDENTATION_CSS_CLASS = '.igx-grid__tree-cell--padding-level-';
const DEBOUNCETIME = 30;

export const TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS = '.igx-grid__cbx-selection';
export const TREE_ROW_SELECTION_CSS_CLASS = 'igx-grid__tr--selected';
export const TREE_CELL_SELECTION_CSS_CLASS = 'igx-grid__td--selected';
export const TREE_HEADER_ROW_CSS_CLASS = '.igx-grid__thead';
export const CHECKBOX_INPUT_CSS_CLASS = '.igx-checkbox__input';
export const TREE_CELL_INDICATOR_CSS_CLASS = '.igx-grid__tree-grouping-indicator';
export const TREE_CELL_LOADING_CSS_CLASS = '.igx-grid__tree-loading-indicator';
export const NUMBER_CELL_CSS_CLASS = 'igx-grid__td--number';
export const CELL_VALUE_DIV_CSS_CLASS = '.igx-grid__td-text';
export const ROW_EDITING_BANNER_OVERLAY_CLASS = 'igx-overlay__content';

export class TreeGridFunctions {
    public static getHeaderRow(fix) {
        return fix.debugElement.query(By.css(TREE_HEADER_ROW_CSS_CLASS));
    }

    public static getAllRows(fix) {
        return fix.debugElement.queryAll(By.css('igx-tree-grid-row'));
    }

    public static getTreeCell(rowDOM) {
        return rowDOM.query(By.css('igx-tree-grid-cell'));
    }

    public static getCell(fix, rowIndex, columnKey) {
        const rowDOM = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix))[rowIndex];
        const rowCells = [TreeGridFunctions.getTreeCell(rowDOM)].concat(TreeGridFunctions.getNormalCells(rowDOM));
        return rowCells.filter(domCell => domCell.componentInstance.column.field === columnKey)[0];
    }

    public static getTreeCells(fix) {
        return fix.debugElement.queryAll(By.css('igx-tree-grid-cell'));
    }

    public static getNormalCells(rowDOM) {
        return rowDOM.queryAll(By.css('igx-grid-cell'));
    }

    public static getColumnCells(fix, columnKey) {
        const allTreeCells = fix.debugElement.queryAll(By.css('igx-tree-grid-cell'));
        const allNormalCells = fix.debugElement.queryAll(By.css('igx-grid-cell'));
        const allDOMCells = allTreeCells.concat(allNormalCells);
        return allDOMCells.filter(domCell => domCell.componentInstance.column.field === columnKey);
    }

    public static getAllCells(fix) {
        const allTreeCells = fix.debugElement.queryAll(By.css('igx-tree-grid-cell'));
        const allNormalCells = fix.debugElement.queryAll(By.css('igx-grid-cell'));
        return allTreeCells.concat(allNormalCells);
    }

    public static getCellValue(fix, rowIndex, columnKey) {
        const rowDOM = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix))[rowIndex];
        const rowCells = [TreeGridFunctions.getTreeCell(rowDOM)].concat(TreeGridFunctions.getNormalCells(rowDOM));
        const cell = rowCells.filter(domCell => domCell.componentInstance.column.field === columnKey)[0];
        const valueDiv = cell.query(By.css(CELL_VALUE_DIV_CSS_CLASS));
        return valueDiv.nativeElement.textContent;
    }

    public static getExpansionIndicatorDiv(rowDOM) {
        const treeGridCell = TreeGridFunctions.getTreeCell(rowDOM);
        return treeGridCell.query(By.css(TREE_CELL_INDICATOR_CSS_CLASS));
    }

    public static getLoadingIndicatorDiv(rowDOM) {
        const treeGridCell = TreeGridFunctions.getTreeCell(rowDOM);
        return treeGridCell.query(By.css(TREE_CELL_LOADING_CSS_CLASS));
    }

    public static getHeaderCell(fix, columnKey) {
        const headerCells = fix.debugElement.queryAll(By.css('igx-grid-header'));
        const headerCell = headerCells.filter((cell) => cell.nativeElement.textContent.indexOf(columnKey) !== -1)[0];
        return headerCell;
    }

    public static getHeaderCellMultiColHeaders(fix, columnKey) {
        const headerCells = fix.debugElement.queryAll(By.css('igx-grid-header'));
        const headerCell = headerCells.filter((cell) => cell.nativeElement.textContent.indexOf(columnKey) !== -1).pop();
        return headerCell;
    }

    public static getRowCheckbox(rowDOM) {
        const checkboxDiv = TreeGridFunctions.getRowCheckboxDiv(rowDOM);
        return checkboxDiv.query(By.css(CHECKBOX_INPUT_CSS_CLASS));
    }

    public static getRowCheckboxDiv(rowDOM) {
        return rowDOM.query(By.css(TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS));
    }

    public static clickHeaderCell(fix, columnKey) {
        const cell = TreeGridFunctions.getHeaderCell(fix, columnKey);
        cell.nativeElement.dispatchEvent(new Event('click'));
    }

    public static clickRowSelectionCheckbox(fix, rowIndex) {
        const rowDOM = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix))[rowIndex];
        const checkbox = TreeGridFunctions.getRowCheckboxDiv(rowDOM);
        checkbox.nativeElement.dispatchEvent(new Event('click'));
    }

    public static clickHeaderRowSelectionCheckbox(fix) {
        const headerRow = TreeGridFunctions.getHeaderRow(fix);
        const checkbox = TreeGridFunctions.getRowCheckboxDiv(headerRow);
        checkbox.nativeElement.dispatchEvent(new Event('click'));
    }

    public static clickRowIndicator(fix, rowIndex) {
        const rowDOM = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix))[rowIndex];
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(rowDOM);
        indicatorDiv.triggerEventHandler('click', new Event('click'));
    }

    /**
     * Verifies that the first cell of every row is its tree cell.
     */
    public static verifyCellsPosition(rowsDOM, expectedColumnsCount) {
        rowsDOM.forEach((row) => {
            // Verify each row's cell count
            const treeCell = TreeGridFunctions.getTreeCell(row);
            const normalCells = TreeGridFunctions.getNormalCells(row);
            expect(1 + normalCells.length).toBe(expectedColumnsCount, 'incorrect cell count for a row');

            const treeCellRectRight = treeCell.nativeElement.getBoundingClientRect().right;
            normalCells.forEach((normalCell) => {
                // Verify that the treeCell is the first cell (on the left of all the other cells)
                const normalCellRectLeft = normalCell.nativeElement.getBoundingClientRect().left;
                expect(treeCellRectRight <= normalCellRectLeft).toBe(true, 'TreeCell is not on the left of a normal cell.');
            });
        });
    }

    /**
     * Verifies both the RowComponent and the respective DOM Row are with the expected indentation level.
     */
    public static verifyRowIndentationLevel(rowComponent, rowDOM, expectedIndentationLevel) {
        const treeCell = TreeGridFunctions.getTreeCell(rowDOM);
        const divChildren = treeCell.queryAll(By.css('div'));

        // If 'expectedIndentationLevel' is 0, we expect the row to be a root level row
        // and thus it has no indentation div.
        const indentationDiv = treeCell.query(By.css(TREE_CELL_DIV_INDENTATION_CSS_CLASS + expectedIndentationLevel));
        if (expectedIndentationLevel === 0) {
            expect(divChildren.length).toBe(2, 'root treeCell has incorrect divs count');
            expect(indentationDiv).toBeNull();
        } else {
            expect(divChildren.length).toBe(3, 'child treeCell has incorrect divs count');
            expect(indentationDiv).toBeDefined();
            expect(indentationDiv).not.toBeNull();
        }

        // Verify rowComponent's indentation API.
        expect(rowComponent.treeRow.level).toBe(expectedIndentationLevel);

        // Verify expand/collapse icon's position.
        TreeGridFunctions.verifyTreeRowIconPosition(rowDOM, expectedIndentationLevel);
    }

    /**
     * Verifies both the RowComponent and the respective DOM Row are with the expected indentation level.
     * The rowIndex is the index of the row in ascending order (if rowIndex is 0, then the top-most row in view will be verified).
     */
    public static verifyRowIndentationLevelByIndex(fix, rowIndex, expectedIndentationLevel) {
        const treeGrid = fix.debugElement.query(By.css('igx-tree-grid')).componentInstance as IgxTreeGridComponent;
        const rowComponent = treeGrid.getRowByIndex(rowIndex);
        const rowDOM = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix))[rowIndex];
        TreeGridFunctions.verifyRowIndentationLevel(rowComponent, rowDOM, expectedIndentationLevel);
    }

    /**
     * Verifies that the specified column is the tree column, that contains the tree cells.
     */
    public static verifyTreeColumn(fix, expectedTreeColumnKey, expectedColumnsCount) {
        const headerCell = TreeGridFunctions.getHeaderCell(fix, expectedTreeColumnKey).parent;

        const treeCells = TreeGridFunctions.getTreeCells(fix);
        const rows = TreeGridFunctions.getAllRows(fix);

        // Verify the tree cells are first (on the left) in comparison to the rest of the cells.
        TreeGridFunctions.verifyCellsPosition(rows, expectedColumnsCount);

        // Verify the tree cells are exactly under the respective header cell.
        const headerCellRect = headerCell.nativeElement.getBoundingClientRect();
        treeCells.forEach(treeCell => {
            const treeCellRect = treeCell.nativeElement.getBoundingClientRect();
            expect(headerCellRect.bottom <= treeCellRect.top).toBe(true, 'headerCell is not on top of a treeCell');
            expect(headerCellRect.left).toBe(treeCellRect.left, 'headerCell and treeCell are not left-aligned');
            expect(headerCellRect.right).toBe(treeCellRect.right, 'headerCell and treeCell are not right-aligned');
        });
    }

    /**
     * Verifies that the specified column is the tree column, that contains the tree cells, when there are multi column headers.
     */
    public static verifyTreeColumnInMultiColHeaders(fix, expectedTreeColumnKey, expectedColumnsCount) {
        const headersDOM = TreeGridFunctions.sortElementsHorizontally(fix.debugElement.queryAll(By.css('igx-grid-header')));
        const leftMostHeaders = headersDOM.filter(x =>
            x.nativeElement.getBoundingClientRect().left === headersDOM[0].nativeElement.getBoundingClientRect().left);
        const headerCell = TreeGridFunctions.getElementWithMinHeight(leftMostHeaders);

        const treeCells = TreeGridFunctions.getTreeCells(fix);
        const rows = TreeGridFunctions.getAllRows(fix);

        // Verify the tree cells are first (on the left) in comparison to the rest of the cells.
        TreeGridFunctions.verifyCellsPosition(rows, expectedColumnsCount);
        // Verify the tree cells are exactly under the respective header cell.
        const headerCellRect = headerCell.nativeElement.getBoundingClientRect();
        treeCells.forEach(treeCell => {
            const treeCellRect = treeCell.nativeElement.getBoundingClientRect();
            expect(headerCellRect.bottom <= treeCellRect.top).toBe(true, 'headerCell is not above a treeCell');
            expect(headerCellRect.left).toBe(treeCellRect.left, 'headerCell and treeCell are not left-aligned');
            expect(headerCellRect.right).toBe(treeCellRect.right, 'headerCell and treeCell are not right-aligned');
        });
    }

    public static getElementWithMinHeight(arr) {
        return arr.reduce((a, b) =>
            (a.nativeElement.getBoundingClientRect().height < b.nativeElement.getBoundingClientRect().height) ? a : b);
    }

    public static sortElementsVertically(arr) {
        return arr.sort((a, b) =>
            a.nativeElement.getBoundingClientRect().top - b.nativeElement.getBoundingClientRect().top);
    }

    public static sortElementsHorizontally(arr) {
        return arr.sort((a, b) =>
            a.nativeElement.getBoundingClientRect().left - b.nativeElement.getBoundingClientRect().left);
    }

    public static verifyTreeRowHasCollapsedIcon(treeRowDOM) {
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(treeRowDOM);
        const igxIcon = indicatorDiv.query(By.css('igx-icon'));
        expect(igxIcon.nativeElement.textContent).toEqual('chevron_right');
    }

    public static verifyTreeRowHasExpandedIcon(treeRowDOM) {
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(treeRowDOM);
        const igxIcon = indicatorDiv.query(By.css('igx-icon'));
        expect(igxIcon.nativeElement.textContent).toEqual('expand_more');
    }

    public static verifyTreeRowExpandIndicatorVisibility(treeRowDOM, visibility = 'visible') {
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(treeRowDOM);
        expect(indicatorDiv.nativeElement.style.visibility).toBe(visibility);
    }

    public static verifyTreeRowIconPosition(treeRowDOM, indentationLevel) {
        const treeCell = TreeGridFunctions.getTreeCell(treeRowDOM);
        const treeCellPaddingLeft = parseInt(window.getComputedStyle(treeCell.nativeElement).paddingLeft, 10);
        const treeCellRect = treeCell.nativeElement.getBoundingClientRect();

        let indentation = 0;
        if (indentationLevel !== 0) {
            const indentationDiv = treeCell.query(By.css(TREE_CELL_DIV_INDENTATION_CSS_CLASS + indentationLevel));
            const indentationDivRect = indentationDiv.nativeElement.getBoundingClientRect();
            indentation = indentationDivRect.width;
        }

        const iconDiv = TreeGridFunctions.getExpansionIndicatorDiv(treeRowDOM);
        const iconDivRect = iconDiv.nativeElement.getBoundingClientRect();
        expect((iconDivRect.left - (treeCellRect.left + treeCellPaddingLeft + indentation)) < 2)
            .toBe(true, 'TreeRow icon has incorrect position');
    }

    /**
     * Returns true if a tree-grid row is 'grayed out' because of filtering
     */
    public static checkRowIsGrayedOut(row: IgxRowDirective<IgxGridBaseDirective & IGridDataBindable>): boolean {
        return row.nativeElement.classList.contains('igx-grid__tr--filtered');
    }

    /**
     * Returns true if a tree-grid row is NOT 'grayed out' because of filtering
     */
    public static checkRowIsNotGrayedOut(row: IgxRowDirective<IgxGridBaseDirective & IGridDataBindable>): boolean {
        return !row.nativeElement.classList.contains('igx-grid__tr--filtered');
    }

    /**
     * Verifies the selection of both the RowComponent and the respective DOM Row.
     */
    public static verifyTreeRowSelection(treeGridComponent, rowComponent, rowDOM, expectedSelection: boolean) {
        // Verfiy selection of checkbox
        const checkboxDiv = rowDOM.query(By.css(TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS));
        const checkboxComponent = checkboxDiv.query(By.css('igx-checkbox')).componentInstance as IgxCheckboxComponent;
        expect(checkboxComponent.checked).toBe(expectedSelection, 'Incorrect checkbox selection state');
        expect(checkboxComponent.nativeCheckbox.nativeElement.checked).toBe(expectedSelection, 'Incorrect native checkbox selection state');

        // Verify selection of row
        expect(rowComponent.selected).toBe(expectedSelection, 'Incorrect row selection state');
        expect(rowDOM.nativeElement.classList.contains(TREE_ROW_SELECTION_CSS_CLASS)).toBe(expectedSelection);

        // Verify selection of row through treeGrid
        const selectedRows = (treeGridComponent as IgxTreeGridComponent).selectedRows;
        expect(selectedRows.includes(rowComponent.rowID)).toBe(expectedSelection);
    }

    /**
     * Verifies the selection of both the RowComponent and the respective DOM Row.
     * The rowIndex is the index of the row in ascending order (if rowIndex is 0, then the top-most row in view will be verified).
     */
    public static verifyTreeRowSelectionByIndex(fix, rowIndex, expectedSelection: boolean) {
        const treeGrid = fix.debugElement.query(By.css('igx-tree-grid')).componentInstance as IgxTreeGridComponent;
        const rowComponent = treeGrid.getRowByIndex(rowIndex);
        const rowDOM = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix))[rowIndex];
        TreeGridFunctions.verifyTreeRowSelection(treeGrid, rowComponent, rowDOM, expectedSelection);
    }

    /**
     * Verifies the selection of the treeGrid rows.
     * Every index of the provided array is the index of the respective row in ascending order
     * (if rowIndex is 0, then the top-most row in view will be verified).
     */
    public static verifyDataRowsSelection(fix, expectedSelectedRowIndices: any[], expectedSelection: boolean) {
        if (expectedSelection) {
            const treeGrid = fix.debugElement.query(By.css('igx-tree-grid')).componentInstance as IgxTreeGridComponent;
            expect(treeGrid.selectedRows.length).toBe(expectedSelectedRowIndices.length, 'Incorrect number of rows that are selected.');
        }

        expectedSelectedRowIndices.forEach(rowIndex => {
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, rowIndex, expectedSelection);
        });
    }

    /**
     * Verifies the selection and checkbox state of the treeGrid row.
     */
    public static verifyRowByIndexSelectionAndCheckboxState(fix, rowIndex: any, expectedSelection: boolean,
        expectedCheckboxState: boolean | null) {
        const treeGrid = fix.debugElement.query(By.css('igx-tree-grid')).componentInstance as IgxTreeGridComponent;
        const rowComponent = treeGrid.getRowByIndex(rowIndex);
        const rowDOM = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix))[rowIndex];
        // Verfiy selection of checkbox
        const checkboxDiv = rowDOM.query(By.css(TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS));
        const checkboxComponent = checkboxDiv.query(By.css('igx-checkbox')).componentInstance as IgxCheckboxComponent;

        if (expectedCheckboxState === null) {
            expect(checkboxComponent.indeterminate).toBe(true);
            expect(checkboxComponent.checked).toBe(false, 'Incorrect checkbox selection state');
            expect(checkboxComponent.nativeCheckbox.nativeElement.checked).toBe(false, 'Incorrect native checkbox selection state');

            // Verify selection of row
            expect(rowComponent.selected).toBe(false, 'Incorrect row selection state');
            expect((rowDOM.nativeElement as HTMLElement).classList.contains(TREE_ROW_SELECTION_CSS_CLASS)).toBe(false);

            // Verify selection of row through treeGrid
            const selectedRows = (treeGrid as IgxTreeGridComponent).selectedRows;
            expect(selectedRows.includes(rowComponent.rowID)).toBe(false);
        }  else {
            expect(checkboxComponent.checked).toBe(expectedCheckboxState, 'Incorrect checkbox selection state');
            expect(checkboxComponent.nativeCheckbox.nativeElement.checked).toBe(
                expectedCheckboxState, 'Incorrect native checkbox selection state');

            // Verify selection of row
            expect(rowComponent.selected).toBe(expectedSelection, 'Incorrect row selection state');
            expect((rowDOM.nativeElement as HTMLElement).classList.contains(TREE_ROW_SELECTION_CSS_CLASS)).toBe(expectedSelection);

            // Verify selection of row through treeGrid
            const selectedRows = (treeGrid as IgxTreeGridComponent).selectedRows;
            expect(selectedRows.includes(rowComponent.rowID)).toBe(expectedSelection);
        }
    }

    /**
     * Verifies the selection of the header checkbox.
     * The expected value can be true, false or null (indeterminate).
     */
    public static verifyHeaderCheckboxSelection(fix, expectedSelection: boolean | null) {
        const headerRow = TreeGridFunctions.getHeaderRow(fix);
        const checkboxDiv = headerRow.query(By.css(TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS));
        const checkboxComponent = checkboxDiv.query(By.css('igx-checkbox')).componentInstance as IgxCheckboxComponent;

        if (expectedSelection === null) {
            expect(checkboxComponent.indeterminate).toBe(true);
            expect(checkboxComponent.checked).toBe(false, 'Incorrect checkbox selection state');
            expect(checkboxComponent.nativeCheckbox.nativeElement.checked).toBe(false, 'Incorrect native checkbox selection state');
        } else {
            expect(checkboxComponent.indeterminate).toBe(false);
            expect(checkboxComponent.checked).toBe(expectedSelection, 'Incorrect checkbox selection state');
            expect(checkboxComponent.nativeCheckbox.nativeElement.checked).toBe(expectedSelection,
                'Incorrect native checkbox selection state');
        }
    }

    public static verifyGridCellHasSelectedClass(cellDOM) {
        return cellDOM.nativeElement.classList.contains(TREE_CELL_SELECTION_CSS_CLASS);
    }

    public static verifyTreeGridCellSelected(treeGrid: IgxTreeGridComponent, cell: IgxGridCellComponent, selected: boolean = true) {
        expect(cell).toBeDefined();
        if (cell) {
            expect(TreeGridFunctions.verifyGridCellHasSelectedClass(cell)).toBe(selected);

            if (selected) {
                const selectedCell = treeGrid.selectedCells[0];
                expect(selectedCell).toBeDefined();
                if (selectedCell) {
                    expect(selectedCell.value).toEqual(cell.value);
                    expect(selectedCell.column.field).toEqual(cell.column.field);
                    expect(selectedCell.rowIndex).toEqual(cell.rowIndex);
                    expect(selectedCell.value).toEqual(cell.value);
                }
            }
        }
    }

    public static verifyTreeRowIndicator(row, isLoading: boolean, isExpandVisible = true) {
        const indicatorDiv = TreeGridFunctions.getExpansionIndicatorDiv(row);
        const loadingDiv = TreeGridFunctions.getLoadingIndicatorDiv(row);

        if (isLoading) {
            expect(loadingDiv).toBeDefined();
            expect(indicatorDiv).toBeNull();
        } else {
            expect(loadingDiv).toBeNull();
            expect(indicatorDiv).toBeDefined();
            expect(indicatorDiv.nativeElement.style.visibility).toBe(isExpandVisible ? 'visible' : 'hidden');
        }
    }

    public static moveCellUpDown(fix, treeGrid: IgxTreeGridComponent, rowIndex: number, columnName: string, moveDown: boolean = true) {
        const cell = treeGrid.getCellByColumn(rowIndex, columnName);
        const newRowIndex = moveDown ? rowIndex + 1 : rowIndex - 1;
        const keyboardEventKey = moveDown ? 'ArrowDown' : 'ArrowUp';
        const gridContent = GridFunctions.getGridContent(fix);

        UIInteractions.triggerEventHandlerKeyDown(keyboardEventKey, gridContent);
        fix.detectChanges();

        TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);

        const newCell = treeGrid.getCellByColumn(newRowIndex, columnName);
        TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);
    }

    public static moveCellLeftRight(fix, treeGrid: IgxTreeGridComponent, rowIndex: number,
        firstColumnName: string, nextColumnName: string, moveRight: boolean = true) {
        const cell = treeGrid.getCellByColumn(rowIndex, firstColumnName);
        const keyboardEventKey = moveRight ? 'ArrowRight' : 'ArrowLeft';
        const gridContent = GridFunctions.getGridContent(fix);

        UIInteractions.triggerEventHandlerKeyDown(keyboardEventKey, gridContent);
        fix.detectChanges();

        TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, cell, false);
        const newCell = treeGrid.getCellByColumn(rowIndex, nextColumnName);
        TreeGridFunctions.verifyTreeGridCellSelected(treeGrid, newCell);
    }


    public static moveGridCellWithTab =
        (fix, cell: IgxGridCellComponent) => new Promise<void>(async resolve => {
            UIInteractions.triggerKeyDownEvtUponElem('Tab', cell.nativeElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            resolve();
        });
}
