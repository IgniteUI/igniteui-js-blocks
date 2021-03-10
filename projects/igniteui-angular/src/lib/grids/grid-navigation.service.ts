import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { GridType } from './common/grid.interface';
import {
    NAVIGATION_KEYS,
    ROW_COLLAPSE_KEYS,
    ROW_EXPAND_KEYS,
    SUPPORTED_KEYS,
    HORIZONTAL_NAV_KEYS,
    HEADER_KEYS,
    ROW_ADD_KEYS,
    isEdge
} from '../core/utils';
import { IgxGridBaseDirective } from './grid-base.directive';
import { IMultiRowLayoutNode } from './selection/selection.service';
import { GridKeydownTargetType, GridSelectionMode, FilterMode } from './common/enums';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxGridExcelStyleFilteringComponent } from './filtering/excel-style/grid.excel-style-filtering.component';
import { IActiveNodeChangeEventArgs } from './common/events';
import { IgxGridGroupByRowComponent } from './grid/groupby-row.component';
export interface ColumnGroupsCache {
    level: number;
    visibleIndex: number;
}
export interface IActiveNode {
    gridID?: string;
    row: number;
    column?: number;
    level?: number;
    mchCache?: ColumnGroupsCache;
    layout?: IMultiRowLayoutNode;
}

/** @hidden */
@Injectable()
export class IgxGridNavigationService {
    public grid: IgxGridBaseDirective & GridType;
    public _activeNode: IActiveNode = {} as IActiveNode;
    public lastActiveNode: IActiveNode = {} as IActiveNode;
    protected pendingNavigation = false;

    public get activeNode() {
        return this._activeNode;
    }

    public set activeNode(value: IActiveNode) {
        this._activeNode = value;
    }

    handleNavigation(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (this.grid.crudService.cell && NAVIGATION_KEYS.has(key)) {
            return;
        }
        if (event.repeat && SUPPORTED_KEYS.has(key) || (key === 'tab' && this.grid.crudService.cell)) {
            event.preventDefault();
        }
        if (event.repeat) {
            setTimeout(() => this.dispatchEvent(event), 1);
        } else {
            this.dispatchEvent(event);
        }
    }

    dispatchEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!this.activeNode || !(SUPPORTED_KEYS.has(key) || (key === 'tab' && this.grid.crudService.cell)) &&
            !this.grid.crudService.rowEditingBlocked && !this.grid.rowInEditMode) {
            return;
        }
        const shift = event.shiftKey;
        const ctrl = event.ctrlKey;
        if (NAVIGATION_KEYS.has(key) && this.pendingNavigation) {
            event.preventDefault(); return;
        }

        const type = this.isDataRow(this.activeNode.row) ? 'dataCell' :
            this.isDataRow(this.activeNode.row, true) ? 'summaryCell' : 'groupRow';
        if (this.emitKeyDown(type, this.activeNode.row, event)) {
            return;
        }
        if (event.altKey) {
            this.handleAlt(key, event);
            return;
        }
        if ([' ', 'spacebar', 'space'].indexOf(key) === -1) {
            this.grid.selectionService.keyboardStateOnKeydown(this.activeNode, shift, shift && key === 'tab');
        }
        const position = this.getNextPosition(this.activeNode.row, this.activeNode.column, key, shift, ctrl, event);
        if (NAVIGATION_KEYS.has(key)) {
            event.preventDefault();
            this.navigateInBody(position.rowIndex, position.colIndex, (obj) => {
                obj.target.activate(event);
                this.grid.cdr.detectChanges();
            });
        }
        this.grid.cdr.detectChanges();
    }

    summaryNav(event: KeyboardEvent) {
        if (this.grid.hasSummarizedColumns) {
            this.horizontalNav(event, event.key.toLowerCase(), this.grid.dataView.length, 'summaryCell');
        }
    }

    headerNavigation(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!HEADER_KEYS.has(key)) {
            return;
        }
        event.preventDefault();

        const ctrl = event.ctrlKey;
        const shift = event.shiftKey;
        const alt = event.altKey;

        this.performHeaderKeyCombination(this.currentActiveColumn, key, shift, ctrl, alt, event);
        if (shift || alt || (ctrl && (key.includes('down') || key.includes('down')))) {
            return;
        }
        if (this.grid.hasColumnGroups) {
            this.handleMCHeaderNav(key, ctrl);
        } else {
            this.horizontalNav(event, key, -1, 'headerCell');
        }
    }

    focusTbody(event) {
        const gridRows = this.grid.verticalScrollContainer.totalItemCount ?? this.grid.dataView.length;
        if (gridRows < 1) {
            this.activeNode = null; return;
        }
        if (!this.activeNode || !Object.keys(this.activeNode).length || this.activeNode.row < 0 || this.activeNode.row > gridRows - 1) {
            const hasLastActiveNode = Object.keys(this.lastActiveNode).length;
            const shouldClearSelection = hasLastActiveNode && (this.lastActiveNode.row < 0 || this.lastActiveNode.row > gridRows - 1);
            this.setActiveNode(this.lastActiveNode.row >= 0 && this.lastActiveNode.row < gridRows ?
                this.firstVisibleNode(this.lastActiveNode.row) : this.firstVisibleNode());
            if (shouldClearSelection || (this.grid.cellSelection !== GridSelectionMode.multiple)) {
                this.grid.clearCellSelection();
                this.grid.navigateTo(this.activeNode.row, this.activeNode.column, (obj) => {
                    obj.target?.activate(event);
                    this.grid.cdr.detectChanges();
                } );
            } else {
                const range = { rowStart: this.activeNode.row, rowEnd: this.activeNode.row,
                    columnStart: this.activeNode.column, columnEnd: this.activeNode.column };
                this.grid.selectRange(range);
                this.grid.notifyChanges();
            }
        }
    }

    focusFirstCell(header = true) {
        if ((header || this.grid.dataView.length) && this.activeNode &&
            (this.activeNode.row === -1 || this.activeNode.row === this.grid.dataView.length ||
            (!header && !this.grid.hasSummarizedColumns))) {
            return;
        }
        const shouldScrollIntoView = this.lastActiveNode && (header && this.lastActiveNode.row !== -1) ||
            (!header && this.lastActiveNode.row !== this.grid.dataView.length);
        this.setActiveNode(this.firstVisibleNode(header ? -1 : this.grid.dataView.length));
        if (shouldScrollIntoView) {
            this.performHorizontalScrollToCell(this.activeNode.column);
        }
    }

    public isColumnFullyVisible(columnIndex: number) {
        if (columnIndex < 0 || this.isColumnPinned(columnIndex, this.forOfDir())) {
            return true;
        }
        const index = this.getColumnUnpinnedIndex(columnIndex);
        const width = this.forOfDir().getColumnScrollLeft(index + 1) - this.forOfDir().getColumnScrollLeft(index);
        if (this.displayContainerWidth < width && this.displayContainerScrollLeft === this.forOfDir().getColumnScrollLeft(index)) {
            return true;
        }
        return this.displayContainerWidth >= this.forOfDir().getColumnScrollLeft(index + 1) - this.displayContainerScrollLeft &&
            this.displayContainerScrollLeft <= this.forOfDir().getColumnScrollLeft(index);
    }

    public shouldPerformHorizontalScroll(visibleColIndex: number, rowIndex = -1) {
        if (visibleColIndex < 0 || visibleColIndex > this.grid.visibleColumns.length - 1) {
            return false;
        }
        if (rowIndex < 0 || rowIndex > this.grid.dataView.length - 1) {
            return !this.isColumnFullyVisible(visibleColIndex);
        }
        const row = this.grid.dataView[rowIndex];
        return row.expression || row.detailsData ? false : !this.isColumnFullyVisible(visibleColIndex);
    }

    public shouldPerformVerticalScroll(targetRowIndex: number, visibleColIndex: number): boolean {
        if (this.grid.isRecordPinnedByViewIndex(targetRowIndex)) {
            return false;
        }
        const scrollRowIndex = this.grid.hasPinnedRecords && this.grid.isRowPinningToTop ?
            targetRowIndex - this.grid.pinnedDataView.length : targetRowIndex;
        const targetRow = this.getRowElementByIndex(targetRowIndex);
        const rowHeight = this.grid.verticalScrollContainer.getSizeAt(scrollRowIndex);
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const endTopOffset = targetRow ? targetRow.offsetTop + rowHeight + this.containerTopOffset : containerHeight + rowHeight;
        // this is workaround: endTopOffset - containerHeight > 5 and should be replaced with: containerHeight < endTopOffset
        // when the page is zoomed the grid does not scroll the row completely in the view
        return !targetRow || targetRow.offsetTop < Math.abs(this.containerTopOffset)
            || containerHeight && endTopOffset - containerHeight > 5;
    }

    public performVerticalScrollToCell(rowIndex: number, visibleColIndex = -1, cb?: () => void) {
        if (!this.shouldPerformVerticalScroll(rowIndex, visibleColIndex)) {
            return;
        }
        this.pendingNavigation = true;
        // Only for top pinning we need to subtract pinned count because virtualization indexing doesn't count pinned rows.
        const scrollRowIndex = this.grid.hasPinnedRecords && this.grid.isRowPinningToTop ?
            rowIndex - this.grid.pinnedDataView.length : rowIndex;
        this.grid.verticalScrollContainer.scrollTo(scrollRowIndex);
        this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first()).subscribe(() => {
                this.pendingNavigation = false;
                if (cb) {
                    cb();
                }
            });
    }

    public performHorizontalScrollToCell(visibleColumnIndex: number, cb?: () => void) {
        if (this.grid.rowList < 1 && this.grid.summariesRowList.length < 1 && this.grid.hasColumnGroups) {
            let column = this.grid.getColumnByVisibleIndex(visibleColumnIndex);
            while (column.parent) {
                column = column.parent;
            }
            visibleColumnIndex = this.forOfDir().igxForOf.indexOf(column);
        }
        if (!this.shouldPerformHorizontalScroll(visibleColumnIndex)) {
            return;
        }
        this.pendingNavigation = true;
        this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                this.pendingNavigation = false;
                if (cb) {
                    cb();
                }
            });
        this.forOfDir().scrollTo(this.getColumnUnpinnedIndex(visibleColumnIndex));
    }

    public isDataRow(rowIndex: number, includeSummary = false) {
        if (rowIndex < 0 || rowIndex > this.grid.dataView.length - 1) {
            return false;
        }
        const curRow = this.grid.dataView[rowIndex];
        return curRow && !this.grid.isGroupByRecord(curRow) && !this.grid.isDetailRecord(curRow)
            && !curRow.childGridsData && (includeSummary || !curRow.summaries);
    }

    public isGroupRow(rowIndex: number): boolean {
        if (rowIndex < 0 || rowIndex > this.grid.dataView.length - 1) {
            return false;
        }
        const curRow = this.grid.dataView[rowIndex];
        return curRow && this.grid.isGroupByRecord(curRow);
    }

    public setActiveNode(activeNode: IActiveNode) {
        if (!this.isActiveNodeChanged(activeNode)) {
            return;
        }

        if (!this.activeNode) {
            this.activeNode = activeNode;
        }

        Object.assign(this.activeNode, activeNode);

        const currRow = this.grid.dataView[activeNode.row];
        const type: GridKeydownTargetType = activeNode.row < 0 ? 'headerCell' :
            this.isDataRow(activeNode.row) ? 'dataCell' :
                currRow && this.grid.isGroupByRecord(currRow) ? 'groupRow' :
                    currRow && this.grid.isDetailRecord(currRow) ? 'masterDetailRow' : 'summaryCell';

        const args: IActiveNodeChangeEventArgs = {
            row: this.activeNode.row,
            column: this.activeNode.column,
            level: this.activeNode.level,
            tag: type
        };

        this.grid.activeNodeChange.emit(args);
    }

    public isActiveNodeChanged(activeNode: IActiveNode) {
        let isChanged = false;
        const checkInnerProp = (aciveNode: ColumnGroupsCache | IMultiRowLayoutNode, prop) => {
            if (!aciveNode) {
                isChanged = true;
                return;
            }

            props = Object.getOwnPropertyNames(aciveNode);
            for (const propName of props) {
                if (this.activeNode[prop][propName] !== aciveNode[propName]) {
                    isChanged = true;
                }
            }
        };

        if (!this.activeNode) {
            return isChanged = true;
        }

        let props = Object.getOwnPropertyNames(activeNode);
        for (const propName of props) {
            if (!!this.activeNode[propName] && typeof this.activeNode[propName] === 'object') {
                checkInnerProp(activeNode[propName], propName);
            } else if (this.activeNode[propName] !== activeNode[propName]) {
                isChanged = true;
            }
        }

        return isChanged;
    }

    protected getNextPosition(rowIndex: number, colIndex: number, key: string, shift: boolean, ctrl: boolean, event: KeyboardEvent) {
        if (!this.isDataRow(rowIndex, true) && (key.indexOf('down') < 0 || key.indexOf('up') < 0) && ctrl) {
            return { rowIndex, colIndex };
        }
        switch (key) {
            case 'pagedown':
            case 'pageup':
                event.preventDefault();
                if (key === 'pagedown') {
                    this.grid.verticalScrollContainer.scrollNextPage();
                } else {
                    this.grid.verticalScrollContainer.scrollPrevPage();
                }
                const editCell = this.grid.crudService.cell;
                this.grid.verticalScrollContainer.onChunkLoad
                    .pipe(first()).subscribe(() => {
                        if (editCell && this.grid.rowList.map(r => r.index).indexOf(editCell.rowIndex) < 0) {
                            this.grid.tbody.nativeElement.focus({ preventScroll: true });
                        }
                    });
                break;
            case 'tab':
                this.handleEditing(shift, event);
                break;
            case 'end':
                rowIndex = ctrl ? this.findLastDataRowIndex() : this.activeNode.row;
                colIndex = this.lastColumnIndex;
                break;
            case 'home':
                rowIndex = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row;
                colIndex = 0;
                break;
            case 'arrowleft':
            case 'left':
                colIndex = ctrl ? 0 : this.activeNode.column - 1;
                break;
            case 'arrowright':
            case 'right':
                colIndex = ctrl ? this.lastColumnIndex : this.activeNode.column + 1;
                break;
            case 'arrowup':
            case 'up':
                if (ctrl && !this.isDataRow(rowIndex) || (this.grid.rowEditable && this.grid.crudService.rowEditingBlocked)) {
                    break;
                }
                colIndex = this.activeNode.column !== undefined ? this.activeNode.column : 0;
                rowIndex = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row - 1;
                break;
            case 'arrowdown':
            case 'down':
                if ((ctrl && !this.isDataRow(rowIndex)) || (this.grid.rowEditable && this.grid.crudService.rowEditingBlocked)) {
                    break;
                }
                colIndex = this.activeNode.column !== undefined ? this.activeNode.column : 0;
                rowIndex = ctrl ? this.findLastDataRowIndex() : this.activeNode.row + 1;
                break;
            case 'enter':
            case 'f2':
                const cell = this.grid.getCellByColumnVisibleIndex(this.activeNode.row, this.activeNode.column);
                if (!this.isDataRow(rowIndex) || !cell.editable) {
                    break;
                }
                this.grid.crudService.enterEditMode(cell, event);
                break;
            case 'escape':
            case 'esc':
                if (!this.isDataRow(rowIndex)) {
                    break;
                }

                if (this.grid.crudService.isInCompositionMode) {
                    return;
                }

                if (this.grid.crudService.cellInEditMode || this.grid.crudService.rowInEditMode) {
                    this.grid.endEdit(false, event);
                    if (isEdge()) {
                        this.grid.cdr.detectChanges();
                    }
                    this.grid.tbody.nativeElement.focus();
                }
                break;
            case ' ':
            case 'spacebar':
            case 'space':
                const rowObj = this.grid.getRowByIndex(this.activeNode.row);
                if (this.grid.isRowSelectable && rowObj) {
                    if (this.isDataRow(rowIndex)) {
                        if (rowObj.selected) {
                            this.grid.selectionService.deselectRow(rowObj.rowID, event);
                        } else {
                            this.grid.selectionService.selectRowById(rowObj.rowID, false, event);
                        }
                    }
                    if (this.isGroupRow(rowIndex)) {
                        ((rowObj as any) as IgxGridGroupByRowComponent).onGroupSelectorClick(event);
                    }
                }
                break;
            default:
                return;
        }
        return { rowIndex, colIndex };
    }

    protected horizontalNav(event: KeyboardEvent, key: string, rowIndex: number, tag: GridKeydownTargetType) {
        const ctrl = event.ctrlKey;
        if (!HORIZONTAL_NAV_KEYS.has(event.key.toLowerCase())) {
            return;
        }
        event.preventDefault();
        this.activeNode.row = rowIndex;
        if (rowIndex > 0) {
            if (this.emitKeyDown('summaryCell', this.activeNode.row, event)) {
                return;
            }
        }

        const newActiveNode = {
            column: this.activeNode.column,
            mchCache: {
                level: this.activeNode.level,
                visibleIndex: this.activeNode.column
            }
        };

        if ((key.includes('left') || key === 'home') && this.activeNode.column > 0) {
            newActiveNode.column = ctrl || key === 'home' ? 0 : this.activeNode.column - 1;
        }
        if ((key.includes('right') || key === 'end') && this.activeNode.column < this.lastColumnIndex) {
            newActiveNode.column = ctrl || key === 'end' ? this.lastColumnIndex : this.activeNode.column + 1;
        }

        if (tag === 'headerCell') {
            const column = this.grid.getColumnByVisibleIndex(newActiveNode.column);
            newActiveNode.mchCache.level = column.level;
            newActiveNode.mchCache.visibleIndex = column.visibleIndex;
        }

        this.setActiveNode({ row: this.activeNode.row, column: newActiveNode.column, mchCache: newActiveNode.mchCache });
        this.performHorizontalScrollToCell(this.activeNode.column);
    }

    get lastColumnIndex() {
        return Math.max(...this.grid.visibleColumns.map(col => col.visibleIndex));
    }
    get displayContainerWidth() {
        return Math.round(this.grid.parentVirtDir.dc.instance._viewContainer.element.nativeElement.offsetWidth);
    }
    get displayContainerScrollLeft() {
        return Math.ceil(this.grid.headerContainer.scrollPosition);
    }
    get containerTopOffset() {
        return parseInt(this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
    }

    protected getColumnUnpinnedIndex(visibleColumnIndex: number) {
        const column = this.grid.unpinnedColumns.find((col) => !col.columnGroup && col.visibleIndex === visibleColumnIndex);
        return this.grid.pinnedColumns.length ? this.grid.unpinnedColumns.filter((c) => !c.columnGroup).indexOf(column) :
            visibleColumnIndex;
    }

    protected forOfDir(): IgxForOfDirective<any> {
        const forOfDir = this.grid.dataRowList.length > 0 ? this.grid.dataRowList.first.virtDirRow : this.grid.summariesRowList.length ?
        this.grid.summariesRowList.first.virtDirRow : this.grid.headerContainer;
        return forOfDir as IgxForOfDirective<any>;
    }

    protected handleAlt(key: string, event: KeyboardEvent) {
        event.preventDefault();
        const row = this.grid.getRowByIndex(this.activeNode.row) as any;

        if (!(this.isToggleKey(key) || this.isAddKey(key)) || !row) {
            return;
        }
        if (this.isAddKey(key)) {
            if (!this.grid.rowEditable) {
                console.warn('The grid must be in row edit mode to perform row adding!');
                return;
            }

            if (event.shiftKey && row.treeRow !== undefined) {
                this.grid.beginAddRowByIndex(row.rowID, row.index, true, event);
            } else if (!event.shiftKey) {
                this.grid.beginAddRowByIndex(row.rowID, row.index, false, event);
            }
        } else if (!row.expanded && ROW_EXPAND_KEYS.has(key)) {
            if (row.rowID === undefined) {
                row.toggle();
            } else {
                this.grid.gridAPI.set_row_expansion_state(row.rowID, true, event);
            }
        } else if (row.expanded && ROW_COLLAPSE_KEYS.has(key)) {
            if (row.rowID === undefined) {
                row.toggle();
            } else {
                this.grid.gridAPI.set_row_expansion_state(row.rowID, false, event);
            }
        }
        this.grid.notifyChanges();
    }

    protected handleEditing(shift: boolean, event: KeyboardEvent) {
        const next = shift ? this.grid.getPreviousCell(this.activeNode.row, this.activeNode.column, col => col.editable) :
            this.grid.getNextCell(this.activeNode.row, this.activeNode.column, col => col.editable);
        if (!this.grid.rowInEditMode && this.isActiveNode(next.rowIndex, next.visibleColumnIndex)) {
            this.grid.endEdit(true, event);
            return;
        }
        event.preventDefault();
        if ((this.grid.rowInEditMode && this.grid.rowEditTabs.length) &&
            (this.activeNode.row !== next.rowIndex || this.isActiveNode(next.rowIndex, next.visibleColumnIndex))) {
            if (this.grid.crudService.row?.isAddRow) {
                this.grid.gridAPI.submit_add_value(event);
                const row = this.grid.rowList.find(r => r.rowID === this.grid.crudService.row.id);
                row.rowData = this.grid.crudService.row.data;
            } else {
                this.grid.gridAPI.submit_value(event);
            }
            if (shift) {
                this.grid.rowEditTabs.last.element.nativeElement.focus();
            } else {
                this.grid.rowEditTabs.first.element.nativeElement.focus();
            }
            return;
        }

        if (this.grid.rowInEditMode && !this.grid.rowEditTabs.length) {
            if (shift && next.rowIndex === this.activeNode.row && next.visibleColumnIndex === this.activeNode.column) {
                next.visibleColumnIndex = this.grid.lastEditableColumnIndex;
            } else if (!shift && next.rowIndex === this.activeNode.row && next.visibleColumnIndex === this.activeNode.column) {
                next.visibleColumnIndex = this.grid.firstEditableColumnIndex;
            } else {
                next.rowIndex = this.activeNode.row;
            }
        }

        this.navigateInBody(next.rowIndex, next.visibleColumnIndex, (obj) => {
            obj.target.activate(event);
            this.grid.cdr.detectChanges();
        });
    }

    protected navigateInBody(rowIndex, visibleColIndex, cb: (arg: any) => void = null): void {
        if (!this.isValidPosition(rowIndex, visibleColIndex) || this.isActiveNode(rowIndex, visibleColIndex)) {
            return;
        }
        this.grid.navigateTo(rowIndex, visibleColIndex, cb);
    }


    protected emitKeyDown(type: GridKeydownTargetType, rowIndex, event) {
        const row = this.grid.summariesRowList.toArray().concat(this.grid.rowList.toArray()).find(r => r.index === rowIndex);
        if (!row) {
            return;
        }

        const target = type === 'groupRow' ? row :
            type === 'dataCell' ? row.cells?.find(c => c.visibleColumnIndex === this.activeNode.column) :
                row.summaryCells?.find(c => c.visibleColumnIndex === this.activeNode.column);
        const keydownArgs = { targetType: type, event, cancel: false, target };
        this.grid.onGridKeydown.emit(keydownArgs);
        if (keydownArgs.cancel && type === 'dataCell') {
            this.grid.selectionService.clear();
            this.grid.selectionService.keyboardState.active = true;
            return keydownArgs.cancel;
        }
    }

    protected isColumnPinned(columnIndex: number, forOfDir: IgxForOfDirective<any>): boolean {
        const horizontalScroll = forOfDir.getScroll();
        return (!horizontalScroll.clientWidth || this.grid.getColumnByVisibleIndex(columnIndex)?.pinned);
    }

    protected findFirstDataRowIndex(): number {
        return this.grid.dataView.findIndex(rec => !this.grid.isGroupByRecord(rec) && !this.grid.isDetailRecord(rec) && !rec.summaries);
    }

    protected findLastDataRowIndex(): number {
        if ((this.grid as any).totalItemCount) {
            return (this.grid as any).totalItemCount - 1;
        }
        let i = this.grid.dataView.length;
        while (i--) {
            if (this.isDataRow(i)) {
                return i;
            }
        }
    }

    protected getRowElementByIndex(index) {
        if (this.grid.hasDetails) {
            const detail = this.grid.nativeElement.querySelector(`[detail="true"][data-rowindex="${index}"]`);
            if (detail) {
                return detail;
            }
        }
        return this.grid.rowList.toArray().concat(this.grid.summariesRowList.toArray()).find(r => r.index === index)?.nativeElement;
    }

    protected isValidPosition(rowIndex: number, colIndex: number): boolean {
        const length = (this.grid as any).totalItemCount ?? this.grid.dataView.length;
        if (rowIndex < 0 || colIndex < 0 || length - 1 < rowIndex || this.lastColumnIndex < colIndex) {
            return false;
        }
        return this.activeNode.column !== colIndex && !this.isDataRow(rowIndex, true) ? false : true;
    }
    protected performHeaderKeyCombination(column, key, shift, ctrl, alt, event) {
        let direction = this.grid.sortingExpressions.find(expr => expr.fieldName === column.field)?.dir;
        if (ctrl && key.includes('up') && column.sortable && !column.columnGroup) {
            direction = direction === SortingDirection.Asc ? SortingDirection.None : SortingDirection.Asc;
            this.grid.sort({ fieldName: column.field, dir: direction, ignoreCase: false });
            return;
        }
        if (ctrl && key.includes('down') && column.sortable && !column.columnGroup) {
            direction = direction === SortingDirection.Desc ? SortingDirection.None : SortingDirection.Desc;
            this.grid.sort({ fieldName: column.field, dir: direction, ignoreCase: false });
            return;
        }
        if (shift && alt && this.isToggleKey(key) && !column.columnGroup && column.groupable) {
            direction = direction ? SortingDirection.Desc : SortingDirection.Asc;
            if (key.includes('right')) {
                (this.grid as any).groupBy({ fieldName: column.field, dir: direction, ignoreCase: false });
            } else {
                (this.grid as any).clearGrouping(column.field);
            }
            this.activeNode.column = key.includes('right') && (this.grid as any).hideGroupedColumns &&
                column.visibleIndex === this.lastColumnIndex ? this.lastColumnIndex - 1 : this.activeNode.column;
            return;
        }
        if (alt && (ROW_EXPAND_KEYS.has(key) || ROW_COLLAPSE_KEYS.has(key))) {
            this.handleMCHExpandCollapse(key, column);
            return;
        }
        if ([' ', 'spacebar', 'space'].indexOf(key) !== -1) {
            this.handleColumnSelection(column, event);
        }
        if (alt && (key === 'l' || key === '¬') && this.grid.allowAdvancedFiltering) {
            this.grid.openAdvancedFilteringDialog();
        }
        if (ctrl && shift && key === 'l' && this.grid.allowFiltering && !column.columnGroup && column.filterable) {
            if (this.grid.filterMode === FilterMode.excelStyleFilter) {
                const headerEl = this.grid.nativeElement.querySelector(`.igx-grid__th--active`);
                this.grid.filteringService.toggleFilterDropdown(headerEl, column, IgxGridExcelStyleFilteringComponent);
            } else {
                this.performHorizontalScrollToCell(column.visibleIndex);
                this.grid.filteringService.filteredColumn = column;
                this.grid.filteringService.isFilterRowVisible = true;
            }
        }
    }

    private  firstVisibleNode(rowIndex?) {
        const colIndex = this.lastActiveNode.column !== undefined ? this.lastActiveNode.column :
            this.grid.visibleColumns.sort((c1, c2) => c1.visibleIndex - c2.visibleIndex)
            .find(c => this.isColumnFullyVisible(c.visibleIndex))?.visibleIndex;
        const column = this.grid.visibleColumns.find((col) => !col.columnLayout && col.visibleIndex === colIndex);
        const rowInd = rowIndex ? rowIndex : this.grid.rowList.find(r => !this.shouldPerformVerticalScroll(r.index, colIndex))?.index;
        const node = { row: rowInd ?? 0,
            column: column?.visibleIndex ?? 0, level: column?.level ?? 0,
            mchCache: column ? {level: column.level, visibleIndex: column.visibleIndex} : {} as ColumnGroupsCache,
            layout: column && column.columnLayoutChild ? { rowStart: column.rowStart, colStart: column.colStart,
                rowEnd: column.rowEnd, colEnd: column.colEnd, columnVisibleIndex: column.visibleIndex} : null };
        return node;
    }

    private handleMCHeaderNav(key: string, ctrl: boolean) {
        const newHeaderNode: ColumnGroupsCache = {
            visibleIndex: this.activeNode.mchCache.visibleIndex,
            level: this.activeNode.mchCache.level
        };
        const activeCol = this.currentActiveColumn;
        const lastGroupIndex = Math.max(... this.grid.visibleColumns.
            filter(c => c.level <= this.activeNode.level).map(col => col.visibleIndex));
        let nextCol = activeCol;
        if ((key.includes('left') || key === 'home') && this.activeNode.column > 0) {
            const index = ctrl || key === 'home' ? 0 : this.activeNode.column - 1;
            nextCol = this.getNextColumnMCH(index);
            newHeaderNode.visibleIndex = nextCol.visibleIndex;
        }
        if ((key.includes('right') || key === 'end') && activeCol.visibleIndex < lastGroupIndex) {
            const nextVIndex = activeCol.children ? Math.max(...activeCol.allChildren.map(c => c.visibleIndex)) + 1 :
                activeCol.visibleIndex + 1;
            nextCol = ctrl || key === 'end' ? this.getNextColumnMCH(this.lastColumnIndex) : this.getNextColumnMCH(nextVIndex);
            newHeaderNode.visibleIndex = nextCol.visibleIndex;
        }
        if (!ctrl && key.includes('up') && this.activeNode.level > 0) {
            nextCol = activeCol.parent;
            newHeaderNode.level = nextCol.level;
        }
        if (!ctrl && key.includes('down') && activeCol.children) {
            nextCol = activeCol.children.find(c => c.visibleIndex === newHeaderNode.visibleIndex) ||
                activeCol.children.toArray().sort((a, b) => b.visibleIndex - a.visibleIndex)
                    .filter(col => col.visibleIndex < newHeaderNode.visibleIndex)[0];
            newHeaderNode.level = nextCol.level;
        }

        this.setActiveNode({
            row: this.activeNode.row,
            column: nextCol.visibleIndex,
            level: nextCol.level,
            mchCache: newHeaderNode
        });
        this.performHorizontalScrollToCell(nextCol.visibleIndex);
    }

    private handleMCHExpandCollapse(key, column) {
        if (!column.children || !column.collapsible) {
            return;
        }
        if (!column.expanded && ROW_EXPAND_KEYS.has(key)) {
            column.expanded = true;
        } else if (column.expanded && ROW_COLLAPSE_KEYS.has(key)) {
            column.expanded = false;
        }
    }

    private handleColumnSelection(column, event) {
        if (!column.selectable || this.grid.columnSelection === GridSelectionMode.none) {
            return;
        }
        const clearSelection = this.grid.columnSelection === GridSelectionMode.single;
        const columnsToSelect = !column.children ? [column.field] :
            column.allChildren.filter(c => !c.hidden && c.selectable && !c.columnGroup).map(c => c.field);
        if (column.selected) {
            this.grid.selectionService.deselectColumns(columnsToSelect, event);
        } else {
            this.grid.selectionService.selectColumns(columnsToSelect, clearSelection, false, event);
        }
    }

    private getNextColumnMCH(visibleIndex) {
        let col = this.grid.getColumnByVisibleIndex(visibleIndex);
        let parent = col.parent;
        while (parent && col.level > this.activeNode.mchCache.level) {
            col = col.parent;
            parent = col.parent;
        }
        return col;
    }

    private get currentActiveColumn() {
        return this.grid.visibleColumns.find(c => c.visibleIndex === this.activeNode.column && c.level === this.activeNode.level);
    }

    private isActiveNode(rIndex: number, cIndex: number): boolean {
        return this.activeNode ? this.activeNode.row === rIndex && this.activeNode.column === cIndex : false;
    }

    private isToggleKey(key: string): boolean {
        return ROW_COLLAPSE_KEYS.has(key) || ROW_EXPAND_KEYS.has(key);
    }

    private isAddKey(key: string): boolean {
        return ROW_ADD_KEYS.has(key);
    }
}
