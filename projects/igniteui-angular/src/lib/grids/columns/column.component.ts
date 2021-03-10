import { Subject } from 'rxjs';
import {
    AfterContentInit,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    Input,
    QueryList,
    TemplateRef,
    Output,
    EventEmitter,
    OnDestroy,
} from '@angular/core';
import { notifyChanges } from '../watch-changes';
import { WatchColumnChanges } from '../watch-changes';
import { DataType } from '../../data-operations/data-util';
import {
    IgxFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxNumberFilteringOperand,
    IgxDateFilteringOperand,
    IgxStringFilteringOperand
} from '../../data-operations/filtering-condition';
import { ISortingStrategy, DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { DisplayDensity } from '../../core/displayDensity';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxGridCellComponent } from '../cell.component';
import { IgxRowDirective } from '../row.directive';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { GridBaseAPIService } from '../api.service';
import { GridType } from '../common/grid.interface';
import { IgxGridHeaderComponent } from '../headers/grid-header.component';
import { IgxGridFilteringCellComponent } from '../filtering/base/grid-filtering-cell.component';
import { IgxGridHeaderGroupComponent } from '../headers/grid-header-group.component';
import { getNodeSizeViaRange } from '../../core/utils';
import { IgxSummaryOperand, IgxNumberSummaryOperand, IgxDateSummaryOperand,
    IgxCurrencySummaryOperand, IgxPercentSummaryOperand } from '../summaries/grid-summary';
import {
    IgxCellTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellEditorTemplateDirective,
    IgxCollapsibleIndicatorTemplateDirective,
    IgxFilterCellTemplateDirective
} from './templates.directive';
import { MRLResizeColumnInfo, MRLColumnSizeInfo, IColumnPipeArgs } from './interfaces';
import { DropPosition } from '../moving/moving.service';
import { IgxColumnGroupComponent } from './column-group.component';
import { IColumnVisibilityChangingEventArgs, IPinColumnCancellableEventArgs, IPinColumnEventArgs } from '../common/events';

const DEFAULT_DATE_FORMAT = 'mediumDate';
const DEFAULT_DIGITS_INFO = '1.0-3';

