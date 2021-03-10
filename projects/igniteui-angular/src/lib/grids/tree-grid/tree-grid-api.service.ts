import { GridBaseAPIService } from '../api.service';
import { IgxTreeGridComponent } from './tree-grid.component';
import { DataType, DataUtil } from '../../data-operations/data-util';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { HierarchicalTransaction, TransactionType, State } from '../../services/public_api';
import { Injectable } from '@angular/core';
import { ColumnType } from '../common/column.interface';
import { cloneArray, mergeObjects } from '../../core/utils';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { TreeGridFilteringStrategy } from './tree-grid.filtering.strategy';

@Injectable()
export class IgxTreeGridAPIService extends GridBaseAPIService<IgxTreeGridComponent> {

    public get_all_data(transactions?: boolean): any[] {
        const grid = this.grid;
        const data = transactions ? grid.dataWithAddedInTransactionRows : grid.flatData;
        return data ? data : [];
    }

    public get_summary_data() {
        const grid = this.grid;
        const data = grid.processedRootRecords.filter(row => row.isFilteredOutParent === undefined || row.isFilteredOutParent === false)
            .map(rec => rec.data);
        if (grid.transactions.enabled) {
            const deletedRows = grid.transactions.getTransactionLog().filter(t => t.type === TransactionType.DELETE).map(t => t.id);
            deletedRows.forEach(rowID => {
                const tempData = grid.primaryKey ? data.map(rec => rec[grid.primaryKey]) : data;
                const index = tempData.indexOf(rowID);
                if (index !== -1) {
                    data.splice(index, 1);
                }
            });
        }
        return data;
    }

    public allow_expansion_state_change(rowID, expanded): boolean {
        const grid = this.grid;
        const row = grid.records.get(rowID);
        if (row.expanded === expanded ||
            ((!row.children || !row.children.length) && (!grid.loadChildrenOnDemand ||
                (grid.hasChildrenKey && !row.data[grid.hasChildrenKey])))) {
            return false;
        }
        return true;
    }

    public expand_path_to_record(record: ITreeGridRecord) {
        const grid = this.grid;
        const expandedStates = grid.expansionStates;

        while (record.parent) {
            record = record.parent;
            const expanded = this.get_row_expansion_state(record);

            if (!expanded) {
                expandedStates.set(record.rowID, true);
            }
        }
        grid.expansionStates = expandedStates;

        if (grid.rowEditable) {
            grid.endEdit(false);
        }
    }

    public get_row_expansion_state(record: ITreeGridRecord): boolean {
        const grid = this.grid;
        const states = grid.expansionStates;
        const expanded = states.get(record.rowID);

        if (expanded !== undefined) {
            return expanded;
        } else {
            return record.children && record.children.length && record.level < grid.expansionDepth;
        }
    }

    public should_apply_number_style(column: ColumnType): boolean {
        return column.dataType === DataType.Number && column.visibleIndex !== 0;
    }

    public deleteRowById(rowID: any) {
        const treeGrid = this.grid;
        const flatDataWithCascadeOnDeleteAndTransactions =
            treeGrid.primaryKey &&
            treeGrid.foreignKey &&
            treeGrid.cascadeOnDelete &&
            treeGrid.transactions.enabled;

        if (flatDataWithCascadeOnDeleteAndTransactions) {
            treeGrid.transactions.startPending();
        }

        super.deleteRowById(rowID);

        if (flatDataWithCascadeOnDeleteAndTransactions) {
            treeGrid.transactions.endPending(true);
        }
    }

    public deleteRowFromData(rowID: any, index: number) {
        const treeGrid = this.grid;
        const record = treeGrid.records.get(rowID);

        if (treeGrid.primaryKey && treeGrid.foreignKey) {
            index = treeGrid.primaryKey ?
                treeGrid.data.map(c => c[treeGrid.primaryKey]).indexOf(rowID) :
                treeGrid.data.indexOf(rowID);
            super.deleteRowFromData(rowID, index);

            if (treeGrid.cascadeOnDelete) {
                if (record && record.children) {
                    for (const child of record.children) {
                        super.deleteRowById(child.rowID);
                    }
                }
            }
        } else {
            const collection = record.parent ? record.parent.data[treeGrid.childDataKey] : treeGrid.data;
            index = treeGrid.primaryKey ?
                collection.map(c => c[treeGrid.primaryKey]).indexOf(rowID) :
                collection.indexOf(rowID);

            const selectedChildren = [];
            this.get_selected_children(record, selectedChildren);
            if (selectedChildren.length > 0) {
                treeGrid.deselectRows(selectedChildren);
            }

            if (treeGrid.transactions.enabled) {
                const path = treeGrid.generateRowPath(rowID);
                treeGrid.transactions.add({
                    id: rowID,
                    type: TransactionType.DELETE,
                    newValue: null,
                    path
                },
                    collection[index]
                );
            } else {
                collection.splice(index, 1);
            }
        }
    }

