import {
    ChangeDetectorRef,
    DoCheck,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    QueryList,
    ViewChild,
    ViewChildren,
    Directive,
    Output,
    EventEmitter,
    AfterViewInit,
    OnDestroy
} from '@angular/core';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { IgxGridForOfDirective } from '../directives/for-of/for_of.directive';
import { GridBaseAPIService } from './api.service';
import { IgxColumnComponent } from './columns/column.component';
import { TransactionType } from '../services/public_api';
import { IgxGridBaseDirective } from './grid-base.directive';
import { IgxGridSelectionService, IgxGridCRUDService, IgxRow } from './selection/selection.service';
import { GridType } from './common/grid.interface';
import mergeWith from 'lodash.mergewith';
import { cloneValue } from '../core/utils';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[igxRowBaseComponent]'
})
export class IgxRowDirective<T extends IgxGridBaseDirective & GridType> implements DoCheck, AfterViewInit, OnDestroy {
    /**
     * @hidden
     */
    @Output()
    onAnimationEnd = new EventEmitter<IgxRowDirective<T>>();

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public role = 'row';

    /**
     *  The data passed to the row component.
     *
     * ```typescript
     * // get the row data for the first selected row
     * let selectedRowData = this.grid.selectedRows[0].rowData;
     * ```
     */
    @Input()
    public get rowData(): any {
        if (this.inEditMode) {
            return mergeWith(cloneValue(this._rowData), this.grid.transactions.getAggregatedValue(this.rowID, false),
                (objValue, srcValue) => {
                    if (Array.isArray(srcValue)) {
                        return objValue = srcValue;
                    }
                });
        }
        return this._rowData;
    }

    public set rowData(v: any) {
        this._rowData = v;
    }
    /**
     * The index of the row.
     *
     * ```typescript
     * // get the index of the second selected row
     * let selectedRowIndex = this.grid.selectedRows[1].index;
     * ```
     */
    @Input()
    public index: number;

    /**
     * Sets whether this specific row has disabled functionality for editing and row selection.
     * Default value is `false`.
     * ```typescript
     * this.grid.selectedRows[0].pinned = true;
     * ```
     */
    @Input()
    @HostBinding('attr.aria-disabled')
    @HostBinding('class.igx-grid__tr--disabled')
    public disabled = false;

    /**
     * Sets whether the row is pinned.
     * Default value is `false`.
     * ```typescript
     * this.grid.selectedRows[0].pinned = true;
     * ```
     */
    public set pinned(value: boolean) {
        if (value) {
            this.grid.pinRow(this.rowID);
        } else {
            this.grid.unpinRow(this.rowID);
        }
    }

    /**
     * Gets whether the row is pinned.
     * ```typescript
     * let isPinned = row.pinned;
     * ```
     */
    public get pinned(): boolean {
        return this.grid.isRecordPinned(this.rowData);
    }

    @Input()
    public get addRow(): any {
        return this._addRow;
    }

    public set addRow(v: any) {
        this._addRow = v;
    }

    @HostBinding('style.min-height.px')
    get rowHeight() {
        let height = this.grid.rowHeight || 32;
        if (this.grid.hasColumnLayouts) {
            const maxRowSpan = this.grid.multiRowLayoutRowSize;
            height = height * maxRowSpan;
        }
        return this.addRow ? height : null;
    }

    get cellHeight() {
        return this.addRow && !this.inEditMode ? null : this.grid.rowHeight || 32;
    }

    /**
     * @hidden
     */
    @Input()
    public gridID: string;

    /**
     * @hidden
     */
    @ViewChildren('igxDirRef', { read: IgxGridForOfDirective })
    public _virtDirRow: QueryList<IgxGridForOfDirective<any>>;

    public get virtDirRow(): IgxGridForOfDirective<any> {
        return this._virtDirRow ? this._virtDirRow.first : null;
    }

    /**
     * @hidden
     */
    @ViewChild(forwardRef(() => IgxCheckboxComponent), { read: IgxCheckboxComponent })
    public checkboxElement: IgxCheckboxComponent;

    @ViewChildren('cell')
    protected _cells: QueryList<any>;

    /**
     * Gets the rendered cells in the row component.
     *
     * ```typescript
     * // get the cells of the third selected row
     * let selectedRowCells = this.grid.selectedRows[2].cells;
     * ```
     */
    public get cells() {
        const res = new QueryList<any>();
        if (!this._cells) {
            return res;
        }
        const cList = this._cells.filter((item) => item.nativeElement.parentElement !== null)
            .sort((item1, item2) => item1.column.visibleIndex - item2.column.visibleIndex);
        res.reset(cList);
        return res;
    }

    public set cells(cells) {

    }

    @HostBinding('attr.data-rowIndex')
    get dataRowIndex() {
        return this.index;
    }

    /**
     * @hidden
     */
    @HostBinding('class')
    get styleClasses(): string {
        return this.resolveClasses();
    }

