import { Injectable } from '@angular/core';
import { GridSelectionMode } from '../common/enums';
import { IgxGridSelectionService } from '../selection/selection.service';
import { ITreeGridRecord } from './tree-grid.interfaces';


@Injectable()
export class IgxTreeGridSelectionService extends IgxGridSelectionService {
    private rowsToBeSelected: Set<any>;
    private rowsToBeIndeterminate: Set<any>;

    /** Select specified rows. No event is emitted. */
    public selectRowsWithNoEvent(rowIDs: any[], clearPrevSelection?): void {
        if (this.grid && this.grid.rowSelection === GridSelectionMode.multipleCascade) {
            this.cascadeSelectRowsWithNoEvent(rowIDs, clearPrevSelection);
            return;
        }
        super.selectRowsWithNoEvent(rowIDs, clearPrevSelection);
    }

    /** Deselect specified rows. No event is emitted. */
    public deselectRowsWithNoEvent(rowIDs: any[]): void {
        if (this.grid.rowSelection === GridSelectionMode.multipleCascade) {
            this.cascadeDeselectRowsWithNoEvent(rowIDs);
            return;
        }
        super.deselectRowsWithNoEvent(rowIDs);
    }

    public emitRowSelectionEvent(newSelection, added, removed, event?): boolean {
        if (this.grid.rowSelection === GridSelectionMode.multipleCascade) {
            this.emitCascadeRowSelectionEvent(newSelection, added, removed, event);
            return;
        }

        super.emitRowSelectionEvent(newSelection, added, removed, event);
    }

    public updateCascadeSelectionOnFilterAndCRUD(
        parents: Set<any>,
        crudRowID?: any,
        visibleRowIDs: any[] = null) {
        if (visibleRowIDs === null) {
            // if the tree grid has flat structure
            // do not explicitly handle the selection state of the rows
            if (!parents.size) {
                return;
            }
            visibleRowIDs = this.getRowIDs(this.allData);
            this.rowsToBeSelected = new Set(this.rowSelection);
            this.rowsToBeIndeterminate = new Set(this.indeterminateRows);
            if (crudRowID) {
                this.rowSelection.delete(crudRowID);
            }
        }
        if (!parents.size) {
            this.rowSelection = new Set(this.rowsToBeSelected);
            this.indeterminateRows = new Set(this.rowsToBeIndeterminate);
            // TODO: emit selectionChangeD event, calculate its args through the handleAddedAndRemovedArgs method
            this.clearHeaderCBState();
            this.selectedRowsChange.next();
            return;
        }
        const newParents = new Set<any>();
        parents.forEach(parent => {
            this.handleRowSelectionState(parent, visibleRowIDs);
            if (parent && parent.parent) {
                newParents.add(parent.parent);
            }
        });
        this.updateCascadeSelectionOnFilterAndCRUD(newParents, null, visibleRowIDs);
    }

    private cascadeSelectRowsWithNoEvent(rowIDs: any[], clearPrevSelection?: boolean): void {
        if (clearPrevSelection) {
            this.indeterminateRows.clear();
            this.rowSelection.clear();
            this.calculateRowsNewSelectionState({ added: rowIDs, removed: [] });
        } else {
            const oldSelection = this.getSelectedRows();
            const newSelection = [...oldSelection, ...rowIDs];
            const args = { oldSelection, newSelection };

            // retrieve only the rows without their parents/children which has to be added to the selection
            this.handleAddedAndRemovedArgs(args);

            this.calculateRowsNewSelectionState(args);
        }
        this.rowSelection = new Set(this.rowsToBeSelected);
        this.indeterminateRows = new Set(this.rowsToBeIndeterminate);
        this.clearHeaderCBState();
        this.selectedRowsChange.next();
    }

    private cascadeDeselectRowsWithNoEvent(rowIDs: any[]): void {
        const args = { added: [], removed: rowIDs };
        this.calculateRowsNewSelectionState(args);

        this.rowSelection = new Set(this.rowsToBeSelected);
        this.indeterminateRows = new Set(this.rowsToBeIndeterminate);
        this.clearHeaderCBState();
        this.selectedRowsChange.next();
    }

    public get selectionService(): IgxGridSelectionService {
        return this.grid.selectionService;
    }

    private emitCascadeRowSelectionEvent(newSelection, added, removed, event?): boolean {
        const currSelection = this.getSelectedRows();
        if (this.areEqualCollections(currSelection, newSelection)) {
            return;
        }

        const args = {
            oldSelection: currSelection, newSelection,
            added, removed, event, cancel: false
        };

        this.calculateRowsNewSelectionState(args);

        args.newSelection = Array.from(this.rowsToBeSelected);

        // retrieve rows/parents/children which has been added/removed from the selection
        this.handleAddedAndRemovedArgs(args);

        this.grid.onRowSelectionChange.emit(args);

        if (args.cancel) {
            return;
        }

        // if args.newSelection hasn't been modified
        if (this.areEqualCollections(Array.from(this.rowsToBeSelected), args.newSelection)) {
            this.rowSelection = new Set(this.rowsToBeSelected);
            this.indeterminateRows = new Set(this.rowsToBeIndeterminate);
            this.clearHeaderCBState();
            this.selectedRowsChange.next();
        } else {
            // select the rows within the modified args.newSelection with no event
            this.cascadeSelectRowsWithNoEvent(args.newSelection, true);
        }
    }


