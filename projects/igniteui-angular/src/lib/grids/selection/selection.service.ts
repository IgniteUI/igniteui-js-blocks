import { EventEmitter, Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IGridEditEventArgs, IGridEditDoneEventArgs } from '../common/events';
import { GridType } from '../common/grid.interface';
import { IgxGridBaseDirective } from '../grid/public_api';

export interface GridSelectionRange {
    rowStart: number;
    rowEnd: number;
    columnStart: string | number;
    columnEnd: string | number;
}

export interface ISelectionNode {
    row: number;
    column: number;
    layout?: IMultiRowLayoutNode;
    isSummaryRow?: boolean;
}

export interface IMultiRowLayoutNode {
    rowStart: number;
    colStart: number;
    rowEnd: number;
    colEnd: number;
    columnVisibleIndex: number;
}

interface ISelectionKeyboardState {
    node: null | ISelectionNode;
    shift: boolean;
    range: GridSelectionRange;
    active: boolean;
}

interface ISelectionPointerState extends ISelectionKeyboardState {
    ctrl: boolean;
    primaryButton: boolean;
}

interface IColumnSelectionState {
    field: null | string;
    range: string[];
}

type SelectionState = ISelectionKeyboardState | ISelectionPointerState;


// TODO: Refactor - export in a separate file

export class IgxRow {
    public transactionState: any;
    public state: any;
    public newData: any;
    public isAddRow: boolean;

    constructor(public id: any, public index: number, public data: any, public grid: IgxGridBaseDirective & GridType) { }

    public createEditEventArgs(includeNewValue = true, event?: Event): IGridEditEventArgs {
        const args: IGridEditEventArgs = {
            rowID: this.id,
            rowData: this.data,
            oldValue: this.data,
            cancel: false,
            owner: this.grid,
            isAddRow: this.isAddRow || false,
            event
        };
        if (includeNewValue) {
            args.newValue = this.newData;
        }
        return args;
    }

    public createDoneEditEventArgs(cachedRowData: any, event?: Event): IGridEditDoneEventArgs {
        const updatedData = this.grid.transactions.enabled ?
            this.grid.transactions.getAggregatedValue(this.id, true) : this.grid.gridAPI.getRowData(this.id);
        const rowData = updatedData === null ? this.grid.gridAPI.getRowData(this.id) : updatedData;
        const args: IGridEditDoneEventArgs = {
            rowID: this.id,
            rowData,
            oldValue: cachedRowData,
            newValue: updatedData,
            owner: this.grid,
            isAddRow: this.isAddRow || false,
            event
        };

        return args;
    }
}

export class IgxCell {
    public primaryKey: any;
    public state: any;

    constructor(
        public id,
        public rowIndex: number,
        public column,
        public value: any,
        public editValue: any,
        public rowData: any,
        public grid: IgxGridBaseDirective & GridType) { }

        public castToNumber(value: any): any {
        if (this.column.dataType === 'number' && !this.column.inlineEditorTemplate) {
            const v = parseFloat(value);
            return !isNaN(v) && isFinite(v) ? v : 0;
        }
        return value;
    }

    public createEditEventArgs(includeNewValue = true, event?: Event): IGridEditEventArgs {
        const args: IGridEditEventArgs = {
            rowID: this.id.rowID,
            cellID: this.id,
            rowData: this.rowData,
            oldValue: this.value,
            cancel: false,
            column: this.column,
            owner: this.grid,
            event
        };
        if (includeNewValue) {
            args.newValue = this.castToNumber(this.editValue);
        }
        return args;
    }

    public createDoneEditEventArgs(value: any, event?: Event): IGridEditDoneEventArgs {
        const updatedData = this.grid.transactions.enabled ?
            this.grid.transactions.getAggregatedValue(this.id.rowID, true) : this.rowData;
        const rowData = updatedData === null ? this.grid.gridAPI.getRowData(this.id.rowID) : updatedData;
        const args: IGridEditDoneEventArgs = {
            rowID: this.id.rowID,
            cellID: this.id,
            // rowData - should be the updated/committed rowData - this effectively should be the newValue
            // the only case we use this.rowData directly, is when there is no rowEditing or transactions enabled
            rowData,
            oldValue: this.value,
            newValue: value,
            column: this.column,
            owner: this.grid,
            event
        };
        return args;
    }
}

@Injectable()
export class IgxGridCRUDService {