    public get_selected_children(record: ITreeGridRecord, selectedRowIDs: any[]) {
        const grid = this.grid;
        if (!record.children || record.children.length === 0) {
            return;
        }
        for (const child of record.children) {
            if (grid.selectionService.isRowSelected(child.rowID)) {
                selectedRowIDs.push(child.rowID);
            }
            this.get_selected_children(child, selectedRowIDs);
        }
    }

    public row_deleted_transaction(rowID: any): boolean {
        return this.row_deleted_parent(rowID) || super.row_deleted_transaction(rowID);
    }

    public get_rec_by_id(rowID) {
        return this.grid.records.get(rowID);
    }

    public addRowToData(data: any, parentRowID?: any) {
        if (parentRowID !== undefined && parentRowID !== null) {

            const state = this.grid.transactions.getState(parentRowID);
            // we should not allow adding of rows as child of deleted row
            if (state && state.type === TransactionType.DELETE) {
                throw Error(`Cannot add child row to deleted parent row`);
            }

            const parentRecord = this.grid.records.get(parentRowID);

            if (!parentRecord) {
                throw Error('Invalid parent row ID!');
            }
            this.grid.summaryService.clearSummaryCache({ rowID: parentRecord.rowID });
            if (this.grid.primaryKey && this.grid.foreignKey) {
                data[this.grid.foreignKey] = parentRowID;
                super.addRowToData(data);
            } else {
                const parentData = parentRecord.data;
                const childKey = this.grid.childDataKey;
                if (this.grid.transactions.enabled) {
                    const rowId = this.grid.primaryKey ? data[this.grid.primaryKey] : data;
                    const path: any[] = [];
                    path.push(...this.grid.generateRowPath(parentRowID));
                    path.push(parentRowID);
                    this.grid.transactions.add({
                        id: rowId,
                        path,
                        newValue: data,
                        type: TransactionType.ADD
                    } as HierarchicalTransaction,
                        null);
                } else {
                    if (!parentData[childKey]) {
                        parentData[childKey] = [];
                    }
                    parentData[childKey].push(data);
                }
            }
        } else {
            super.addRowToData(data);
        }
    }

    public filterDataByExpressions(expressionsTree: IFilteringExpressionsTree): any[] {
        let records = this.grid.rootRecords;

        if (expressionsTree.filteringOperands.length) {
            const state = {
                expressionsTree,
                strategy: this.grid.filterStrategy ?? new TreeGridFilteringStrategy()
            };
            records = DataUtil.filter(cloneArray(records), state, this.grid);
        }

        const data = [];
        this.getFlatDataFromFilteredRecords(records, data);

        return data;
    }

    protected update_row_in_array(value: any, rowID: any, index: number) {
        const grid = this.grid;
        if (grid.primaryKey && grid.foreignKey) {
            super.update_row_in_array(value, rowID, index);
        } else {
            const record = grid.records.get(rowID);
            const childData = record.parent ? record.parent.data[grid.childDataKey] : grid.data;
            index = grid.primaryKey ? childData.map(c => c[grid.primaryKey]).indexOf(rowID) :
                childData.indexOf(rowID);
            childData[index] = value;
        }
    }

    /**
     * Updates related row of provided grid's data source with provided new row value
     *
     * @param grid Grid to update data for
     * @param rowID ID of the row to update
     * @param rowValueInDataSource Initial value of the row as it is in data source
     * @param rowCurrentValue Current value of the row as it is with applied previous transactions
     * @param rowNewValue New value of the row
     */
    protected updateData(
        grid: IgxTreeGridComponent,
        rowID: any,
        rowValueInDataSource: any,
        rowCurrentValue: any,
        rowNewValue: { [x: string]: any }) {
        if (grid.transactions.enabled) {
            const path = grid.generateRowPath(rowID);
            const transaction: HierarchicalTransaction = {
                id: rowID,
                type: TransactionType.UPDATE,
                newValue: rowNewValue,
                path
            };
            grid.transactions.add(transaction, rowCurrentValue);
        } else {
            mergeObjects(rowValueInDataSource, rowNewValue);
        }
    }

    private row_deleted_parent(rowID: any): boolean {
        const grid = this.grid;
        if (!grid) {
            return false;
        }
        if ((grid.cascadeOnDelete && grid.foreignKey) || grid.childDataKey) {
            let node = grid.records.get(rowID);
            while (node) {
                const state: State = grid.transactions.getState(node.rowID);
                if (state && state.type === TransactionType.DELETE) {
                    return true;
                }
                node = node.parent;
            }
        }
        return false;
    }

    private getFlatDataFromFilteredRecords(records: ITreeGridRecord[], data: any[]) {
        if (!records || records.length === 0) {
            return;
        }

        for (const record of records) {
            if (!record.isFilteredOutParent) {
                data.push(record.data);
            }
            this.getFlatDataFromFilteredRecords(record.children, data);
        }
    }
}
