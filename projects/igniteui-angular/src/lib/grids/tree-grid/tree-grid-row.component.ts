import { Component, forwardRef, Input, ViewChildren, QueryList, HostBinding, DoCheck, ChangeDetectionStrategy } from '@angular/core';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxRowDirective } from '../row.directive';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxTreeGridAPIService } from './tree-grid-api.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-tree-grid-row',
    templateUrl: 'tree-grid-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxTreeGridRowComponent) }]
})
export class IgxTreeGridRowComponent extends IgxRowDirective<IgxTreeGridComponent> implements DoCheck {
    @ViewChildren('treeCell')
    protected _cells: QueryList<any>;

    /**
     * @hidden
     */
    public isLoading: boolean;

    private _treeRow: ITreeGridRecord;

    /**
     * The `ITreeGridRecord` passed to the row component.
     *
     * ```typescript
     * const row = this.grid.getRowByKey(1) as IgxTreeGridRowComponent;
     * const treeRow = row.treeRow;
     * ```
     */
    @Input()
    public get treeRow(): ITreeGridRecord {
        return this._treeRow;
    }

    public set treeRow(value: ITreeGridRecord) {
        if (this._treeRow !== value) {
            this._treeRow = value;
            this.rowData = this._treeRow.data;
        }
    }

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
    public get pinned() {
        return this.grid.isRecordPinned(this._treeRow);
    }

    /**
     * @hidden
     */
    public get isRoot(): boolean {
        let treeRec = this.treeRow;
        const isPinnedArea = this.pinned && !this.disabled;
        if (isPinnedArea) {
            treeRec = this.grid.unpinnedRecords.find(x => x.data === this.rowData);
        }
        return treeRec.level === 0;
    }

    /**
     * @hidden
     */
    public get hasChildren(): boolean {
        return true;
    }

    /**
     * Returns a value indicating whether the row component is expanded.
     *
     * ```typescript
     * const row = this.grid.getRowByKey(1) as IgxTreeGridRowComponent;
     * const expanded = row.expanded;
     * ```
     */
    @HostBinding('attr.aria-expanded')
    public get expanded(): boolean {
        return this._treeRow.expanded;
    }

    /**
     * Sets a value indicating whether the row component is expanded.
     *
     * ```typescript
     * const row = this.grid.getRowByKey(1) as IgxTreeGridRowComponent;
     * row.expanded = true;
     * ```
     */
    public set expanded(value: boolean) {
        (this.gridAPI as IgxTreeGridAPIService).set_row_expansion_state(this._treeRow.rowID, value);
    }

    /**
     * @hidden
     * @internal
     */
    public get viewIndex(): number {
        return this.index + this.grid.page * this.grid.perPage;
    }

    /**
     * @hidden
     */
    public get showIndicator() {
        return this.grid.loadChildrenOnDemand ?
            this.grid.expansionStates.has(this.rowID) ?
                this.treeRow.children && this.treeRow.children.length :
                this.grid.hasChildrenKey ?
                    this.rowData[this.grid.hasChildrenKey] :
                    true :
            this.treeRow.children && this.treeRow.children.length;
    }

    /**
     * @hidden
     */
    get indeterminate(): boolean {
        return this.selectionService.isRowInIndeterminateState(this.rowID);
    }

    /**
     * @hidden
     */
    public ngDoCheck() {
        this.isLoading = this.grid.loadChildrenOnDemand ? this.grid.loadingRows.has(this.rowID) : false;
        super.ngDoCheck();
    }

    /**
     * Spawns the add child row UI for the specific row.
     *
     * @example
     * ```typescript
     * const row = this.grid.getRowByKey(1) as IgxTreeGridRowComponent;
     * row.beginAddChild();
     * ```
     * @param rowID
     */
    public beginAddChild() {
        this.grid.beginAddRowByIndex(this.rowID, this.index, true);
    }

    /**
     * @hidden
     */
    protected resolveClasses(): string {
        const classes = super.resolveClasses();
        const filteredClass = this.treeRow.isFilteredOutParent ? 'igx-grid__tr--filtered' : '';
        return `${classes} ${filteredClass}`;
    }
}