    public grid: IgxGridBaseDirective & GridType;
    public cell: IgxCell | null = null;
    public row: IgxRow | null = null;
    public isInCompositionMode = false;

    private _cellEditingBlocked = false;
    private _rowEditingBlocked = false;

    public createCell(cell): IgxCell {
        return new IgxCell(cell.cellID, cell.rowIndex, cell.column, cell.value, cell.value, cell.row.rowData, cell.grid);
    }

    public createRow(cell: IgxCell): IgxRow {
        return new IgxRow(cell.id.rowID, cell.rowIndex, cell.rowData, cell.grid);
    }

    public sameRow(rowID): boolean {
        return this.row && this.row.id === rowID;
    }

    public sameCell(cell: IgxCell): boolean {
        return (this.cell.id.rowID === cell.id.rowID &&
            this.cell.id.columnID === cell.id.columnID);
    }

    public get cellInEditMode(): boolean {
        return !!this.cell;
    }

    public get rowInEditMode(): boolean {
        return !!this.row;
    }

    public get rowEditing(): boolean {
        return this.grid.rowEditable;
    }

    public get primaryKey(): any {
        return this.grid.primaryKey;
    }

    public get cellEditingBlocked() {
        return this._cellEditingBlocked;
    }

    public set cellEditingBlocked(val: boolean) {
        this._cellEditingBlocked = val;
    }

    public get rowEditingBlocked() {
        return this._rowEditingBlocked;
    }

    public set rowEditingBlocked(val: boolean) {
        this._rowEditingBlocked = val;
    }

    public enterEditMode(cell, event?: Event) {
        if (this.isInCompositionMode) {
            return;
        }

        if (this.cellInEditMode) {
            // TODO: case solely for f2/enter nav that uses enterEditMode as toggle. Refactor.
            const canceled = this.grid.endEdit(true, event);

            if (!canceled || !this.cell) {
                this.grid.tbody.nativeElement.focus();
            }
        } else {
            if (cell?.row.addRow) {
                this.beginAddRow(cell, event);
                return;
            }
            /** Changing the reference with the new editable cell */
            const newCell = this.createCell(cell);
            if (this.rowEditing) {
                const canceled = this.beginRowEdit(newCell, event);
                if (!canceled) {
                    this.beginCellEdit(newCell, event);
                }

            } else {
                this.beginCellEdit(newCell, event);
            }
        }
    }

    /** Enters row edit mode */
    public beginRowEdit(newCell, event?: Event) {
        if (this.row && !this.sameRow(newCell.id.rowID)) {
            this._rowEditingBlocked = this.grid.endEdit(true, event);
            if (this.rowEditingBlocked) {
                return true;
            }

            this.cell = newCell;
            this._rowEditingBlocked = false;
            this.endRowEdit();
        }

        if (this.grid.rowEditable && (this.grid.primaryKey === undefined || this.grid.primaryKey === null)) {
            console.warn('The grid must have a `primaryKey` specified when using `rowEditable`!');
        }

        if (!this.row) {
            this.cell = newCell;
            this.row = this.createRow(this.cell);
            const rowArgs = this.row.createEditEventArgs(false, event);

            this.grid.rowEditEnter.emit(rowArgs);
            if (rowArgs.cancel) {
                this.endEditMode();
                return true;
            }

            this.row.transactionState = this.grid.transactions.getAggregatedValue(this.row.id, true);
            this.grid.transactions.startPending();
            this.grid.openRowOverlay(this.row.id);
        }
    }

    /** Exit row edit mode */
    public exitRowEdit(commit: boolean, event?: Event) {
        if (!this.grid.rowEditable ||
            this.grid.rowEditingOverlay &&
            this.grid.rowEditingOverlay.collapsed || !this.row) {
            return false;
        }

        if (this.rowEditingBlocked && this.cellEditingBlocked) {
            return true;
        }

        const canceled = this.grid.endRowTransaction(commit, this.row, event);
        if (canceled) {
            return true;
        }
    }

    /** Enters cell edit mode */
    public beginAddRow(cell, event?: Event) {
        const newCell = this.createCell(cell);
        newCell.primaryKey = this.primaryKey;
        cell.enterAddMode = true;
        this.cell = newCell;
        if (!this.sameRow(newCell.id.rowID)) {
            this.row = this.createRow(this.cell);
            this.row.isAddRow = true;
            const rowArgs = this.row.createEditEventArgs(false, event);
            this.grid.rowEditEnter.emit(rowArgs);
            if (rowArgs.cancel) {
                this.endEditMode();
                this.grid.endAddRow();
                return;
            }
            this.grid.openRowOverlay(this.row.id);
        }
        const args = newCell.createEditEventArgs(false, event);
        this.grid.cellEditEnter.emit(args);
        if (args.cancel) {
            this.endCellEdit();
            return;
        }
    }