    /**
     * @hidden
     */
    @Input()
    @HostBinding('attr.aria-selected')
    get selected(): boolean {
        return this.selectionService.isRowSelected(this.rowID);
    }

    set selected(value: boolean) {
        if (value) {
            this.selectionService.selectRowsWithNoEvent([this.rowID]);
        } else {
            this.selectionService.deselectRowsWithNoEvent([this.rowID]);
        }
        this.grid.cdr.markForCheck();
    }

    /**
     * @hidden
     */
    get columns(): IgxColumnComponent[] {
        return this.grid.visibleColumns;
    }

    /**
     * @hidden
     * @internal
     */
    get viewIndex(): number {
        if ((this.grid as any).groupingExpressions.length) {
            return this.grid.filteredSortedData.indexOf(this.rowData);
        }
        return this.index + this.grid.page * this.grid.perPage;
    }

    /**
     * @hidden
     */
    get pinnedColumns(): IgxColumnComponent[] {
        return this.grid.pinnedColumns;
    }

    /**
     * @hidden
     */
    public get isRoot(): boolean {
        return true;
    }

    /**
     * @hidden
     */
    public get hasChildren(): boolean {
        return false;
    }

    /**
     * @hidden
     */
    get unpinnedColumns(): IgxColumnComponent[] {
        return this.grid.unpinnedColumns;
    }

    /**
     * @hidden
     */
    public get showRowSelectors(): boolean {
        return this.grid.showRowSelectors;
    }

    /** @hidden */
    public get dirty(): boolean {
        const row = this.grid.transactions.getState(this.rowID);
        if (row) {
            return row.type === TransactionType.ADD || row.type === TransactionType.UPDATE;
        }

        return false;
    }

    /**
     * @hidden
     */
    public get rowDraggable(): boolean {
        return this.grid.rowDraggable;
    }

    /** @hidden */
    public get added(): boolean {
        const row = this.grid.transactions.getState(this.rowID);
        if (row) {
            return row.type === TransactionType.ADD;
        }

        return false;
    }

    /** @hidden */
    public get deleted(): boolean {
        return this.gridAPI.row_deleted_transaction(this.rowID);
    }

    /**
     * @hidden
     */
    public get dragging() {
        return this.grid.dragRowID === this.rowID;
    }

    // TODO: Refactor
    public get inEditMode(): boolean {
        if (this.grid.rowEditable) {
            const editRowState = this.crudService.row;
            return (editRowState && editRowState.id === this.rowID) || false;
        } else {
            return false;
        }
    }

    /**
     * Get a reference to the grid that contains the selected row.
     *
     * ```typescript
     * handleRowSelection(event) {
     *  // the grid on which the onRowSelectionChange event was triggered
     *  const grid = event.row.grid;
     * }
     * ```
     *
     * ```html
     *  <igx-grid
     *    [data]="data"
     *    (onRowSelectionChange)="handleRowSelection($event)">
     *  </igx-grid>
     * ```
     */
    get grid(): T {
        return this.gridAPI.grid;
    }

    /**
     * Gets the ID of the row.
     * A row in the grid is identified either by:
     * - primaryKey data value,
     * - the whole rowData, if the primaryKey is omitted.
     *
     * ```typescript
     * let rowID = this.grid.selectedRows[2].rowID;
     * ```
     */
    public get rowID() {
        const primaryKey = this.grid.primaryKey;
        return primaryKey ? this._rowData[primaryKey] : this._rowData;
    }

    /**
     * The native DOM element representing the row. Could be null in certain environments.
     *
     * ```typescript
     * // get the nativeElement of the second selected row
     * let selectedRowNativeElement = this.grid.selectedRows[1].nativeElement;
     * ```
     */
    get nativeElement() {
        return this.element.nativeElement;
    }

    /**
     * @hidden
     */
    public focused = false;

    /**
     * @hidden
     * @internal
     */
    public defaultCssClass = 'igx-grid__tr';
    /**
     * @hidden
     */
    public animateAdd = false;

    protected destroy$ = new Subject<any>();
    protected _rowData: any;
    protected _addRow: boolean;

    constructor(
        public gridAPI: GridBaseAPIService<T>,
        public crudService: IgxGridCRUDService,
        public selectionService: IgxGridSelectionService,
        public element: ElementRef<HTMLElement>,
        public cdr: ChangeDetectorRef) { }

    /**
     * @hidden
     * @internal
     */
    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        if (this.grid.rowSelection === 'none' || this.deleted || !this.grid.selectRowOnClick) {
            return;
        }
        if (event.shiftKey && this.grid.isMultiRowSelectionEnabled) {
            this.selectionService.selectMultipleRows(this.rowID, this.rowData, event);
            return;
        }
        this.selectionService.selectRowById(this.rowID, !event.ctrlKey, event);
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('mouseenter')
    public showActionStrip() {
        if (this.grid.actionStrip) {
            this.grid.actionStrip.show(this);
        }
    }