    /**
     * retrieve the rows which should be added/removed to/from the old selection
     */
    private handleAddedAndRemovedArgs(args: any) {
        args.removed = args.oldSelection.filter(x => args.newSelection.indexOf(x) < 0);
        args.added = args.newSelection.filter(x => args.oldSelection.indexOf(x) < 0);
    }

    /**
     * adds to rowsToBeProcessed set all visible children of the rows which was initially within the rowsToBeProcessed set
     *
     * @param rowsToBeProcessed set of the rows (without their parents/children) to be selected/deselected
     * @param visibleRowIDs list of all visible rowIds
     * @returns a new set with all direct parents of the rows within rowsToBeProcessed set
     */
    private collectRowsChildrenAndDirectParents(rowsToBeProcessed: Set<any>, visibleRowIDs: any[]): Set<any> {
        const processedRowsParents = new Set<any>();
        Array.from(rowsToBeProcessed).forEach((rowID) => {
            const rowTreeRecord = this.grid.gridAPI.get_rec_by_id(rowID);
            const rowAndAllChildren = this.get_all_children(rowTreeRecord);
            rowAndAllChildren.forEach(row => {
                if (visibleRowIDs.indexOf(row.rowID) >= 0) {
                    rowsToBeProcessed.add(row.rowID);
                }
            });
            if (rowTreeRecord && rowTreeRecord.parent) {
                processedRowsParents.add(rowTreeRecord.parent);
            }
        });
        return processedRowsParents;
    }


    /**
     * populates the rowsToBeSelected and rowsToBeIndeterminate sets
     * with the rows which will be eventually in selected/indeterminate state
     */
    private calculateRowsNewSelectionState(args: any) {
        this.rowsToBeSelected = new Set<any>(args.oldSelection ? args.oldSelection : this.getSelectedRows());
        this.rowsToBeIndeterminate = new Set<any>(this.getIndeterminateRows());

        const visibleRowIDs = this.getRowIDs(this.allData);

        const removed = new Set(args.removed);
        const added = new Set(args.added);

        if (removed && removed.size) {
            let removedRowsParents = new Set<any>();

            removedRowsParents = this.collectRowsChildrenAndDirectParents(removed, visibleRowIDs);

            removed.forEach(removedRow => {
                this.rowsToBeSelected.delete(removedRow);
                this.rowsToBeIndeterminate.delete(removedRow);
            });

            Array.from(removedRowsParents).forEach((parent) => {
                this.handleParentSelectionState(parent, visibleRowIDs);
            });
        }

        if (added && added.size) {
            let addedRowsParents = new Set<any>();

            addedRowsParents = this.collectRowsChildrenAndDirectParents(added, visibleRowIDs);

            added.forEach(addedRow => {
                this.rowsToBeSelected.add(addedRow);
                this.rowsToBeIndeterminate.delete(addedRow);
            });

            Array.from(addedRowsParents).forEach((parent) => {
                this.handleParentSelectionState(parent, visibleRowIDs);
            });
        }
    }

    /**
     * recursively handle the selection state of the direct and indirect parents
     */
    private handleParentSelectionState(treeRow: ITreeGridRecord, visibleRowIDs: any[]) {
        if (!treeRow) {
            return;
        }
        this.handleRowSelectionState(treeRow, visibleRowIDs);
        if (treeRow.parent) {
            this.handleParentSelectionState(treeRow.parent, visibleRowIDs);
        }
    }

    /**
     * Handle the selection state of a given row based the selection states of its direct children
     */
    private handleRowSelectionState(treeRow: ITreeGridRecord, visibleRowIDs: any[]) {
        let visibleChildren = [];
        if (treeRow && treeRow.children) {
            visibleChildren = treeRow.children.filter(child => visibleRowIDs.indexOf(child.rowID) >= 0);
        }
        if (visibleChildren.length) {
            if (visibleChildren.every(row => this.rowsToBeSelected.has(row.rowID))) {
                this.rowsToBeSelected.add(treeRow.rowID);
                this.rowsToBeIndeterminate.delete(treeRow.rowID);
            } else if (visibleChildren.some(row => this.rowsToBeSelected.has(row.rowID) || this.rowsToBeIndeterminate.has(row.rowID))) {
                this.rowsToBeIndeterminate.add(treeRow.rowID);
                this.rowsToBeSelected.delete(treeRow.rowID);
            } else {
                this.rowsToBeIndeterminate.delete(treeRow.rowID);
                this.rowsToBeSelected.delete(treeRow.rowID);
            }
        } else {
            // if the children of the row has been deleted and the row was selected do not change its state
            if (this.isRowSelected(treeRow.rowID)) {
                this.rowsToBeSelected.add(treeRow.rowID);
                this.rowsToBeIndeterminate.delete(treeRow.rowID);
            } else {
                this.rowsToBeSelected.delete(treeRow.rowID);
                this.rowsToBeIndeterminate.delete(treeRow.rowID);
            }
        }
    }

    private get_all_children(record: ITreeGridRecord): any[] {
        const children = [];
        if (record && record.children && record.children.length) {
            for (const child of record.children) {
                children.push(...this.get_all_children(child));
                children.push(child);
            }
        }
        return children;

    }

}