    public beginCellEdit(newCell, event?: Event) {
        const args = newCell.createEditEventArgs(false, event);
        this.grid.cellEditEnter.emit(args);

        this._cellEditingBlocked = args.cancel;
        if (args.cancel) {
            this.endCellEdit();
        } else {
            this.cell = newCell;
        }

    }

    /** Exit cell edit mode */
    public exitCellEdit(event?: Event): boolean {
        if (!this.cell) {
            return false;
        }

        const newValue = this.cell.castToNumber(this.cell.editValue);
        const args = this.cell?.createDoneEditEventArgs(newValue, event);
        this.cell.value = newValue;


        this.grid.cellEditExit.emit(args);
        this.endCellEdit();
        return false;
    }

    /** Clears cell editing state */
    public endCellEdit() {
        this.cell = null;
        this.cellEditingBlocked = false;
    }

    /** Clears row editing state */
    public endRowEdit() {
        this.row = null;
        this.rowEditingBlocked = false;
    }


    /** Clears cell and row editing state and closes row editing template if it is open */
    public endEditMode() {
        this.endCellEdit();
        if (this.grid.rowEditable) {
            this.endRowEdit();
            this.grid.closeRowEditingOverlay();
        }
    }

    /** Returns whether the targeted cell is in edit mode */
    public targetInEdit(rowIndex: number, columnIndex: number): boolean {
        if (!this.cell) {
            return false;
        }
        const res = this.cell.column.index === columnIndex && this.cell.rowIndex === rowIndex;
        return res;
    }
}


@Injectable()
export class IgxGridSelectionService {
    public grid;
    public dragMode = false;
    public activeElement: ISelectionNode | null;
    public keyboardState = {} as ISelectionKeyboardState;
    public pointerState = {} as ISelectionPointerState;
    public columnsState = {} as IColumnSelectionState;

    public selection = new Map<number, Set<number>>();
    public temp = new Map<number, Set<number>>();
    public rowSelection: Set<any> = new Set<any>();
    public indeterminateRows: Set<any> = new Set<any>();
    public columnSelection: Set<string> = new Set<string>();
    /**
     * @hidden @internal
     */
    public selectedRowsChange = new Subject();

    private allRowsSelected: boolean;
    private _ranges: Set<string> = new Set<string>();
    private _selectionRange: Range;

    /**
     * Returns the current selected ranges in the grid from both
     * keyboard and pointer interactions
     */
    public get ranges(): GridSelectionRange[] {

        // The last action was keyboard + shift selection -> add it
        this.addKeyboardRange();

        const ranges = Array.from(this._ranges).map(range => JSON.parse(range));

        // No ranges but we have a focused cell -> add it
        if (!ranges.length && this.activeElement && this.grid.isCellSelectable) {
            ranges.push(this.generateRange(this.activeElement));
        }

        return ranges;
    }

    public get primaryButton(): boolean {
        return this.pointerState.primaryButton;
    }

    public set primaryButton(value: boolean) {
        this.pointerState.primaryButton = value;
    }

    constructor(private zone: NgZone) {
        this.initPointerState();
        this.initKeyboardState();
        this.initColumnsState();
    }

    /**
     * Resets the keyboard state
     */
    public initKeyboardState(): void {
        this.keyboardState.node = null;
        this.keyboardState.shift = false;
        this.keyboardState.range = null;
        this.keyboardState.active = false;
    }

    /**
     * Resets the pointer state
     */
    public initPointerState(): void {
        this.pointerState.node = null;
        this.pointerState.ctrl = false;
        this.pointerState.shift = false;
        this.pointerState.range = null;
        this.pointerState.primaryButton = true;
    }

    /**
     * Resets the columns state
     */
    public initColumnsState(): void {
        this.columnsState.field = null;
        this.columnsState.range = [];
    }