    public ngAfterViewInit() {
        // If the template of the row changes, the forOf in it is recreated and is not detected by the grid and rows can't be scrolled.
        this._virtDirRow.changes.pipe(takeUntil(this.destroy$)).subscribe(() => this.grid.resetHorizontalForOfs());
    }

    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden
     */
    public onRowSelectorClick(event) {
        event.stopPropagation();
        if (event.shiftKey && this.grid.isMultiRowSelectionEnabled) {
            this.selectionService.selectMultipleRows(this.rowID, this.rowData, event);
            return;
        }
        if (this.selected) {
            this.selectionService.deselectRow(this.rowID, event);
        } else {
            this.selectionService.selectRowById(this.rowID, false, event);
        }
    }

    /**
     * Updates the specified row object and the data source record with the passed value.
     * This method emits `onEditDone` event.
     *
     * ```typescript
     * // update the second selected row's value
     * let newValue = "Apple";
     * this.grid.selectedRows[1].update(newValue);
     * ```
     */
    public update(value: any) {
        const crudService = this.crudService;
        if (crudService.cellInEditMode && crudService.cell.id.rowID === this.rowID) {
            this.grid.endEdit(false);
        }
        const row = new IgxRow(this.rowID, this.index, this.rowData, this.grid);
        this.gridAPI.update_row(row, value);
        this.cdr.markForCheck();
    }

    /**
     * Removes the specified row from the grid's data source.
     * This method emits `onRowDeleted` event.
     *
     * ```typescript
     * // delete the third selected row from the grid
     * this.grid.selectedRows[2].delete();
     * ```
     */
    public delete() {
        this.grid.deleteRowById(this.rowID);
    }

    public isCellActive(visibleColumnIndex) {
        const node = this.grid.navigation.activeNode;
        return node ? node.row === this.index && node.column === visibleColumnIndex : false;
    }

    /**
     * Pins the specified row.
     * This method emits `onRowPinning` event.
     *
     * ```typescript
     * // pin the selected row from the grid
     * this.grid.selectedRows[0].pin();
     * ```
     */
    public pin() {
        return this.grid.pinRow(this.rowID);
    }

    /**
     * Unpins the specified row.
     * This method emits `onRowPinning` event.
     *
     * ```typescript
     * // unpin the selected row from the grid
     * this.grid.selectedRows[0].unpin();
     * ```
     */
    public unpin() {
        return this.grid.unpinRow(this.rowID);
    }

    /**
     * @hidden
     */
    get rowCheckboxAriaLabel() {
        return this.grid.primaryKey ?
            this.selected ? 'Deselect row with key ' + this.rowID : 'Select row with key ' + this.rowID :
            this.selected ? 'Deselect row' : 'Select row';
    }

    /**
     * @hidden
     */
    public ngDoCheck() {
        this.cdr.markForCheck();
    }

    /**
     * @hidden
     */
    public shouldDisplayPinnedChip(visibleColumnIndex: number): boolean {
        return this.pinned && this.disabled && visibleColumnIndex === 0;
    }

    public animationEndHandler() {
        this.onAnimationEnd.emit(this);
    }

    /**
     * Spawns the add row UI for the specific row.
     *
     * @example
     * ```typescript
     * const row = this.grid1.getRowByIndex(1);
     * row.beginAddRow();
     * ```
     */
    public beginAddRow() {
        this.grid.beginAddRowByIndex(this.rowID, this.index);
    }

    /**
     * @hidden
     */
    protected resolveClasses(): string {
        const indexClass = this.index % 2 ? this.grid.evenRowCSS : this.grid.oddRowCSS;
        const selectedClass = this.selected ? 'igx-grid__tr--selected' : '';
        const editClass = this.inEditMode ? 'igx-grid__tr--edit' : '';
        const dirtyClass = this.dirty ? 'igx-grid__tr--edited' : '';
        const deletedClass = this.deleted ? 'igx-grid__tr--deleted' : '';
        const mrlClass = this.grid.hasColumnLayouts ? 'igx-grid__tr--mrl' : '';
        const dragClass = this.dragging ? 'igx-grid__tr--drag' : '';
        return `${this.defaultCssClass} ${indexClass} ${selectedClass} ${editClass} ${dirtyClass}
         ${deletedClass} ${mrlClass} ${dragClass}`.trim();
    }

    /**
     * @hidden
     */
    public get resolveDragIndicatorClasses(): string {
        const defaultDragIndicatorCssClass = 'igx-grid__drag-indicator';
        const dragIndicatorOff = this.grid.rowDragging && !this.dragging ? 'igx-grid__drag-indicator--off' : '';
        return `${defaultDragIndicatorCssClass} ${dragIndicatorOff}`;
    }
}
