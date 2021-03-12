import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    TemplateRef,
    ViewChild,
    NgZone,
    OnInit,
    OnDestroy,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { GridBaseAPIService } from './api.service';
import { getNodeSizeViaRange, isIE, isLeftClick, PlatformUtil } from '../core/utils';
import { IgxGridBaseDirective } from './grid-base.directive';
import { IgxGridSelectionService, ISelectionNode, IgxGridCRUDService } from './selection/selection.service';
import { DeprecateMethod } from '../core/deprecateDecorators';
import { HammerGesturesManager } from '../core/touch';
import { ColumnType } from './common/column.interface';
import { RowType } from './common/row.interface';
import { GridSelectionMode } from './common/enums';
import { GridType } from './common/grid.interface';
import { ISearchInfo } from './grid/public_api';
import { getCurrencySymbol, getLocaleCurrencyCode} from '@angular/common';
import { DataType } from '../data-operations/data-util';

/**
 * Providing reference to `IgxGridCellComponent`:
 * ```typescript
 * @ViewChild('grid', { read: IgxGridComponent })
 *  public grid: IgxGridComponent;
 * ```
 * ```typescript
 *  let column = this.grid.columnList.first;
 * ```
 * ```typescript
 *  let cell = column.cells[0];
 * ```
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-cell',
    templateUrl: './cell.component.html',
    providers: [HammerGesturesManager]
})
export class IgxGridCellComponent implements OnInit, OnChanges, OnDestroy {
    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid__td--new')
    public get isEmptyAddRowCell() {
        return this.row.addRow && (this.value === undefined || this.value === null);
    }

    /**
     * Gets the column of the cell.
     * ```typescript
     *  let cellColumn = this.cell.column;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public column: ColumnType;

    /**
     * Gets the row of the cell.
     * ```typescript
     * let cellRow = this.cell.row;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public row: RowType;

    /**
     * Gets the data of the row of the cell.
     * ```typescript
     * let rowData = this.cell.rowData;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public rowData: any;

    /**
     * Sets/gets the template of the cell.
     * ```html
     * <ng-template #cellTemplate igxCell let-value>
     *   <div style="font-style: oblique; color:blueviolet; background:red">
     *       <span>{{value}}</span>
     *   </div>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild('cellTemplate',{read: TemplateRef})
     * cellTemplate: TemplateRef<any>;
     * ```
     * ```typescript
     * this.cell.cellTemplate = this.cellTemplate;
     * ```
     * ```typescript
     * let template =  this.cell.cellTemplate;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public cellTemplate: TemplateRef<any>;

    @Input()
    public pinnedIndicator: TemplateRef<any>;

    /**
     * Sets/gets the cell value.
     * ```typescript
     * this.cell.value = "Cell Value";
     * ```
     * ```typescript
     * let cellValue = this.cell.value;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public value: any;

    /**
     * Gets the cell formatter.
     * ```typescript
     * let cellForamatter = this.cell.formatter;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public formatter: (value: any) => any;

    /**
     * Gets the cell template context object.
     * ```typescript
     *  let context = this.cell.context();
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get context(): any {
        return {
            $implicit: this.value,
            cell: this
        };
    }

    /**
     * Gets the cell template.
     * ```typescript
     * let template = this.cell.template;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get template(): TemplateRef<any> {
        if (this.editMode) {
            const inlineEditorTemplate = this.column.inlineEditorTemplate;
            return inlineEditorTemplate ? inlineEditorTemplate : this.inlineEditorTemplate;
        }
        if (this.cellTemplate) {
            return this.cellTemplate;
        }
        if (this.grid.rowEditable && this.row.addRow) {
            return this.addRowCellTemplate;
        }
        return this.defaultCellTemplate;
    }

    /**
     * Gets the cell template.
     * ```typescript
     * let template = this.cell.template;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get pinnedIndicatorTemplate() {
        if (this.pinnedIndicator) {
            return this.pinnedIndicator;
        }
        return this.defaultPinnedIndicator;
    }

    /**
     * Gets the `id` of the grid in which the cell is stored.
     * ```typescript
     * let gridId = this.cell.gridID;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get gridID(): any {
        return this.row.gridID;
    }

    /**
     * Gets the grid of the cell.
     * ```typescript
     * let grid = this.cell.grid;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get grid(): any {
        return this.gridAPI.grid;
    }

    /**
     * Gets the `index` of the row where the cell is stored.
     * ```typescript
     * let rowIndex = this.cell.rowIndex;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.data-rowIndex')
    public get rowIndex(): number {
        return this.row.index;
    }

    /**
     * Gets the `index` of the cell column.
     * ```typescript
     * let columnIndex = this.cell.columnIndex;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get columnIndex(): number {
        return this.column.index;
    }

    /**
     * Gets the visible `index` of the in which the cell is stored.
     * ```typescript
     * let visibleColumnIndex = this.cell.visibleColumnIndex;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.data-visibleIndex')
    @Input()
    public get visibleColumnIndex() {
        return this.column.columnLayoutChild ? this.column.visibleIndex : this._vIndex;
    }

    public set visibleColumnIndex(val) {
        this._vIndex = val;
    }

    /**
     * Gets the ID of the cell.
     * ```typescript
     * let cellID = this.cell.cellID;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get cellID() {
        const primaryKey = this.grid.primaryKey;
        const rowID = primaryKey ? this.rowData[primaryKey] : this.rowData;
        return { rowID, columnID: this.columnIndex, rowIndex: this.rowIndex };
    }

    @HostBinding('attr.id')
    public get attrCellID() {
        return `${this.row.gridID}_${this.rowIndex}_${ this.visibleColumnIndex}`;
    }

    @HostBinding('attr.title')
    public get title() {
        return this.editMode || this.cellTemplate ? '' : this.column.dataType === DataType.Percent ?
        this.grid.percentPipe.transform(this.value, this.column.pipeArgs.digitsInfo, this.grid.locale) :
        this.column.dataType === DataType.Currency ?
        this.grid.currencyPipe.transform(this.value, this.currencyCode, this.column.pipeArgs.display,
            this.column.pipeArgs.digitsInfo, this.grid.locale) :
        this.value;
    }

    @HostBinding('class.igx-grid__td--bool-true')
    public get booleanClass() {
        return this.column.dataType === 'boolean' && this.value;
    }

    /**
     * Returns a reference to the nativeElement of the cell.
     * ```typescript
     * let cellNativeElement = this.cell.nativeElement;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get nativeElement(): HTMLElement {
        return this.element.nativeElement;
    }

    /**
     * @hidden
     * @internal
     */
    @Input()
    public get cellSelectionMode() {
        return this._cellSelection;
    }

    public set cellSelectionMode(value) {
        if (this._cellSelection === value) {
            return;
        }
         this.zone.runOutsideAngular(() => {
            if (value === GridSelectionMode.multiple) {
                this.addPointerListeners(value);
            } else {
                this.removePointerListeners(this._cellSelection);
            }
        });
        this._cellSelection = value;
    }

    /**
     * @hidden
     * @internal
     */
    @Input()
    public set lastSearchInfo(value: ISearchInfo) {
        this._lastSearchInfo = value;
        this.highlightText(this._lastSearchInfo.searchText, this._lastSearchInfo.caseSensitive, this._lastSearchInfo.exactMatch);
    }

    /**
     * @hidden
     * @internal
     */
    @Input()
    @HostBinding('class.igx-grid__td--pinned-last')
    public lastPinned = false;

    /**
     * @hidden
     * @internal
     */
    @Input()
    @HostBinding('class.igx-grid__td--pinned-first')
    public firstPinned = false;

    /**
     * Returns whether the cell is in edit mode.
     */
    @Input()
    @HostBinding('class.igx-grid__td--editing')
    public editMode = false;

    /**
     * Sets/get the `role` property of the cell.
     * Default value is `"gridcell"`.
     * ```typescript
     * this.cell.role = 'grid-cell';
     * ```
     * ```typescript
     * let cellRole = this.cell.role;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.role')
    public role = 'gridcell';

    /**
     * Gets whether the cell is editable.
     * ```typescript
     * let isCellReadonly = this.cell.readonly;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.aria-readonly')
    public get readonly(): boolean {
        return !this.editable;
    }

    public get gridRowSpan(): number {
        return this.column.gridRowSpan;
    }

    public get gridColumnSpan(): number {
        return this.column.gridColumnSpan;
    }


    public get rowEnd(): number {
        return this.column.rowEnd;
    }

    public get colEnd(): number {
        return this.column.colEnd;
    }

    public get rowStart(): number {
        return this.column.rowStart;
    }

    public get colStart(): number {
        return this.column.colStart;
    }

    /**
     * Gets the width of the cell.
     * ```typescript
     * let cellWidth = this.cell.width;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public width = '';

    /**
     * @hidden
     */
    @Input()
    @HostBinding('class.igx-grid__td--active')
    public active = false;

    @HostBinding('attr.aria-selected')
    public get ariaSelected() {
        return this.selected || this.column.selected  || this.row.selected;
    }

    /**
     * Gets whether the cell is selected.
     * ```typescript
     * let isSelected = this.cell.selected;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @HostBinding('class.igx-grid__td--selected')
    public get selected() {
        return this.selectionService.selected(this.selectionNode);
    }

    /**
     * Selects/deselects the cell.
     * ```typescript
     * this.cell.selected = true.
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public set selected(val: boolean) {
        const node = this.selectionNode;
        if (val) {
            this.selectionService.add(node);
        } else {
            this.selectionService.remove(node);
        }
        this.grid.notifyChanges();
    }

    /**
     * Gets whether the cell column is selected.
     * ```typescript
     * let isCellColumnSelected = this.cell.columnSelected;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @HostBinding('class.igx-grid__td--column-selected')
    public get columnSelected() {
        return this.selectionService.isColumnSelected(this.column.field);
    }

    /**
     * Sets the current edit value while a cell is in edit mode.
     * Only for cell editing mode.
     * ```typescript
     * this.cell.editValue = value;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public set editValue(value) {
        if (this.crudService.cellInEditMode) {
            this.crudService.cell.editValue = value;
        }
    }

    /**
     * Gets the current edit value while a cell is in edit mode.
     * Only for cell editing mode.
     * ```typescript
     * let editValue = this.cell.editValue;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get editValue() {
        if (this.crudService.cellInEditMode) {
            return this.crudService.cell.editValue;
        }
    }

    /**
     * Returns whether the cell is editable.
     */
    public get editable(): boolean {
        return this.column.editable && !this.row.disabled;
    }

    /**
     * @hidden
     */
    @Input()
    @HostBinding('class.igx-grid__td--row-pinned-first')
    public displayPinnedChip = false;


    @ViewChild('defaultCell', { read: TemplateRef, static: true })
    protected defaultCellTemplate: TemplateRef<any>;

    @ViewChild('defaultPinnedIndicator', { read: TemplateRef, static: true })
    protected defaultPinnedIndicator: TemplateRef<any>;

    @ViewChild('inlineEditor', { read: TemplateRef, static: true })
    protected inlineEditorTemplate: TemplateRef<any>;

    @ViewChild('addRowCell', { read: TemplateRef, static: true})
    protected addRowCellTemplate: TemplateRef<any>;

    @ViewChild(IgxTextHighlightDirective, { read: IgxTextHighlightDirective })
    protected set highlight(value: IgxTextHighlightDirective) {
        this._highlight = value;

        if (this._highlight && this.grid.lastSearchInfo.searchText) {
            this._highlight.highlight(this.grid.lastSearchInfo.searchText,
                this.grid.lastSearchInfo.caseSensitive,
                this.grid.lastSearchInfo.exactMatch);
            this._highlight.activateIfNecessary();
        }
    }

    protected get highlight() {
        return this._highlight;
    }

    protected get selectionNode(): ISelectionNode {
        return {
            row: this.rowIndex,
            column: this.column.columnLayoutChild ? this.column.parent.visibleIndex : this.visibleColumnIndex,
            layout: this.column.columnLayoutChild ? {
                rowStart: this.column.rowStart,
                colStart: this.column.colStart,
                rowEnd: this.column.rowEnd,
                colEnd: this.column.colEnd,
                columnVisibleIndex: this.visibleColumnIndex
            } : null
            };
    }

    /**
     * Sets/gets the highlight class of the cell.
     * Default value is `"igx-highlight"`.
     * ```typescript
     * let highlightClass = this.cell.highlightClass;
     * ```
     * ```typescript
     * this.cell.highlightClass = 'igx-cell-highlight';
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public highlightClass = 'igx-highlight';

    /**
     * Sets/gets the active highlight class class of the cell.
     * Default value is `"igx-highlight__active"`.
     * ```typescript
     * let activeHighlightClass = this.cell.activeHighlightClass;
     * ```
     * ```typescript
     * this.cell.activeHighlightClass = 'igx-cell-highlight_active';
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public activeHighlightClass = 'igx-highlight__active';

    /** @hidden @internal */
    public get step(): number {
        const digitsInfo = this.column.pipeArgs.digitsInfo;
        if (!digitsInfo) {
            return 1;
        }
        const step = +digitsInfo.substr(digitsInfo.indexOf('.') + 1, 1);
        return 1 / (Math.pow(10, step));
    }

    /** @hidden @internal */
    public get currencyCode(): string {
        return this.column.pipeArgs.currencyCode ?
            this.column.pipeArgs.currencyCode  : getLocaleCurrencyCode(this.grid.locale);
    }

    /** @hidden @internal */
    public get currencyCodeSymbol(): string {
        return getCurrencySymbol(this.currencyCode, 'wide', this.grid.locale);
    }

    /** @hidden @internal @deprecated */
    public focused = this.active;
    protected compositionStartHandler;
    protected compositionEndHandler;
    protected _lastSearchInfo: ISearchInfo;
    private _highlight: IgxTextHighlightDirective;
    private _cellSelection = GridSelectionMode.multiple;
    private _vIndex = -1;

    constructor(
        protected selectionService: IgxGridSelectionService,
        protected crudService: IgxGridCRUDService,
        public gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        public cdr: ChangeDetectorRef,
        private element: ElementRef,
        protected zone: NgZone,
        private touchManager: HammerGesturesManager,
        protected platformUtil: PlatformUtil) { }

    /**
     * @deprecated
     * Gets whether the cell is selected.
     * ```typescript
     * let isCellSelected = thid.cell.isCellSelected();
     * ```
     * @memberof IgxGridCellComponent
     */
    @DeprecateMethod(`'isCellSelected' is deprecated. Use 'selected' property instead.`)
    public isCellSelected() {
        return this.selectionService.selected(this.selectionNode);
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('dblclick', ['$event'])
    public onDoubleClick = (event: MouseEvent | HammerInput) => {
        if (event.type === 'doubletap') {
            // prevent double-tap to zoom on iOS
            (event as HammerInput).preventDefault();
        }
        if (this.grid.rowEditable && this.row.addRow) {
            this.crudService.enterEditMode(this, event as Event);
        }
        if (this.editable && !this.editMode && !this.row.deleted && !this.crudService.rowEditingBlocked) {
            this.crudService.enterEditMode(this, event as Event);
        }

        this.grid.onDoubleClick.emit({
            cell: this,
            event
        });
    };

    /**
     * @hidden
     * @internal
     */
    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        this.grid.onCellClick.emit({
            cell: this,
            event
        });
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('contextmenu', ['$event'])
    public onContextMenu(event: MouseEvent) {
        this.grid.onContextMenu.emit({
            cell: this,
            event
        });
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnInit() {
        this.zone.runOutsideAngular(() => {
            this.nativeElement.addEventListener('pointerdown', this.pointerdown);
            this.addPointerListeners(this.cellSelectionMode);
            // IE 11 workarounds
            if (this.platformUtil.isBrowser && isIE()) { // TODO: Move isIE to platformUtil
                this.compositionStartHandler = () => this.crudService.isInCompositionMode = true;
                this.compositionEndHandler = () => this.crudService.isInCompositionMode = false;
                // Hitting Enter with IME submits and exits from edit mode instead of first closing the IME dialog
                this.nativeElement.addEventListener('compositionstart', this.compositionStartHandler);
                this.nativeElement.addEventListener('compositionend', this.compositionEndHandler);
            }
        });
        if (this.platformUtil.isIOS) {
            this.touchManager.addEventListener(this.nativeElement, 'doubletap', this.onDoubleClick, {
                cssProps: { } /* don't disable user-select, etc */
            } as HammerOptions);
        }
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnDestroy() {
        this.zone.runOutsideAngular(() => {
            this.nativeElement.removeEventListener('pointerdown', this.pointerdown);
            this.removePointerListeners(this.cellSelectionMode);
            if (this.platformUtil.isBrowser && isIE()) {
                this.nativeElement.removeEventListener('compositionstart', this.compositionStartHandler);
                this.nativeElement.removeEventListener('compositionend', this.compositionEndHandler);
            }
        });
        this.touchManager.destroy();
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.value && !changes.value.firstChange) {
            if (this.highlight) {
                this.highlight.lastSearchInfo.searchedText = this.grid.lastSearchInfo.searchText;
                this.highlight.lastSearchInfo.caseSensitive = this.grid.lastSearchInfo.caseSensitive;
                this.highlight.lastSearchInfo.exactMatch = this.grid.lastSearchInfo.exactMatch;
            }
        }
    }

    /**
     * Starts/ends edit mode for the cell.
     *
     * ```typescript
     * cell.setEditMode(true);
     * ```
     */
    public setEditMode(value: boolean): void {
        if (this.row.deleted) {
            return;
        }
        if (this.editable && value) {
            this.gridAPI.submit_value();
            this.crudService.enterEditMode(this);
        } else {
            this.grid.crudService.exitCellEdit();
        }
        this.grid.notifyChanges();
    }

    /**
     * Sets new value to the cell.
     * ```typescript
     * this.cell.update('New Value');
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    // TODO: Refactor
    public update(val: any) {
        if (this.row.deleted) {
            return;
        }
        const cell = this.crudService.createCell(this);
        const args = this.gridAPI.update_cell(cell, val);
        if (this.crudService.cell && this.crudService.sameCell(cell)) {
            if (args.cancel) {
                return;
            }
            this.grid.crudService.exitCellEdit();
        }
        this.cdr.markForCheck();
    }

    /**
     *
     * @hidden
     * @internal
     */
    public pointerdown = (event: PointerEvent) => {
        if (this.cellSelectionMode !== GridSelectionMode.multiple) {
            this.activate(event);
            return;
        }
        if (!isLeftClick(event)) {
            event.preventDefault();
            this.grid.navigation.setActiveNode({rowIndex: this.rowIndex, colIndex: this.visibleColumnIndex});
            this.selectionService.addKeyboardRange();
            this.selectionService.initKeyboardState();
            this.selectionService.primaryButton = false;
            // Ensure RMB Click on edited cell does not end cell editing
            if (!this.selected) {
                this.gridAPI.submit_value(event);
            }
            return;
        }
        this.selectionService.pointerDown(this.selectionNode, event.shiftKey, event.ctrlKey);
        this.activate(event);
    };

    /**
     *
     * @hidden
     * @internal
     */
    public pointerenter = (event: PointerEvent) => {
        const isHierarchicalGrid =  this.grid.nativeElement.tagName.toLowerCase() === 'igx-hierarchical-grid';
        if (isHierarchicalGrid && (!this.grid.navigation.activeNode.gridID || this.grid.navigation.activeNode.gridID !== this.gridID)) {
            return;
        }
        const dragMode = this.selectionService.pointerEnter(this.selectionNode, event);
        if (dragMode) {
            this.grid.cdr.detectChanges();
            if (isIE()) {
                this.grid.tbody.nativeElement.focus({ preventScroll: true });
            }
        }
    };

    /**
     * @hidden
     * @internal
     */
    public pointerup = (event: PointerEvent) => {
        const isHierarchicalGrid =  this.grid.nativeElement.tagName.toLowerCase() === 'igx-hierarchical-grid';
        if (!isLeftClick(event) || (isHierarchicalGrid && (!this.grid.navigation.activeNode.gridID ||
        this.grid.navigation.activeNode.gridID !== this.gridID))) {
            return;
        }
        if (this.selectionService.pointerUp(this.selectionNode, this.grid.onRangeSelection)) {
            this.grid.cdr.detectChanges();
            if (isIE()) {
                this.grid.tbody.nativeElement.focus({ preventScroll: true });
            }
        }
    };

    /**
     * @hidden
     * @internal
     */
    public activate(event: FocusEvent | KeyboardEvent) {
        const node = this.selectionNode;
        const shouldEmitSelection = !this.selectionService.isActiveNode(node);

        if (this.selectionService.primaryButton) {
            this._updateCRUDStatus(event);

            const activeElement = this.selectionService.activeElement;
            const row = activeElement ? this.gridAPI.get_row_by_index(activeElement.row) : null;
            if ((this.crudService.rowEditingBlocked && row && this.row.rowID !== row.rowID) ||
                (this.crudService.cell && this.crudService.cellEditingBlocked)) {
                return;
            }

            this.selectionService.activeElement = node;
        } else {
            this.selectionService.activeElement = null;
            if (this.crudService.cellInEditMode && !this.editMode) {
                this.gridAPI.submit_value(event);
            }
        }

        this.grid.navigation.setActiveNode({ row: this.rowIndex, column: this.visibleColumnIndex });

        this.selectionService.primaryButton = true;
        if (this.cellSelectionMode === GridSelectionMode.multiple && this.selectionService.activeElement) {
            this.selectionService.add(this.selectionService.activeElement, false); // pointer events handle range generation
            this.selectionService.keyboardStateOnFocus(node, this.grid.onRangeSelection, this.nativeElement);
        }
        if (this.grid.isCellSelectable && shouldEmitSelection) {
            this.grid.onSelection.emit({ cell: this, event });
        }
    }

    /**
     * If the provided string matches the text in the cell, the text gets highlighted.
     * ```typescript
     * this.cell.highlightText('Cell Value', true);
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public highlightText(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        return this.highlight && this.column.searchable ? this.highlight.highlight(text, caseSensitive, exactMatch) : 0;
    }

    /**
     * Clears the highlight of the text in the cell.
     * ```typescript
     * this.cell.clearHighLight();
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public clearHighlight() {
        if (this.highlight && this.column.searchable) {
            this.highlight.clearHighlight();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public calculateSizeToFit(range: any): number {
        return Math.max(...Array.from(this.nativeElement.children)
            .map((child) => getNodeSizeViaRange(range, child)));
    }

    /**
     * @hidden
     * @internal
     */
    public get searchMetadata() {
        const meta = new Map<string, any>();
        meta.set('pinned', this.grid.isRecordPinnedByViewIndex(this.row.index));
        return meta;
    }

    /**
     * @hidden
     * @internal
     */
    private _updateCRUDStatus(event?: Event) {
        if (this.editMode) {
            return;
        }

        const crud = this.crudService;
        const editableCell = this.crudService.cell;
        const editMode = !!(crud.row || crud.cell);

        if (this.editable && editMode && !this.row.deleted) {
            if (editableCell) {
                if (this.row.addRow) {
                    this.gridAPI.update_add_cell(editableCell, editableCell.editValue, event);
                    this.row.rowData = editableCell.rowData;
                } else {
                    this.gridAPI.update_cell(editableCell, editableCell.editValue, event);
                }
                /* This check is related with the following issue #6517:
                 * when edit cell that belongs to a column which is sorted and press tab,
                 * the next cell in edit mode is with wrong value /its context is not updated/;
                 * So we reapply sorting before the next cell enters edit mode.
                 * Also we need to keep the notifyChanges below, because of the current
                 * change detection cycle when we have editing with enabled transactions
                 */
                if (this.grid.sortingExpressions.length && this.grid.sortingExpressions.indexOf(editableCell.column.field)) {
                    this.grid.cdr.detectChanges();
                }

                if (this.crudService.cellEditingBlocked) {
                    return true;
                }

                crud.exitCellEdit(event);
            }
            this.grid.tbody.nativeElement.focus({ preventScroll: true });
            this.grid.notifyChanges();
            crud.enterEditMode(this, event);
            return false;
        }

        if (editableCell && crud.sameRow(this.cellID.rowID)) {
            if (this.row.addRow) {
                this.gridAPI.submit_add_value(event);
                this.row.rowData = editableCell.rowData;
            } else {
                this.gridAPI.submit_value(event);
            }
        } else if (editMode && !crud.sameRow(this.cellID.rowID)) {
            this.grid.endEdit(true, event);
        }
    }

    private addPointerListeners(selection) {
        if (selection !== GridSelectionMode.multiple) {
            return;
        }
        this.nativeElement.addEventListener('pointerenter', this.pointerenter);
        this.nativeElement.addEventListener('pointerup', this.pointerup);
    }

    private  removePointerListeners(selection) {
        if (selection !== GridSelectionMode.multiple) {
            return;
        }
        this.nativeElement.removeEventListener('pointerenter', this.pointerenter);
        this.nativeElement.removeEventListener('pointerup', this.pointerup);
    }
}