    /**
     * Adds a single node.
     * Single clicks | Ctrl + single clicks on cells is the usual case.
     */
    public add(node: ISelectionNode, addToRange = true): void {
        if (this.selection.has(node.row)) {
            this.selection.get(node.row).add(node.column);
        } else {
            this.selection.set(node.row, new Set<number>()).get(node.row).add(node.column);
        }

        if (addToRange) {
            this._ranges.add(JSON.stringify(this.generateRange(node)));
        }
    }

    /**
     * Adds the active keyboard range selection (if any) to the `ranges` meta.
     */
    public addKeyboardRange(): void {
        if (this.keyboardState.range) {
            this._ranges.add(JSON.stringify(this.keyboardState.range));
        }
    }

    public remove(node: ISelectionNode): void {
        if (this.selection.has(node.row)) {
            this.selection.get(node.row).delete(node.column);
        }
        if (this.isActiveNode(node)) {
            this.activeElement = null;
        }
        this._ranges.delete(JSON.stringify(this.generateRange(node)));
    }

    public isInMap(node: ISelectionNode): boolean {
        return (this.selection.has(node.row) && this.selection.get(node.row).has(node.column)) ||
            (this.temp.has(node.row) && this.temp.get(node.row).has(node.column));
    }

    public selected(node: ISelectionNode): boolean {
        return (this.isActiveNode(node) && this.grid.isCellSelectable) || this.isInMap(node);
    }

    public isActiveNode(node: ISelectionNode): boolean {
        if (this.activeElement) {
            const isActive = this.activeElement.column === node.column && this.activeElement.row === node.row;
            if (this.grid.hasColumnLayouts) {
                const layout = this.activeElement.layout;
                return isActive && this.isActiveLayout(layout, node.layout);
            }
            return isActive;
        }
        return false;
    }

    public isActiveLayout(current: IMultiRowLayoutNode, target: IMultiRowLayoutNode): boolean {
        return current.columnVisibleIndex === target.columnVisibleIndex;
    }

    public addRangeMeta(node: ISelectionNode, state?: SelectionState): void {
        this._ranges.add(JSON.stringify(this.generateRange(node, state)));
    }

    public removeRangeMeta(node: ISelectionNode, state?: SelectionState): void {
        this._ranges.delete(JSON.stringify(this.generateRange(node, state)));
    }

    /**
     * Generates a new selection range from the given `node`.
     * If `state` is passed instead it will generate the range based on the passed `node`
     * and the start node of the `state`.
     */
    public generateRange(node: ISelectionNode, state?: SelectionState): GridSelectionRange {
        if (!state) {
            return {
                rowStart: node.row,
                rowEnd: node.row,
                columnStart: node.column,
                columnEnd: node.column
            };
        }

        const { row, column } = state.node;
        const rowStart = Math.min(node.row, row);
        const rowEnd = Math.max(node.row, row);
        const columnStart = Math.min(node.column, column);
        const columnEnd = Math.max(node.column, column);

        return { rowStart, rowEnd, columnStart, columnEnd };
    }

    /**
     *
     */
    public keyboardStateOnKeydown(node: ISelectionNode, shift: boolean, shiftTab: boolean): void {
        this.keyboardState.active = true;
        this.initPointerState();
        this.keyboardState.shift = shift && !shiftTab;
        if (!this.grid.navigation.isDataRow(node.row)) {
            return;
        }
        // Kb navigation with shift and no previous node.
        // Clear the current selection init the start node.
        if (this.keyboardState.shift && !this.keyboardState.node) {
            this.clear();
            this.keyboardState.node = Object.assign({}, node);
        }
    }

    public keyboardStateOnFocus(node: ISelectionNode, emitter: EventEmitter<GridSelectionRange>, dom): void {
        const kbState = this.keyboardState;

        // Focus triggered by keyboard navigation
        if (kbState.active) {
            if (isChromium()) {
                this._moveSelectionChrome(dom);
            }
            // Start generating a range if shift is hold
            if (kbState.shift) {
                this.dragSelect(node, kbState);
                kbState.range = this.generateRange(node, kbState);
                emitter.emit(this.generateRange(node, kbState));
                return;
            }

            this.initKeyboardState();
            this.clear();
            this.add(node);
        }
    }

    public pointerDown(node: ISelectionNode, shift: boolean, ctrl: boolean): void {
        this.addKeyboardRange();
        this.initKeyboardState();
        this.pointerState.ctrl = ctrl;
        this.pointerState.shift = shift;

        // No ctrl key pressed - no multiple selection
        if (!ctrl) {
            this.clear();
        }

        if (shift) {
            // No previously 'clicked' node. Use the last active node.
            if (!this.pointerState.node) {
                this.pointerState.node = this.activeElement || node;
            }
            this.pointerDownShiftKey(node);
            this.clearTextSelection();
            return;
        }

        this.removeRangeMeta(node);
        this.pointerState.node = node;
    }