/**
 * **Ignite UI for Angular Column** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid#columns-configuration)
 *
 * The Ignite UI Column is used within an `igx-grid` element to define what data the column will show. Features such as sorting,
 * filtering & editing are enabled at the column level.  You can also provide a template containing custom content inside
 * the column using `ng-template` which will be used for all cells within the column.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-column',
    template: ``
})
export class IgxColumnComponent implements AfterContentInit, OnDestroy {
    /**
     * Sets/gets the `field` value.
     * ```typescript
     * let columnField = this.column.field;
     * ```
     * ```html
     * <igx-column [field] = "'ID'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public field: string;
    /**
     * Sets/gets the `header` value.
     * ```typescript
     * let columnHeader = this.column.header;
     * ```
     * ```html
     * <igx-column [header] = "'ID'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public header = '';
    /**
     * Sets/gets the `title` value.
     * ```typescript
     * let title = this.column.title;
     * ```
     * ```html
     * <igx-column [title] = "'Some column tooltip'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public title = '';
    /**
     * Sets/gets whether the column is sortable.
     * Default value is `false`.
     * ```typescript
     * let isSortable = this.column.sortable;
     * ```
     * ```html
     * <igx-column [sortable] = "true"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input()
    public sortable = false;
    /**
     * Returns if the column is selectable.
     * ```typescript
     * let columnSelectable = this.column.selectable;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input()
    get selectable(): boolean  {
        return this._selectable;
    }

    /**
     * Sets if the column is selectable.
     * Default value is `true`.
     * ```html
     * <igx-column [selectable] = "false"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    set selectable(value: boolean) {
        this._selectable = value;
    }

    /**
     * Sets/gets whether the column is groupable.
     * Default value is `false`.
     * ```typescript
     * let isGroupable = this.column.groupable;
     * ```
     * ```html
     * <igx-column [groupable] = "true"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges(true)
    @WatchColumnChanges()
    @Input()
    groupable = false;
    /**
     * Gets whether the column is editable.
     * Default value is `false`.
     * ```typescript
     * let isEditable = this.column.editable;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input()
    get editable(): boolean {
        // Updating the primary key when grid has transactions (incl. row edit)
        // should not be allowed, as that can corrupt transaction state.
        const rowEditable = this.grid && this.grid.rowEditable;
        const hasTransactions = this.grid && this.grid.transactions.enabled;

        if (this.isPrimaryColumn && (rowEditable || hasTransactions)) {
            return false;
        }

        if (this._editable !== undefined) {
            return this._editable;
        } else {
            return rowEditable;
        }
    }
    /**
     * Sets whether the column is editable.
     * ```typescript
     * this.column.editable = true;
     * ```
     * ```html
     * <igx-column [editable] = "true"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    set editable(editable: boolean) {
        this._editable = editable;
    }
    /**
     * Sets/gets whether the column is filterable.
     * Default value is `true`.
     * ```typescript
     * let isFilterable = this.column.filterable;
     * ```
     * ```html
     * <igx-column [filterable] = "false"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public filterable = true;
    /**
     * Sets/gets whether the column is resizable.
     * Default value is `false`.
     * ```typescript
     * let isResizable = this.column.resizable;
     * ```
     * ```html
     * <igx-column [resizable] = "true"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input()
    public resizable = false;
    /**
     * Gets a value indicating whether the summary for the column is enabled.
     * ```typescript
     * let hasSummary = this.column.hasSummary;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges(true)
    @WatchColumnChanges()
    @Input()
    get hasSummary() {
        return this._hasSummary;
    }
    /**
     * Sets a value indicating whether the summary for the column is enabled.
     * Default value is `false`.
     * ```html
     * <igx-column [hasSummary] = "true"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    set hasSummary(value) {
        this._hasSummary = value;

        if (this.grid) {
            this.grid.summaryService.resetSummaryHeight();
        }
    }
    /**
     * Gets whether the column is hidden.
     * ```typescript
     * let isHidden = this.column.hidden;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges(true)
    @WatchColumnChanges()
    @Input()
    get hidden(): boolean {
        return this._hidden;
    }
    /**
     * Sets the column hidden property.
     * Default value is `false`.
     * ```html
     * <igx-column [hidden] = "true"></igx-column>
     * ```
     *
     * Two-way data binding.
     * ```html
     * <igx-column [(hidden)] = "model.isHidden"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    set hidden(value: boolean) {
        if (this._hidden !== value) {
            this._hidden = value;
            this.hiddenChange.emit(this._hidden);
            if (this.columnLayoutChild && this.parent.hidden !== value) {
                this.parent.hidden = value;
                return;
            }
            if (this.grid) {
                this.grid.endEdit(false);
                this.grid.summaryService.resetSummaryHeight();
                this.grid.filteringService.refreshExpressions();
                this.grid.filteringService.hideFilteringRowOnColumnVisibilityChange(this);
                this.grid.notifyChanges();
            }
        }
    }

    /**
     * Returns if the column is selected.
     * ```typescript
     * let isSelected = this.column.selected;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    get selected(): boolean {
        return this.grid.selectionService.isColumnSelected(this.field);
    }

    /**
     * Select/deselect a column.
     * Default value is `false`.
     * ```typescript
     * this.column.selected = true;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    set selected(value: boolean) {
        if (this.selectable && value !== this.selected) {
            if (value) {
                this.grid.selectionService.selectColumnsWithNoEvent([this.field]);
            } else {
                this.grid.selectionService.deselectColumnsWithNoEvent([this.field]);
            }
            this.grid.notifyChanges();
        }
    }

    /**
     * @hidden
     */
    @Output()
    public hiddenChange = new EventEmitter<boolean>();

    /** @hidden */
    @Output()
    public expandedChange = new EventEmitter<boolean>();

    /** @hidden */
    @Output()
    public collapsibleChange = new EventEmitter<boolean>();
    /** @hidden */
    @Output()
    public visibleWhenCollapsedChange = new EventEmitter<boolean>();

    /** @hidden */
    @Output()
    public onColumnChange = new EventEmitter<void>();

    /**
     * Gets whether the hiding is disabled.
     * ```typescript
     * let isHidingDisabled =  this.column.disableHiding;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    disableHiding = false;
    /**
     * Gets whether the pinning is disabled.
     * ```typescript
     * let isPinningDisabled =  this.column.disablePinning;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    disablePinning = false;
    /**
     * Sets/gets whether the column is movable.
     * Default value is `false`.
     * ```typescript
     * let isMovable = this.column.movable;
     * ```
     * ```html
     * <igx-column [movable] = "true"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @notifyChanges()
    @Input()
    public movable = false;
    /**
     * Gets the `width` of the column.
     * ```typescript
     * let columnWidth = this.column.width;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges(true)
    @WatchColumnChanges()
    @Input()
    public get width(): string {
        return this.widthSetByUser ? this._width : this.defaultWidth;
    }

    /**
     * Sets the `width` of the column.
     * ```html
     * <igx-column [width] = "'25%'"></igx-column>
     * ```
     *
     * Two-way data binding.
     * ```html
     * <igx-column [(width)]="model.columns[0].width"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set width(value: string) {
        if (value) {
            this._calcWidth = null;
            this.calcPixelWidth = NaN;
            this.widthSetByUser = true;
            // width could be passed as number from the template
            // host bindings are not px affixed so we need to ensure we affix simple number strings
            if (typeof(value) === 'number' || value.match(/^[0-9]*$/)) {
                value = value + 'px';
            }
            this._width = value;
            if (this.grid) {
                this.cacheCalcWidth();
            }
            this.widthChange.emit(this._width);
        }
    }

    /**
     * Sets/gets the maximum `width` of the column.
     * ```typescript
     * let columnMaxWidth = this.column.width;
     * ```
     * ```html
     * <igx-column [maxWidth] = "'150px'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input()
    public maxWidth: string;

    /**
     * Sets/gets the class selector of the column header.
     * ```typescript
     * let columnHeaderClass = this.column.headerClasses;
     * ```
     * ```html
     * <igx-column [headerClasses] = "'column-header'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public headerClasses = '';

    /**
     * Sets/gets the class selector of the column group header.
     * ```typescript
     * let columnHeaderClass = this.column.headerGroupClasses;
     * ```
     * ```html
     * <igx-column [headerGroupClasses] = "'column-group-header'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public headerGroupClasses = '';
    /**
     * Sets a conditional class selector of the column cells.
     * Accepts an object literal, containing key-value pairs,
     * where the key is the name of the CSS class, while the
     * value is either a callback function that returns a boolean,
     * or boolean, like so:
     * ```typescript
     * callback = (rowData, columnKey, cellValue, rowIndex) => { return rowData[columnKey] > 6; }
     * cellClasses = { 'className' : this.callback };
     * ```
     * ```html
     * <igx-column [cellClasses] = "cellClasses"></igx-column>
     * <igx-column [cellClasses] = "{'class1' : true }"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public cellClasses: any;

    /**
     * Sets conditional style properties on the column cells.
     * Similar to `ngStyle` it accepts an object literal where the keys are
     * the style properties and the value is the expression to be evaluated.
     * As with `cellClasses` it accepts a callback function.
     * ```typescript
     * styles = {
     *  background: 'royalblue',
     *  color: (rowData, columnKey, cellValue, rowIndex) => value.startsWith('Important') : 'red': 'inherit'
     * }
     * ```
     * ```html
     * <igx-column [cellStyles]="styles"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    cellStyles = null;
    /**
     * When autogenerating columns, the formatter is used to format the display of the column data
     * without modifying the underlying bound values.
     *
     * In this example, we check to see if the column name is Salary, and then provide a method as the column formatter
     * to format the value into a currency string.
     *
     * ```typescript
     * onColumnInit(column: IgxColumnComponent) {
     *   if (column.field == "Salary") {
     *     column.formatter = (salary => this.format(salary));
     *   }
     * }
     *
     * format(value: number) : string {
     *   return formatCurrency(value, "en-us", "$");
     * }
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    formatter: (value: any) => any;
    /**
     * Sets/gets whether the column filtering should be case sensitive.
     * Default value is `true`.
     * ```typescript
     * let filteringIgnoreCase = this.column.filteringIgnoreCase;
     * ```
     * ```html
     * <igx-column [filteringIgnoreCase] = "false"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input()
    public filteringIgnoreCase = true;
    /**
     * Sets/gets whether the column sorting should be case sensitive.
     * Default value is `true`.
     * ```typescript
     * let sortingIgnoreCase = this.column.sortingIgnoreCase;
     * ```
     * ```html
     * <igx-column [sortingIgnoreCase] = "false"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input()
    public sortingIgnoreCase = true;
    /**
     * Sets/gets whether the column is `searchable`.
     * Default value is `true`.
     * ```typescript
     * let isSearchable =  this.column.searchable';
     * ```
     * ```html
     *  <igx-column [searchable] = "false"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public searchable = true;
    /**
     * Sets/gets the data type of the column values.
     * Default value is `string`.
     * ```typescript
     * let columnDataType = this.column.dataType;
     * ```
     * ```html
     * <igx-column [dataType] = "'number'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public dataType: DataType = DataType.String;

    /** @hidden */
    @Input()
    public collapsibleIndicatorTemplate: TemplateRef<any>;

    /**
     * Row index where the current field should end.
     * The amount of rows between rowStart and rowEnd will determine the amount of spanning rows to that field
     * ```html
     * <igx-column-layout>
     *   <igx-column [rowEnd]="2" [rowStart]="1" [colStart]="1"></igx-column>
     * </igx-column-layout>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public rowEnd: number;

    /**
     * Column index where the current field should end.
     * The amount of columns between colStart and colEnd will determine the amount of spanning columns to that field
     * ```html
     * <igx-column-layout>
     *   <igx-column [colEnd]="3" [rowStart]="1" [colStart]="1"></igx-column>
     * </igx-column-layout>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public colEnd: number;

    /**
     * Row index from which the field is starting.
     * ```html
     * <igx-column-layout>
     *   <igx-column [rowStart]="1" [colStart]="1"></igx-column>
     * </igx-column-layout>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input() rowStart: number;

    /**
     * Column index from which the field is starting.
     * ```html
     * <igx-column-layout>
     *   <igx-column [colStart]="1" [rowStart]="1"></igx-column>
     * </igx-column-layout>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input() colStart: number;

    /**
     * @hidden
     */
    @Output()
    public widthChange = new EventEmitter<string>();

    /**
     * @hidden
     */
    @Output()
    public pinnedChange = new EventEmitter<boolean>();
    /**
     * @hidden
     */
    @ContentChild(IgxFilterCellTemplateDirective, { read: IgxFilterCellTemplateDirective })
    public filterCellTemplateDirective: IgxFilterCellTemplateDirective;
    /**
     * @hidden
     */
    @ContentChild(IgxCellTemplateDirective, { read: IgxCellTemplateDirective })
    protected cellTemplate: IgxCellTemplateDirective;
    /**
     * @hidden
     */
    @ContentChildren(IgxCellHeaderTemplateDirective, { read: IgxCellHeaderTemplateDirective, descendants: false })
    protected headTemplate: QueryList<IgxCellHeaderTemplateDirective>;
    /**
     * @hidden
     */
    @ContentChild(IgxCellEditorTemplateDirective, { read: IgxCellEditorTemplateDirective })
    protected editorTemplate: IgxCellEditorTemplateDirective;
    /**
     * @hidden
     */
    @ContentChild(IgxCollapsibleIndicatorTemplateDirective, { read: IgxCollapsibleIndicatorTemplateDirective, static: false })
    protected collapseIndicatorTemplate:  IgxCollapsibleIndicatorTemplateDirective;

    /**
     * @hidden
     */
    public get calcWidth(): any {
        return this.getCalcWidth();
    }

    public calcPixelWidth: number;

    /**
     * @hidden
     */
    public get maxWidthPx() {
        const gridAvailableSize = this.grid.calcWidth;
        const isPercentageWidth = this.maxWidth && typeof this.maxWidth === 'string' && this.maxWidth.indexOf('%') !== -1;
        return isPercentageWidth ?  parseFloat(this.maxWidth) / 100 * gridAvailableSize : parseFloat(this.maxWidth);
    }

    /**
     * @hidden
     */
    public get maxWidthPercent() {
        const gridAvailableSize = this.grid.calcWidth;
        const isPercentageWidth = this.maxWidth && typeof this.maxWidth === 'string' && this.maxWidth.indexOf('%') !== -1;
        return isPercentageWidth ?  parseFloat(this.maxWidth) : parseFloat(this.maxWidth) / gridAvailableSize * 100;
    }

    /**
     * @hidden
     */
    public get minWidthPx() {
        const gridAvailableSize = this.grid.calcWidth;
        const isPercentageWidth = this.minWidth && typeof this.minWidth === 'string' && this.minWidth.indexOf('%') !== -1;
        return isPercentageWidth ?  parseFloat(this.minWidth) / 100 * gridAvailableSize : parseFloat(this.minWidth);
    }

    /**
     * @hidden
     */
    public get minWidthPercent() {
        const gridAvailableSize = this.grid.calcWidth;
        const isPercentageWidth = this.minWidth && typeof this.minWidth === 'string' && this.minWidth.indexOf('%') !== -1;
        return isPercentageWidth ?  parseFloat(this.minWidth) : parseFloat(this.minWidth) / gridAvailableSize * 100;
    }


    /**
     * Sets/gets the minimum `width` of the column.
     * Default value is `88`;
     * ```typescript
     * let columnMinWidth = this.column.minWidth;
     * ```
     * ```html
     * <igx-column [minWidth] = "'100px'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public set minWidth(value: string) {
        const minVal = parseFloat(value);
        if (Number.isNaN(minVal)) {
            return;
        }
        this._defaultMinWidth = value;

    }
    public get minWidth(): string {
        return !this._defaultMinWidth ? this.defaultMinWidth : this._defaultMinWidth;
    }

    /**
     * Gets the column index.
     * ```typescript
     * let columnIndex = this.column.index;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public get index(): number {
        return this.grid.columns.indexOf(this);
    }

    /**
     * Gets whether the column is `pinned`.
     * ```typescript
     * let isPinned = this.column.pinned;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input()
    public get pinned(): boolean {
        return this._pinned;
    }
    /**
     * Sets whether the column is pinned.
     * Default value is `false`.
     * ```html
     * <igx-column [pinned] = "true"></igx-column>
     * ```
     *
     * Two-way data binding.
     * ```html
     * <igx-column [(pinned)] = "model.columns[0].isPinned"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set pinned(value: boolean) {
        if (this._pinned !== value) {
            if (this.grid && this.width && !isNaN(parseInt(this.width, 10))) {
                if (value) {
                    this.pin();
                } else {
                    this.unpin();
                }
                return;
            }
            /* No grid/width available at initialization. `initPinning` in the grid
               will re-init the group (if present)
            */
            this._pinned = value;
            this.pinnedChange.emit(this._pinned);
        }
    }

    /**
     * Gets the column `summaries`.
     * ```typescript
     * let columnSummaries = this.column.summaries;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges(true)
    @WatchColumnChanges()
    @Input()
    public get summaries(): any {
        return this._summaries;
    }
    /**
     * Sets the column `summaries`.
     * ```typescript
     * this.column.summaries = IgxNumberSummaryOperand;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set summaries(classRef: any) {
        this._summaries = new classRef();

        if (this.grid) {
            this.grid.summaryService.removeSummariesCachePerColumn(this.field);
            (this.grid as any)._summaryPipeTrigger++;
            this.grid.summaryService.resetSummaryHeight();
        }
    }
    /**
     * Gets the column `filters`.
     * ```typescript
     * let columnFilters = this.column.filters'
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public get filters(): IgxFilteringOperand {
        return this._filters;
    }
    /**
     * Sets the column `filters`.
     * ```typescript
     * this.column.filters = IgxBooleanFilteringOperand.instance().
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set filters(instance: IgxFilteringOperand) {
        this._filters = instance;
    }
    /**
     * Gets the column `sortStrategy`.
     * ```typescript
     * let sortStrategy = this.column.sortStrategy
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public get sortStrategy(): ISortingStrategy {
        return this._sortStrategy;
    }
    /**
     * Sets the column `sortStrategy`.
     * ```typescript
     * this.column.sortStrategy = new CustomSortingStrategy().
     * class CustomSortingStrategy extends SortingStrategy {...}
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set sortStrategy(classRef: ISortingStrategy) {
        this._sortStrategy = classRef;
    }
    /**
     * Gets the function that compares values for grouping.
     * ```typescript
     * let groupingComparer = this.column.groupingComparer'
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public get groupingComparer(): (a: any, b: any) => number {
        return this._groupingComparer;
    }
    /**
     * Sets a custom function to compare values for grouping.
     * Subsequent values in the sorted data that the function returns 0 for are grouped.
     * ```typescript
     * this.column.groupingComparer = (a: any, b: any) => { return a === b ? 0 : -1; }
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set groupingComparer(funcRef: (a: any, b: any) => number) {
        this._groupingComparer = funcRef;
    }
    /**
     * Gets the default minimum `width` of the column.
     * ```typescript
     * let defaultMinWidth =  this.column.defaultMinWidth;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public get defaultMinWidth(): string {
        if (!this.grid) {
            return '80';
        }
        switch (this.grid.displayDensity) {
            case DisplayDensity.cosy:
                return '64';
            case DisplayDensity.compact:
                return '56';
            default:
                return '80';
        }
    }
    /**
     * The reference to the `igx-grid` owner.
     * ```typescript
     * let gridComponent = this.column.grid;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public get grid(): IgxGridBaseDirective {
        return this.gridAPI.grid;
    }
    /**
     * Returns a reference to the `bodyTemplate`.
     * ```typescript
     * let bodyTemplate = this.column.bodyTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input('cellTemplate')
    get bodyTemplate(): TemplateRef<any> {
        return this._bodyTemplate;
    }
    /**
     * Sets the body template.
     * ```html
     * <ng-template #bodyTemplate igxCell let-val>
     *    <div style = "background-color: yellowgreen" (click) = "changeColor(val)">
     *       <span> {{val}} </span>
     *    </div>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'bodyTemplate'", {read: TemplateRef })
     * public bodyTemplate: TemplateRef<any>;
     * this.column.bodyTemplate = this.bodyTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    set bodyTemplate(template: TemplateRef<any>) {
        this._bodyTemplate = template;
    }
    /**
     * Returns a reference to the header template.
     * ```typescript
     * let headerTemplate = this.column.headerTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    get headerTemplate(): TemplateRef<any> {
        return this._headerTemplate;
    }
    /**
     * Sets the header template.
     * Note that the column header height is fixed and any content bigger than it will be cut off.
     * ```html
     * <ng-template #headerTemplate>
     *   <div style = "background-color:black" (click) = "changeColor(val)">
     *       <span style="color:red" >{{column.field}}</span>
     *   </div>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'headerTemplate'", {read: TemplateRef })
     * public headerTemplate: TemplateRef<any>;
     * this.column.headerTemplate = this.headerTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    set headerTemplate(template: TemplateRef<any>) {
        this._headerTemplate = template;
    }
    /**
     * Returns a reference to the inline editor template.
     * ```typescript
     * let inlineEditorTemplate = this.column.inlineEditorTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input('cellEditorTemplate')
    get inlineEditorTemplate(): TemplateRef<any> {
        return this._inlineEditorTemplate;
    }
    /**
     * Sets the inline editor template.
     * ```html
     * <ng-template #inlineEditorTemplate igxCellEditor let-cell="cell">
     *     <input type="string" [(ngModel)]="cell.value"/>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'inlineEditorTemplate'", {read: TemplateRef })
     * public inlineEditorTemplate: TemplateRef<any>;
     * this.column.inlineEditorTemplate = this.inlineEditorTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    set inlineEditorTemplate(template: TemplateRef<any>) {
        this._inlineEditorTemplate = template;
    }
    /**
     * Returns a reference to the `filterCellTemplate`.
     * ```typescript
     * let filterCellTemplate = this.column.filterCellTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input('filterCellTemplate')
    get filterCellTemplate(): TemplateRef<any> {
        return this._filterCellTemplate;
    }
    /**
     * Sets the quick filter template.
     * ```html
     * <ng-template #filterCellTemplate IgxFilterCellTemplate let-column="column">
     *    <input (input)="onInput()">
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'filterCellTemplate'", {read: TemplateRef })
     * public filterCellTemplate: TemplateRef<any>;
     * this.column.filterCellTemplate = this.filterCellTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    set filterCellTemplate(template: TemplateRef<any>) {
        this._filterCellTemplate = template;
    }

    /**
     * Gets the cells of the column.
     * ```typescript
     * let columnCells =  this.column.cells;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    get cells(): IgxGridCellComponent[] {
        return this.grid.rowList.filter((row) => row instanceof IgxRowDirective)
            .map((row) => {
                if (row.cells) {
                    return row.cells.filter((cell) => cell.columnIndex === this.index);
                }
            }).reduce((a, b) => a.concat(b), []);
    }
    /**
     * Gets the column visible index.
     * If the column is not visible, returns `-1`.
     * ```typescript
     * let visibleColumnIndex =  this.column.visibleIndex;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    get visibleIndex(): number {
        if (!isNaN(this._vIndex)) {
            return this._vIndex;
        }
        const unpinnedColumns = this.grid.unpinnedColumns.filter(c => !c.columnGroup);
        const pinnedColumns = this.grid.pinnedColumns.filter(c => !c.columnGroup);
        let col = this;
        let vIndex = -1;

        if (this.columnGroup) {
            col = this.allChildren.filter(c => !c.columnGroup && !c.hidden)[0] as any;
        }
        if (this.columnLayoutChild) {
            return this.parent.childrenVisibleIndexes.find(x => x.column === this).index;
        }

        if (!this.pinned) {
            const indexInCollection = unpinnedColumns.indexOf(col);
            vIndex = indexInCollection === -1 ?
                -1 :
                (this.grid.isPinningToStart ?
                    pinnedColumns.length + indexInCollection :
                    indexInCollection);
        } else {
            const indexInCollection = pinnedColumns.indexOf(col);
            vIndex = this.grid.isPinningToStart ?
                indexInCollection :
                unpinnedColumns.length + indexInCollection;
        }
        this._vIndex = vIndex;
        return vIndex;
    }
    /**
     * Returns a boolean indicating if the column is a `ColumnGroup`.
     * ```typescript
     * let columnGroup =  this.column.columnGroup;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    get columnGroup() {
        return false;
    }
    /**
     * Returns a boolean indicating if the column is a `ColumnLayout` for multi-row layout.
     * ```typescript
     * let columnGroup =  this.column.columnGroup;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    get columnLayout() {
        return false;
    }

    /**
     * Returns a boolean indicating if the column is a child of a `ColumnLayout` for multi-row layout.
     * ```typescript
     * let columnLayoutChild =  this.column.columnLayoutChild;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    get columnLayoutChild() {
        return this.parent && this.parent.columnLayout;
    }

    /**
     * Returns the children columns collection.
     * Returns an empty array if the column does not contain children columns.
     * ```typescript
     * let childrenColumns =  this.column.allChildren;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    get allChildren(): IgxColumnComponent[] {
        return [];
    }
    /**
     * Returns the level of the column in a column group.
     * Returns `0` if the column doesn't have a `parent`.
     * ```typescript
     * let columnLevel =  this.column.level;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    get level() {
        let ptr = this.parent;
        let lvl = 0;

        while (ptr) {
            lvl++;
            ptr = ptr.parent;
        }
        return lvl;
    }

    get isLastPinned(): boolean {
        return this.grid.isPinningToStart &&
            this.grid.pinnedColumns[this.grid.pinnedColumns.length - 1] === this;
    }

    get isFirstPinned(): boolean {
        const pinnedCols = this.grid.pinnedColumns.filter(x => !x.columnGroup);
        return !this.grid.isPinningToStart && pinnedCols[0] === this;
    }

    get rightPinnedOffset(): string {
        return this.pinned && !this.grid.isPinningToStart ?
            - this.grid.pinnedWidth - this.grid.headerFeaturesWidth + 'px' :
            null;
    }

    get gridRowSpan(): number {
        return this.rowEnd && this.rowStart ? this.rowEnd - this.rowStart : 1;
    }
    get gridColumnSpan(): number {
        return this.colEnd && this.colStart ? this.colEnd - this.colStart : 1;
    }

    /**
     * Indicates whether the column will be visible when its parent is collapsed.
     * ```html
     * <igx-column-group>
     *   <igx-column [visibleWhenCollapsed]="true"></igx-column>
     * </igx-column-group>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges(true)
    @Input()
    set visibleWhenCollapsed(value: boolean) {
        this._visibleWhenCollapsed = value;
        this.visibleWhenCollapsedChange.emit(this._visibleWhenCollapsed);
        if (this.parent) {
            this.parent.setExpandCollapseState();
        }
    }

    get visibleWhenCollapsed(): boolean {
        return this._visibleWhenCollapsed;
    }

    /**
     * @remarks
     * Pass optional parameters for DatePipe and/or DecimalPipe to format the display value for date and numeric columns.
     * Accepts an `IColumnPipeArgs` object with any of the `format`, `timezone` and `digitsInfo` properties.
     * For more details see https://angular.io/api/common/DatePipe and https://angular.io/api/common/DecimalPipe
     * @example
     * ```typescript
     * const pipeArgs: IColumnPipeArgs = {
     *      format: 'longDate',
     *      timezone: 'UTC',
     *      digitsInfo: '1.1-2'
     * }
     * ```
     * ```html
     * <igx-column dataType="date" [pipeArgs]="pipeArgs"></igx-column>
     * <igx-column dataType="number" [pipeArgs]="pipeArgs"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    set pipeArgs(value: IColumnPipeArgs) {
        this._columnPipeArgs = Object.assign(this._columnPipeArgs, value);
        this.grid.summaryService.clearSummaryCache();
        (this.grid as any)._pipeTrigger++;
        this.grid.notifyChanges();
    }
    get pipeArgs(): IColumnPipeArgs {
        return this._columnPipeArgs;
    }

    /**
     * @hidden
     * @internal
     */
    public get collapsible() {
        return false;
    }
    public set collapsible(_value: boolean) {}

    /**
     * @hidden
     * @internal
     */
    public get expanded() {
        return true;
    }
    public set expanded(_value: boolean) {}

    /**
     * hidden
     */
    public defaultWidth: string;

    /**
     * hidden
     */
    public widthSetByUser: boolean;

    /**
     * Returns the filteringExpressionsTree of the column.
     * ```typescript
     * let tree =  this.column.filteringExpressionsTree;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    get filteringExpressionsTree(): FilteringExpressionsTree {
        return this.grid.filteringExpressionsTree.find(this.field) as FilteringExpressionsTree;
    }
    /**
     * Sets/gets the parent column.
     * ```typescript
     * let parentColumn = this.column.parent;
     * ```
     * ```typescript
     * this.column.parent = higherLevelColumn;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public parent = null;
    /**
     * Sets/gets the children columns.
     * ```typescript
     * let columnChildren = this.column.children;
     * ```
     * ```typescript
     * this.column.children = childrenColumns;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public children: QueryList<IgxColumnComponent>;
    /**
     * @hidden
     */
    public destroy$ = new Subject<any>();

    /**
     * @hidden
     */
    protected _applySelectableClass = false;

    protected _vIndex = NaN;
    /**
     * @hidden
     */
    protected _pinned = false;
    /**
     * @hidden
     */
    protected _bodyTemplate: TemplateRef<any>;
    /**
     * @hidden
     */
    protected _headerTemplate: TemplateRef<any>;
    /**
     * @hidden
     */
    protected _inlineEditorTemplate: TemplateRef<any>;
    /**
     * @hidden
     */
    protected _filterCellTemplate: TemplateRef<any>;
    /**
     * @hidden
     */
    protected _summaries = null;
    /**
     * @hidden
     */
    protected _filters = null;
    /**
     * @hidden
     */
    protected _sortStrategy: ISortingStrategy = DefaultSortingStrategy.instance();
    /**
     * @hidden
     */
    protected _groupingComparer: (a: any, b: any) => number;
    /**
     * @hidden
     */
    protected _hidden = false;
    /**
     * @hidden
     */
    protected _index: number;
    /**
     * @hidden
     */
    protected _disablePinning = false;
    /**
     * @hidden
     */
    protected _width: string;
    /**
     * @hidden
     */
    protected _defaultMinWidth = '';
    /**
     * @hidden
     */
    protected _hasSummary = false;
    /**
     * @hidden
     */
    protected _editable: boolean;
    /**
     *  @hidden
     */
    protected _visibleWhenCollapsed;
    /**
     * @hidden
     */
    protected _collapsible = false;
    /**
     * @hidden
     */
    protected _expanded = true;
    /**
     * @hidden
     */
    protected _selectable = true;
    /**
     * @hidden
     */
    protected get isPrimaryColumn(): boolean {
        return this.field !== undefined && this.grid !== undefined && this.field === this.grid.primaryKey;
    }

    private _calcWidth = null;
    private _columnPipeArgs: IColumnPipeArgs = { format: DEFAULT_DATE_FORMAT, digitsInfo: DEFAULT_DIGITS_INFO };

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>, public cdr: ChangeDetectorRef) { }

    /**
     * @hidden
     * @internal
     */
    public resetCaches() {
        this._vIndex = NaN;
        if (this.grid) {
            this.cacheCalcWidth();
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    /**
     * @hidden
     */
    public ngAfterContentInit(): void {
        if (this.cellTemplate) {
            this._bodyTemplate = this.cellTemplate.template;
        }
        if (this.headTemplate && this.headTemplate.length) {
            this._headerTemplate = this.headTemplate.toArray()[0].template;
        }
        if (this.editorTemplate) {
            this._inlineEditorTemplate = this.editorTemplate.template;
        }
        if (this.filterCellTemplateDirective) {
            this._filterCellTemplate = this.filterCellTemplateDirective.template;
        }
        if (!this.summaries) {
            switch (this.dataType) {
                case DataType.String:
                case DataType.Boolean:
                    this.summaries = IgxSummaryOperand;
                    break;
                case DataType.Number:
                    this.summaries = IgxNumberSummaryOperand;
                    break;
                case DataType.Date:
                    this.summaries = IgxDateSummaryOperand;
                    break;
                case DataType.Currency:
                    this.summaries = IgxCurrencySummaryOperand;
                    break;
                case DataType.Percent:
                    this.summaries = IgxPercentSummaryOperand;
                    break;
                default:
                    this.summaries = IgxSummaryOperand;
                    break;
            }
        }
        if (!this.filters) {
            switch (this.dataType) {
                case DataType.Boolean:
                    this.filters = IgxBooleanFilteringOperand.instance();
                    break;
                case DataType.Number:
                case DataType.Currency:
                case DataType.Percent:
                    this.filters = IgxNumberFilteringOperand.instance();
                    break;
                case DataType.Date:
                    this.filters = IgxDateFilteringOperand.instance();
                    break;
                case DataType.String:
                default:
                    this.filters = IgxStringFilteringOperand.instance();
                    break;
            }
        }
    }

    /**
     * @hidden
     */
    getGridTemplate(isRow: boolean, isIE: boolean): string {
        if (isRow) {
            const rowsCount = this.grid.multiRowLayoutRowSize;
            return isIE ?
                `(1fr)[${rowsCount}]` :
                `repeat(${rowsCount},1fr)`;
        } else {
            return this.getColumnSizesString(this.children);
        }
    }

    public getInitialChildColumnSizes(children: QueryList<IgxColumnComponent>): Array<MRLColumnSizeInfo> {
        const columnSizes: MRLColumnSizeInfo[] = [];
        // find the smallest col spans
        children.forEach(col => {
            if (!col.colStart) {
                return;
            }
            const newWidthSet = col.widthSetByUser && columnSizes[col.colStart - 1] && !columnSizes[col.colStart - 1].widthSetByUser;
            const newSpanSmaller = columnSizes[col.colStart - 1] && columnSizes[col.colStart - 1].colSpan > col.gridColumnSpan;
            const bothWidthsSet = col.widthSetByUser && columnSizes[col.colStart - 1] && columnSizes[col.colStart - 1].widthSetByUser;
            const bothWidthsNotSet = !col.widthSetByUser && columnSizes[col.colStart - 1] && !columnSizes[col.colStart - 1].widthSetByUser;

            if (columnSizes[col.colStart - 1] === undefined) {
                // If nothing is defined yet take any column at first
                // We use colEnd to know where the column actually ends, because not always it starts where we have it set in columnSizes.
                columnSizes[col.colStart - 1] = {
                    ref: col,
                    width: col.widthSetByUser || this.grid.columnWidthSetByUser ? parseInt(col.calcWidth, 10) : null,
                    colSpan: col.gridColumnSpan,
                    colEnd: col.colStart + col.gridColumnSpan,
                    widthSetByUser: col.widthSetByUser
                };
            } else if (newWidthSet || (newSpanSmaller && ((bothWidthsSet) || (bothWidthsNotSet)))) {
                // If a column is set already it should either not have width defined or have width with bigger span than the new one.

                /**
                 *  If replaced column has bigger span, we want to fill the remaining columns
                 *  that the replacing column does not fill with the old one.
                 */
                if (bothWidthsSet && newSpanSmaller) {
                    // Start from where the new column set would end and apply the old column to the rest depending on how much it spans.
                    // We have not yet replaced it so we can use it directly from the columnSizes collection.
                    // This is where colEnd is used because the colStart of the old column is not actually i + 1.
                    for (let i = col.colStart - 1 + col.gridColumnSpan; i < columnSizes[col.colStart - 1].colEnd - 1; i++) {
                        if (!columnSizes[i] || !columnSizes[i].widthSetByUser) {
                            columnSizes[i] = columnSizes[col.colStart - 1];
                        } else {
                            break;
                        }
                    }
                }

                // Replace the old column with the new one.
                columnSizes[col.colStart - 1] = {
                    ref: col,
                    width: col.widthSetByUser || this.grid.columnWidthSetByUser ? parseInt(col.calcWidth, 10) : null,
                    colSpan: col.gridColumnSpan,
                    colEnd: col.colStart + col.gridColumnSpan,
                    widthSetByUser: col.widthSetByUser
                };
            } else if (bothWidthsSet && columnSizes[col.colStart - 1].colSpan < col.gridColumnSpan) {
                // If the column already in the columnSizes has smaller span, we still need to fill any empty places with the current col.
                // Start from where the smaller column set would end and apply the bigger column to the rest depending on how much it spans.
                // Since here we do not have it in columnSizes we set it as a new column keeping the same colSpan.
                for (let i = col.colStart - 1 + columnSizes[col.colStart - 1].colSpan; i < col.colStart - 1 + col.gridColumnSpan; i++) {
                    if (!columnSizes[i] || !columnSizes[i].widthSetByUser) {
                        columnSizes[i] = {
                            ref: col,
                            width: col.widthSetByUser || this.grid.columnWidthSetByUser ? parseInt(col.calcWidth, 10) : null,
                            colSpan: col.gridColumnSpan,
                            colEnd: col.colStart + col.gridColumnSpan,
                            widthSetByUser: col.widthSetByUser
                        };
                    } else {
                        break;
                    }
                }
            }
        });

        // Flatten columnSizes so there are not columns with colSpan > 1
        for (let i = 0; i < columnSizes.length; i++) {
            if (columnSizes[i] && columnSizes[i].colSpan > 1) {
                let j = 1;

                // Replace all empty places depending on how much the current column spans starting from next col.
                for (; j < columnSizes[i].colSpan && i + j + 1 < columnSizes[i].colEnd; j++) {
                    if (columnSizes[i + j] &&
                        ((!columnSizes[i].width && columnSizes[i + j].width) ||
                            (!columnSizes[i].width && !columnSizes[i + j].width && columnSizes[i + j].colSpan <= columnSizes[i].colSpan) ||
                            (!!columnSizes[i + j].width && columnSizes[i + j].colSpan <= columnSizes[i].colSpan))) {
                        // If we reach an already defined column that has width and the current doesn't have or
                        // if the reached column has bigger colSpan we stop.
                        break;
                    } else {
                        const width = columnSizes[i].widthSetByUser ?
                            columnSizes[i].width / columnSizes[i].colSpan :
                            columnSizes[i].width;
                        columnSizes[i + j] = {
                            ref: columnSizes[i].ref,
                            width,
                            colSpan: 1,
                            colEnd: columnSizes[i].colEnd,
                            widthSetByUser: columnSizes[i].widthSetByUser
                        };
                    }
                }

                // Update the current column width so it is divided between all columns it spans and set it to 1.
                columnSizes[i].width = columnSizes[i].widthSetByUser ?
                    columnSizes[i].width / columnSizes[i].colSpan :
                    columnSizes[i].width;
                columnSizes[i].colSpan = 1;

                // Update the index based on how much we have replaced. Subtract 1 because we started from 1.
                i += j - 1;
            }
        }

        return columnSizes;
    }

    public getFilledChildColumnSizes(children: QueryList<IgxColumnComponent>): Array<string> {
        const columnSizes = this.getInitialChildColumnSizes(children);

        // fill the gaps if there are any
        const result: string[] = [];
        for (const size of columnSizes) {
            if (size && !!size.width) {
                result.push(size.width + 'px');
            } else {
                result.push(parseInt(this.grid.getPossibleColumnWidth(), 10) + 'px');
            }
        }
        return result;
    }

    public getResizableColUnderEnd(): MRLResizeColumnInfo[] {
        if (this.columnLayout || !this.columnLayoutChild || this.columnGroup) {
            return [{ target: this, spanUsed: 1 }];
        }

        const columnSized = this.getInitialChildColumnSizes(this.parent.children);
        const targets: MRLResizeColumnInfo[] = [];
        const colEnd = this.colEnd ? this.colEnd : this.colStart + 1;

        for (let i = 0; i < columnSized.length; i++) {
            if (this.colStart <= i + 1 && i + 1 < colEnd) {
                targets.push({ target: columnSized[i].ref, spanUsed: 1 });
            }
        }

        const targetsSquashed: MRLResizeColumnInfo[] = [];
        for (const target of targets) {
            if (targetsSquashed.length && targetsSquashed[targetsSquashed.length - 1].target.field === target.target.field) {
                targetsSquashed[targetsSquashed.length - 1].spanUsed++;
            } else {
                targetsSquashed.push(target);
            }
        }

        return targetsSquashed;
    }

    /**
     * Pins the column at the provided index in the pinned area.
     * Defaults to index `0` if not provided, or to the initial index in the pinned area.
     * Returns `true` if the column is successfully pinned. Returns `false` if the column cannot be pinned.
     * Column cannot be pinned if:
     * - Is already pinned
     * - index argument is out of range
     * - The pinned area exceeds 80% of the grid width
     * ```typescript
     * let success = this.column.pin();
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public pin(index?: number): boolean {
        // TODO: Probably should the return type of the old functions
        // should be moved as a event parameter.
        const grid = (this.grid as any);
        if (this._pinned) {
            return false;
        }

        if (this.parent && !this.parent.pinned) {
            return this.topLevelParent.pin(index);
        }

        const hasIndex = index !== undefined;
        if (hasIndex && (index < 0 || index > grid.pinnedColumns.length)) {
            return false;
        }

        if (!this.parent && !this.pinnable) {
            return false;
        }

        const rootPinnedCols = grid._pinnedColumns.filter((c) => c.level === 0);
        index = hasIndex ? index : rootPinnedCols.length;
        const args: IPinColumnCancellableEventArgs = { column: this, insertAtIndex: index, isPinned: false, cancel: false };
        this.grid.onColumnPinning.emit(args);

        if (args.cancel) {
            return;
        }

        grid.endEdit(false);

        this._pinned = true;
        this.pinnedChange.emit(this._pinned);
        // it is possible that index is the last position, so will need to find target column by [index-1]
        const targetColumn = args.insertAtIndex === grid._pinnedColumns.length ?
            grid._pinnedColumns[args.insertAtIndex - 1] : grid._pinnedColumns[args.insertAtIndex];

        if (grid._pinnedColumns.indexOf(this) === -1) {
            if (!grid.hasColumnGroups) {
                grid._pinnedColumns.splice(args.insertAtIndex, 0, this);
            } else {
                // insert based only on root collection
                rootPinnedCols.splice(args.insertAtIndex, 0, this);
                let allPinned = [];
                // re-create hierarchy
                rootPinnedCols.forEach(group => {
                    allPinned.push(group);
                    allPinned = allPinned.concat(group.allChildren);
                });
                grid._pinnedColumns = allPinned;
            }

            if (grid._unpinnedColumns.indexOf(this) !== -1) {
                const childrenCount = this.allChildren.length;
                grid._unpinnedColumns.splice(grid._unpinnedColumns.indexOf(this), 1 + childrenCount);
            }
        }

        if (hasIndex) {
            grid._moveColumns(this, targetColumn);
        }

        if (this.columnGroup) {
            this.allChildren.forEach(child => child.pin());
            grid.reinitPinStates();
        }

        grid.resetCaches();
        grid.notifyChanges();
        if (this.columnLayoutChild) {
            this.grid.columns.filter(x => x.columnLayout).forEach(x => x.populateVisibleIndexes());
        }
        this.grid.filteringService.refreshExpressions();
        const eventArgs: IPinColumnEventArgs = { column: this, insertAtIndex: index, isPinned: true };
        this.grid.columnPinned.emit(eventArgs);
        return true;
    }
    /**
     * Unpins the column and place it at the provided index in the unpinned area.
     * Defaults to index `0` if not provided, or to the initial index in the unpinned area.
     * Returns `true` if the column is successfully unpinned. Returns `false` if the column cannot be unpinned.
     * Column cannot be unpinned if:
     * - Is already unpinned
     * - index argument is out of range
     * ```typescript
     * let success = this.column.unpin();
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public unpin(index?: number): boolean {
        const grid = (this.grid as any);
        if (!this._pinned) {
            return false;
        }

        if (this.parent && this.parent.pinned) {
            return this.topLevelParent.unpin(index);
        }
        const hasIndex = index !== undefined;
        if (hasIndex && (index < 0 || index > grid._unpinnedColumns.length)) {
            return false;
        }

        // estimate the exact index at which column will be inserted
        // takes into account initial unpinned index of the column
        if (!hasIndex) {
            const indices = grid.unpinnedColumns.map(col => col.index);
            indices.push(this.index);
            indices.sort((a, b) => a - b);
            index = indices.indexOf(this.index);
        }

        const args: IPinColumnCancellableEventArgs = { column: this, insertAtIndex: index, isPinned: true, cancel: false };
        this.grid.onColumnPinning.emit(args);

        if (args.cancel) {
            return;
        }

        this.grid.endEdit(false);

        this._pinned = false;
        this.pinnedChange.emit(this._pinned);

        // it is possible that index is the last position, so will need to find target column by [index-1]
        const targetColumn = args.insertAtIndex === grid._unpinnedColumns.length ?
            grid._unpinnedColumns[args.insertAtIndex - 1] : grid._unpinnedColumns[args.insertAtIndex];

        if (!hasIndex) {
            grid._unpinnedColumns.splice(index, 0, this);
            if (grid._pinnedColumns.indexOf(this) !== -1) {
                grid._pinnedColumns.splice(grid._pinnedColumns.indexOf(this), 1);
            }
        }

        if (hasIndex) {
            grid.moveColumn(this, targetColumn);
        }

        if (this.columnGroup) {
            this.allChildren.forEach(child => child.unpin());
        }

        grid.reinitPinStates();
        grid.resetCaches();

        grid.notifyChanges();
        if (this.columnLayoutChild) {
            this.grid.columns.filter(x => x.columnLayout).forEach(x => x.populateVisibleIndexes());
        }
        this.grid.filteringService.refreshExpressions();

        this.grid.columnPinned.emit({ column: this, insertAtIndex: index, isPinned: false });

        return true;
    }

    /**
     * Moves a column to the specified visible index.
     * If passed index is invalid, or if column would receive a different visible index after moving, moving is not performed.
     * If passed index would move the column to a different column group. moving is not performed.
     *
     * @example
     * ```typescript
     * column.move(index);
     * ```
     * @memberof IgxColumnComponent
     */
    public move(index: number) {
        let target;
        const grid = (this.grid as IgxGridBaseDirective);
        let columns: Array<IgxColumnComponent | IgxColumnGroupComponent> = grid.columnList.filter(c => c.visibleIndex > -1);
        // grid last visible index
        const li = columns.map(c => c.visibleIndex).reduce((a, b) => Math.max(a, b));
        const parent = this.parent;
        const isPreceding = this.visibleIndex < index;

        if (index === this.visibleIndex || index < 0 || index > li) {
            return;
        }

        if (parent) {
            columns = columns.filter(c => c.level >= this.level && c !== this && c.parent !== this &&
                c.topLevelParent === this.topLevelParent);
        }
        /* eslint-disable max-len */
        // If isPreceding, find a target such that when the current column is placed after it, current colummn will receive a visibleIndex === index. This takes into account visible children of the columns.
        // If !isPreceding, finds a column of the same level and visible index that equals the passed index agument (c.visibleIndex === index). No need to consider the children here.
        /* eslint-enable max-len */
        if (isPreceding) {
            columns = columns.filter(c => c.visibleIndex > this.visibleIndex);
            target = columns.find(c => c.level === this.level && c.visibleIndex + c.calcChildren() - this.calcChildren() === index);
        } else {
            columns = columns.filter(c => c.visibleIndex < this.visibleIndex);
            target = columns.find(c => c.level === this.level && c.visibleIndex === index);
        }

        if (!target || (target.pinned && this.disablePinning)) {
            return;
        }

        const pos = isPreceding ? DropPosition.AfterDropTarget : DropPosition.BeforeDropTarget;
        grid.moveColumn(this, target as IgxColumnComponent, pos);
    }

    /**
     * No children for the column, so will returns 1 or 0, if the column is hidden.
     *
     * @hidden
     */
    public calcChildren(): number {
        const children = this.hidden ? 0 : 1;
        return children;
    }

    /**
     * Toggles column vibisility and emits the respective event.
     *
     * @hidden
     */
    public toggleVisibility(value?: boolean) {
        const newValue = value ?? !this.hidden;
        const eventArgs: IColumnVisibilityChangingEventArgs = { column: this, newValue, cancel: false };
        this.grid.columnVisibilityChanging.emit(eventArgs);

        if (eventArgs.cancel) {
            return;
        }
        this.hidden = newValue;
        this.grid.onColumnVisibilityChanged.emit({ column: this, newValue });
    }

    /**
     * Returns a reference to the top level parent column.
     * ```typescript
     * let topLevelParent =  this.column.topLevelParent;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    get topLevelParent() {
        let parent = this.parent;
        while (parent && parent.parent) {
            parent = parent.parent;
        }
        return parent;
    }

    /**
     * Returns a reference to the header of the column.
     * ```typescript
     * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
     * let headerCell = column.headerCell;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    get headerCell(): IgxGridHeaderComponent {
        return this.grid.headerCellList.find((header) => header.column === this);
    }

    /**
     * Returns a reference to the filter cell of the column.
     * ```typescript
     * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
     * let filterell = column.filterell;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    get filterCell(): IgxGridFilteringCellComponent {
        return this.grid.filterCellList.find((filterCell) => filterCell.column === this);
    }

    /**
     * Returns a reference to the header group of the column.
     *
     * @memberof IgxColumnComponent
     */
    get headerGroup(): IgxGridHeaderGroupComponent {
        return this.grid.headerGroupsList.find((headerGroup) => headerGroup.column === this);
    }

    /**
     * Autosize the column to the longest currently visible cell value, including the header cell.
     * ```typescript
     * @ViewChild('grid') grid: IgxGridComponent;
     * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
     * column.autosize();
     * ```
     *
     * @memberof IgxColumnComponent
     * @param byHeader Set if column should be autized based only on the header content
     */
    public autosize(byHeader = false) {
        if (!this.columnGroup) {
            const size = this.getAutoSize(byHeader);
            this.width = size;
            this.grid.reflow();
        }
    }

    /**
     * @hidden
     */
    public getAutoSize(byHeader = false) {
        const size = !byHeader ? this.getLargestCellWidth() :
            (Object.values(this.getHeaderCellWidths()).reduce((a, b) => a + b) + 'px');
        const gridAvailableSize = this.grid.calcWidth;
        let newWidth;
        const isPercentageWidth = this.width && typeof this.width === 'string' && this.width.indexOf('%') !== -1;
        if (isPercentageWidth) {
            const percentageSize =  parseFloat(size) / gridAvailableSize * 100;
            newWidth = percentageSize + '%';
        } else {
            newWidth = size;
        }
        return newWidth;
    }

    /**
     * @hidden
     */
    public getCalcWidth(): any {
        if (this._calcWidth && !isNaN(this.calcPixelWidth)) {
            return this._calcWidth;
        }
        this.cacheCalcWidth();
        return this._calcWidth;
    }


    /**
     * @hidden
     * Returns the width and padding of a header cell.
     */
    public getHeaderCellWidths() {
        const range = this.grid.document.createRange();
        let headerWidth;
        if (this.headerTemplate && this.headerCell.elementRef.nativeElement.children[0].children.length > 0) {
            headerWidth = Math.max(...Array.from(this.headerCell.elementRef.nativeElement.children[0].children)
                .map((child) => getNodeSizeViaRange(range, child)));
        } else {
            headerWidth = getNodeSizeViaRange(range, this.headerCell.elementRef.nativeElement.children[0]);
        }

        if (this.sortable || this.filterable) {
            headerWidth += this.headerCell.elementRef.nativeElement.children[1].getBoundingClientRect().width;
        }

        const headerStyle = this.grid.document.defaultView.getComputedStyle(this.headerCell.elementRef.nativeElement);
        const headerPadding = parseFloat(headerStyle.paddingLeft) + parseFloat(headerStyle.paddingRight) +
            parseFloat(headerStyle.borderRightWidth);

        // Take into consideration the header group element, since column pinning applies borders to it if its not a columnGroup.
        const headerGroupStyle = this.grid.document.defaultView.getComputedStyle(this.headerGroup.element.nativeElement);
        const borderSize = !this.parent ? parseFloat(headerGroupStyle.borderRightWidth) + parseFloat(headerGroupStyle.borderLeftWidth) : 0;

        return { width: Math.ceil(headerWidth), padding: Math.ceil(headerPadding + borderSize)};
    }

    /**
     * @hidden
     * Returns the size (in pixels) of the longest currently visible cell, including the header cell.
     * ```typescript
     * @ViewChild('grid') grid: IgxGridComponent;
     *
     * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
     * let size = column.getLargestCellWidth();
     * ```
     * @memberof IgxColumnComponent
     */
    public getLargestCellWidth(): string {
        const range = this.grid.document.createRange();
        const largest = new Map<number, number>();

        if (this.cells.length > 0) {
            let cellsContentWidths = [];
            if (this.cells[0].nativeElement.children.length > 0) {
                this.cells.forEach((cell) => cellsContentWidths.push(cell.calculateSizeToFit(range)));
            } else {
                cellsContentWidths = this.cells.map((cell) => getNodeSizeViaRange(range, cell.nativeElement));
            }

            const index = cellsContentWidths.indexOf(Math.max(...cellsContentWidths));
            const cellStyle = this.grid.document.defaultView.getComputedStyle(this.cells[index].nativeElement);
            const cellPadding = parseFloat(cellStyle.paddingLeft) + parseFloat(cellStyle.paddingRight) +
                parseFloat(cellStyle.borderLeftWidth) + parseFloat(cellStyle.borderRightWidth);

            largest.set(Math.max(...cellsContentWidths), cellPadding);
        }

        if (this.headerCell) {
            const headerCellWidths = this.getHeaderCellWidths();
            largest.set(headerCellWidths.width, headerCellWidths.padding);
        }

        const largestCell = Math.max(...Array.from(largest.keys()));
        const width = Math.ceil(largestCell + largest.get(largestCell));

        if (Number.isNaN(width)) {
            return this.width;
        } else {
            return width + 'px';
        }
    }

    /**
     * @hidden
     */
    public getCellWidth() {
        const colWidth = this.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;

        if (this.columnLayoutChild) {
            return '';
        }

        if (colWidth && !isPercentageWidth) {

            let cellWidth = colWidth;
            if (typeof cellWidth !== 'string' || cellWidth.endsWith('px') === false) {
                cellWidth += 'px';
            }

            return cellWidth;
        } else {
            return colWidth;
        }
    }

    /**
     * @hidden
     */
    public populateVisibleIndexes() { }

    protected getColumnSizesString(children: QueryList<IgxColumnComponent>): string {
        const res = this.getFilledChildColumnSizes(children);
        return res.join(' ');
    }

    /**
     * @hidden
     * @internal
     */
    protected cacheCalcWidth(): any {
        const grid = this.gridAPI.grid;
        const colWidth = this.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;
        if (isPercentageWidth) {
            this._calcWidth = parseFloat(colWidth) / 100 * grid.calcWidth;
        } else if (!colWidth) {
            // no width
            this._calcWidth = this.defaultWidth || grid.getPossibleColumnWidth();
        } else {
            this._calcWidth = this.width;
        }
        this.calcPixelWidth = parseFloat(this._calcWidth);
    }

    /**
     * @hidden
     * @internal
     */
    protected setExpandCollapseState() {
        this.children.filter(col => (col.visibleWhenCollapsed !== undefined)).forEach(c =>  {
            if (!this.collapsible) {
                c.hidden = this.hidden; return;
            }
            c.hidden = this._expanded ? c.visibleWhenCollapsed : !c.visibleWhenCollapsed;
        });
    }
    /**
     * @hidden
     * @internal
     */
    protected checkCollapsibleState() {
        if (!this.children) {
            return false;
        }
        const cols = this.children.map(child => child.visibleWhenCollapsed);
        return (cols.some(c => c === true) && cols.some(c => c === false));
    }

    /**
     * @hidden
     */
    public get pinnable() {
        return (this.grid as any)._init || !this.pinned;
    }

    /**
     * @hidden
     */
    public get applySelectableClass(): boolean {
        return this._applySelectableClass;
    }

    /**
     * @hidden
     */
    public set applySelectableClass(value: boolean) {
        if (this.selectable) {
            this._applySelectableClass = value;
        }
    }
}