    public pointerDownShiftKey(node: ISelectionNode): void {
        this.clear();
        this.selectRange(node, this.pointerState);
    }

    public mergeMap(target: Map<number, Set<number>>, source: Map<number, Set<number>>): void {
        const iterator = source.entries();
        let pair = iterator.next();
        let key: number;
        let value: Set<number>;

        while (!pair.done) {
            [key, value] = pair.value;
            if (target.has(key)) {
                const newValue = target.get(key);
                value.forEach(record => newValue.add(record));
                target.set(key, newValue);
            } else {
                target.set(key, value);
            }
            pair = iterator.next();
        }
    }

    public pointerEnter(node: ISelectionNode, event: PointerEvent): boolean {
        // https://www.w3.org/TR/pointerevents/#the-button-property
        this.dragMode = event.buttons === 1 && (event.button === -1 || event.button === 0);
        if (!this.dragMode) {
            return false;
        }
        this.clearTextSelection();

        // If the users triggers a drag-like event by first clicking outside the grid cells
        // and then enters in the grid body we may not have a initial pointer starting node.
        // Assume the first pointerenter node is where we start.
        if (!this.pointerState.node) {
            this.pointerState.node = node;
        }

        if (this.pointerState.ctrl) {
            this.selectRange(node, this.pointerState, this.temp);
        } else {
            this.dragSelect(node, this.pointerState);
        }
        return true;
    }

    public pointerUp(node: ISelectionNode, emitter: EventEmitter<GridSelectionRange>): boolean {
        if (this.dragMode) {
            this.restoreTextSelection();
            this.addRangeMeta(node, this.pointerState);
            this.mergeMap(this.selection, this.temp);
            this.zone.runTask(() => emitter.emit(this.generateRange(node, this.pointerState)));
            this.temp.clear();
            this.dragMode = false;
            return true;
        }

        if (this.pointerState.shift) {
            this.clearTextSelection();
            this.restoreTextSelection();
            this.addRangeMeta(node, this.pointerState);
            emitter.emit(this.generateRange(node, this.pointerState));
            return true;
        }

        this.add(node);
        return false;
    }

    public selectRange(node: ISelectionNode, state: SelectionState, collection: Map<number, Set<number>> = this.selection): void {
        if (collection === this.temp) {
            collection.clear();
        }
        const { rowStart, rowEnd, columnStart, columnEnd } = this.generateRange(node, state);
        for (let i = rowStart; i <= rowEnd; i++) {
            for (let j = columnStart as number; j <= columnEnd; j++) {
                if (collection.has(i)) {
                    collection.get(i).add(j);
                } else {
                    collection.set(i, new Set<number>()).get(i).add(j);
                }
            }
        }
    }

    public dragSelect(node: ISelectionNode, state: SelectionState): void {
        if (!this.pointerState.ctrl) {
            this.selection.clear();
        }
        this.selectRange(node, state);
    }

    public clear(clearAcriveEl = false): void {
        if (clearAcriveEl) {
            this.activeElement = null;
        }
        this.selection.clear();
        this.temp.clear();
        this._ranges.clear();
    }

    public clearTextSelection(): void {
        const selection = window.getSelection();
        if (selection.rangeCount) {
            this._selectionRange = selection.getRangeAt(0);
            this._selectionRange.collapse(true);
            selection.removeAllRanges();
        }
    }

    public restoreTextSelection(): void {
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            selection.addRange(this._selectionRange || document.createRange());
        }
    }

    /** Returns array of the selected row id's. */
    public getSelectedRows(): Array<any> {
        return this.rowSelection.size ? Array.from(this.rowSelection.keys()) : [];
    }

    /** Returns array of the rows in indeterminate state. */
    public getIndeterminateRows(): Array<any> {
        return this.indeterminateRows.size ? Array.from(this.indeterminateRows.keys()) : [];
    }

    /** Clears row selection, if filtering is applied clears only selected rows from filtered data. */
    public clearRowSelection(event?): void {
        const removedRec = this.isFilteringApplied() ?
            this.getRowIDs(this.allData).filter(rID => this.isRowSelected(rID)) : this.getSelectedRows();
        const newSelection = this.isFilteringApplied() ? this.getSelectedRows().filter(x => !removedRec.includes(x)) : [];
        this.emitRowSelectionEvent(newSelection, [], removedRec, event);
    }

    /** Select all rows, if filtering is applied select only from filtered data. */
    public selectAllRows(event?) {
        const allRowIDs = this.getRowIDs(this.allData);
        const addedRows = allRowIDs.filter((rID) => !this.isRowSelected(rID));
        const newSelection = this.rowSelection.size ? this.getSelectedRows().concat(addedRows) : addedRows;
        this.indeterminateRows.clear();
        this.selectedRowsChange.next();
        this.emitRowSelectionEvent(newSelection, addedRows, [], event);
    }

    /** Select the specified row and emit event. */
    public selectRowById(rowID, clearPrevSelection?, event?): void {
        if (!this.grid.isRowSelectable || this.isRowDeleted(rowID)) {
            return;
        }
        clearPrevSelection = !this.grid.isMultiRowSelectionEnabled || clearPrevSelection;

        const newSelection = clearPrevSelection ? [rowID] : this.getSelectedRows().indexOf(rowID) !== -1 ?
            this.getSelectedRows() : [...this.getSelectedRows(), rowID];
        const removed = clearPrevSelection ? this.getSelectedRows() : [];
        this.selectedRowsChange.next();
        this.emitRowSelectionEvent(newSelection, [rowID], removed, event);
    }

    /** Deselect the specified row and emit event. */
    public deselectRow(rowID, event?): void {
        if (!this.isRowSelected(rowID)) {
            return;
        }
        const newSelection = this.getSelectedRows().filter(r => r !== rowID);
        if (this.rowSelection.size && this.rowSelection.has(rowID)) {
            this.selectedRowsChange.next();
            this.emitRowSelectionEvent(newSelection, [], [rowID], event);
        }
    }

    /** Select specified rows. No event is emitted. */
    public selectRowsWithNoEvent(rowIDs: any[], clearPrevSelection?): void {
        if (clearPrevSelection) {
            this.rowSelection.clear();
        }
        rowIDs.forEach(rowID => this.rowSelection.add(rowID));
        this.allRowsSelected = undefined;
        this.selectedRowsChange.next();
    }

    /** Deselect specified rows. No event is emitted. */
    public deselectRowsWithNoEvent(rowIDs: any[]): void {
        rowIDs.forEach(rowID => this.rowSelection.delete(rowID));
        this.allRowsSelected = undefined;
        this.selectedRowsChange.next();
    }

    public isRowSelected(rowID): boolean {
        return this.rowSelection.size > 0 && this.rowSelection.has(rowID);
    }

    public isRowInIndeterminateState(rowID): boolean {
        return this.indeterminateRows.size > 0 && this.indeterminateRows.has(rowID);
    }

    /** Select range from last selected row to the current specified row. */
    public selectMultipleRows(rowID, rowData, event?): void {
        this.allRowsSelected = undefined;
        if (!this.rowSelection.size || this.isRowDeleted(rowID)) {
            this.selectRowById(rowID);
            return;
        }
        const gridData = this.allData;
        const lastRowID = this.getSelectedRows()[this.rowSelection.size - 1];
        const currIndex = gridData.indexOf(this.getRowDataById(lastRowID));
        const newIndex = gridData.indexOf(rowData);
        const rows = gridData.slice(Math.min(currIndex, newIndex), Math.max(currIndex, newIndex) + 1);

        const added = this.getRowIDs(rows).filter(rID => !this.isRowSelected(rID));
        const newSelection = this.getSelectedRows().concat(added);
        this.selectedRowsChange.next();
        this.emitRowSelectionEvent(newSelection, added, [], event);
    }

    public areAllRowSelected(): boolean {
        if (!this.grid.data) {
            return false;
        }
        if (this.allRowsSelected !== undefined) {
            return this.allRowsSelected;
        }

        const dataItemsID = this.getRowIDs(this.allData);
        return this.allRowsSelected = Math.min(this.rowSelection.size, dataItemsID.length) > 0 &&
            new Set(Array.from(this.rowSelection.values()).concat(dataItemsID)).size === this.rowSelection.size;
    }

    public hasSomeRowSelected(): boolean {
        const filteredData = this.isFilteringApplied() ?
            this.getRowIDs(this.grid.filteredData).some(rID => this.isRowSelected(rID)) : true;
        return this.rowSelection.size > 0 && filteredData && !this.areAllRowSelected();
    }

    public get filteredSelectedRowIds(): any[] {
        return this.isFilteringApplied() ?
            this.getRowIDs(this.allData).filter(rowID => this.isRowSelected(rowID)) :
            this.getSelectedRows().filter(rowID => !this.isRowDeleted(rowID));
    }

    public emitRowSelectionEvent(newSelection, added, removed, event?): boolean {
        const currSelection = this.getSelectedRows();
        if (this.areEqualCollections(currSelection, newSelection)) {
            return;
        }

        const args = {
            oldSelection: currSelection, newSelection,
            added, removed, event, cancel: false
        };
        this.grid.onRowSelectionChange.emit(args);
        if (args.cancel) {
            return;
        }
        this.selectRowsWithNoEvent(args.newSelection, true);
    }

    public getRowDataById(rowID): any {
        if (!this.grid.primaryKey) {
            return rowID;
        }
        const rowIndex = this.getRowIDs(this.grid.gridAPI.get_all_data(true)).indexOf(rowID);
        return rowIndex < 0 ? {} : this.grid.gridAPI.get_all_data(true)[rowIndex];
    }

    public getRowIDs(data): Array<any> {
        return this.grid.primaryKey && data.length ? data.map(rec => rec[this.grid.primaryKey]) : data;
    }

    public clearHeaderCBState(): void {
        this.allRowsSelected = undefined;
    }

    /** Clear rowSelection and update checkbox state */
    public clearAllSelectedRows(): void {
        this.rowSelection.clear();
        this.indeterminateRows.clear();
        this.clearHeaderCBState();
        this.selectedRowsChange.next();
    }

    /** Returns all data in the grid, with applied filtering and sorting and without deleted rows. */
    public get allData(): Array<any> {
        let allData;
        if (this.isFilteringApplied() || this.grid.sortingExpressions.length) {
            allData = this.grid.pinnedRecordsCount ? this.grid._filteredSortedUnpinnedData : this.grid.filteredSortedData;
        } else {
            allData = this.grid.gridAPI.get_all_data(true);
        }
        return allData.filter(rData => !this.isRowDeleted(this.grid.gridAPI.get_row_id(rData)));
    }

    /** Returns array of the selected columns fields. */
    public getSelectedColumns(): Array<any> {
        return this.columnSelection.size ? Array.from(this.columnSelection.keys()) : [];
    }

    public isColumnSelected(field: string): boolean {
        return this.columnSelection.size > 0 && this.columnSelection.has(field);
    }

    /** Select the specified column and emit event. */
    public selectColumn(field: string, clearPrevSelection?, selectColumnsRange?, event?): void {
        const stateColumn = this.columnsState.field ? this.grid.getColumnByName(this.columnsState.field) : null;
        if (!event || !stateColumn || stateColumn.visibleIndex < 0 || !selectColumnsRange) {
            this.columnsState.field = field;
            this.columnsState.range = [];

            const newSelection = clearPrevSelection ? [field] : this.getSelectedColumns().indexOf(field) !== -1 ?
                this.getSelectedColumns() : [...this.getSelectedColumns(), field];
            const removed = clearPrevSelection ? this.getSelectedColumns().filter(colField => colField !== field) : [];
            const added = this.isColumnSelected(field) ? [] : [field];
            this.emitColumnSelectionEvent(newSelection, added, removed, event);
        } else if (selectColumnsRange) {
            this.selectColumnsRange(field, event);
        }
    }

    /** Select specified columns. And emit event. */
    public selectColumns(fields: string[], clearPrevSelection?, selectColumnsRange?, event?): void {
        const columns = fields.map(f => this.grid.getColumnByName(f)).sort((a, b) => a.visibleIndex - b.visibleIndex);
        const stateColumn = this.columnsState.field ? this.grid.getColumnByName(this.columnsState.field) : null;
        if (!stateColumn || stateColumn.visibleIndex < 0 || !selectColumnsRange) {
            this.columnsState.field = columns[0] ? columns[0].field : null;
            this.columnsState.range = [];

            const added = fields.filter(colField => !this.isColumnSelected(colField));
            const removed = clearPrevSelection ? this.getSelectedColumns().filter(colField => fields.indexOf(colField) === -1) : [];
            const newSelection = clearPrevSelection ? fields : this.getSelectedColumns().concat(added);

            this.emitColumnSelectionEvent(newSelection, added, removed, event);
        } else {
            const filedStart = stateColumn.visibleIndex >
                columns[columns.length - 1].visibleIndex ? columns[0].field : columns[columns.length - 1].field;
            this.selectColumnsRange(filedStart, event);
        }
    }

    /** Select range from last clicked column to the current specified column. */
    public selectColumnsRange(field: string, event): void {
        const currIndex = this.grid.getColumnByName(this.columnsState.field).visibleIndex;
        const newIndex = this.grid.columnToVisibleIndex(field);
        const columnsFields = this.grid.visibleColumns
            .filter(c => !c.columnGroup)
            .sort((a, b) => a.visibleIndex - b.visibleIndex)
            .slice(Math.min(currIndex, newIndex), Math.max(currIndex, newIndex) + 1)
            .filter(col => col.selectable).map(col => col.field);
        const removed = [];
        const oldAdded = [];
        const added = columnsFields.filter(colField => !this.isColumnSelected(colField));
        this.columnsState.range.forEach(f => {
            if (columnsFields.indexOf(f) === -1) {
                removed.push(f);
            } else {
                oldAdded.push(f);
            }
        });
        this.columnsState.range = columnsFields.filter(colField => !this.isColumnSelected(colField) || oldAdded.indexOf(colField) > -1);
        const newSelection = this.getSelectedColumns().concat(added).filter(c => removed.indexOf(c) === -1);
        this.emitColumnSelectionEvent(newSelection, added, removed, event);
    }

    /** Select specified columns. No event is emitted. */
    public selectColumnsWithNoEvent(fields: string[], clearPrevSelection?): void {
        if (clearPrevSelection) {
            this.columnSelection.clear();
        }
        fields.forEach(field => {
            this.columnSelection.add(field);
        });
    }

    /** Deselect the specified column and emit event. */
    public deselectColumn(field: string, event?): void {
        this.initColumnsState();
        const newSelection = this.getSelectedColumns().filter(c => c !== field);
        this.emitColumnSelectionEvent(newSelection, [], [field], event);
    }

    /** Deselect specified columns. No event is emitted. */
    public deselectColumnsWithNoEvent(fields: string[]): void {
        fields.forEach(field => this.columnSelection.delete(field));
    }

    /** Deselect specified columns. And emit event. */
    public deselectColumns(fields: string[], event?): void {
        const removed = this.getSelectedColumns().filter(colField => fields.indexOf(colField) > -1);
        const newSelection = this.getSelectedColumns().filter(colField => fields.indexOf(colField) === -1);

        this.emitColumnSelectionEvent(newSelection, [], removed, event);
    }

    public emitColumnSelectionEvent(newSelection, added, removed, event?): boolean {
        const currSelection = this.getSelectedColumns();
        if (this.areEqualCollections(currSelection, newSelection)) {
            return;
        }

        const args = {
            oldSelection: currSelection, newSelection,
            added, removed, event, cancel: false
        };
        this.grid.onColumnSelectionChange.emit(args);
        if (args.cancel) {
            return;
        }
        this.selectColumnsWithNoEvent(args.newSelection, true);
    }

    /** Clear columnSelection */
    public clearAllSelectedColumns(): void {
        this.columnSelection.clear();
    }

    protected areEqualCollections(first, second): boolean {
        return first.length === second.length && new Set(first.concat(second)).size === first.length;
    }

    /**
     * (╯°□°）╯︵ ┻━┻
     * Chrome and Chromium don't care about the active
     * range after keyboard navigation, thus this.
     */
    private _moveSelectionChrome(node: Node) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        const range = new Range();
        range.selectNode(node);
        range.collapse(true);
        selection.addRange(range);
    }

    private isFilteringApplied(): boolean {
        const grid = this.grid as IgxGridBaseDirective;
        return !FilteringExpressionsTree.empty(grid.filteringExpressionsTree) ||
            !FilteringExpressionsTree.empty(grid.advancedFilteringExpressionsTree);
    }

    private isRowDeleted(rowID): boolean {
        return this.grid.gridAPI.row_deleted_transaction(rowID);
    }
}

export const isChromium = (): boolean => (/Chrom|e?ium/g.test(navigator.userAgent) ||
    /Google Inc/g.test(navigator.vendor)) && !/Edge/g.test(navigator.userAgent);
