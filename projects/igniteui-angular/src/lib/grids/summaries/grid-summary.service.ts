import { Injectable} from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { DataUtil } from '../../data-operations/data-util';
import { cloneArray, resolveNestedPath } from '../../core/utils';
import { GridType, FlatGridType, TreeGridType } from '../common/grid.interface';

/** @hidden */
@Injectable()
export class IgxGridSummaryService {
    public grid: GridType;
    public rootSummaryID = 'igxGridRootSummary';
    public summaryHeight = 0;
    public maxSummariesLenght = 0;
    public groupingExpressions = [];
    public retriggerRootPipe = 0;
    public deleteOperation = false;

    protected summaryCacheMap: Map<string, Map<string, any[]>> = new Map<string, Map<string, IgxSummaryResult[]>>();

    public recalculateSummaries() {
        this.resetSummaryHeight();
        this.grid.notifyChanges(true);
    }

    public clearSummaryCache(args?) {
        if (!this.summaryCacheMap.size) {
            return;
        }
        if (!args) {
            this.summaryCacheMap.clear();
            if (this.grid && this.grid.rootSummariesEnabled) {
                this.retriggerRootPipe++;
            }
            return;
        }
        if (args.data) {
            const rowID = this.grid.primaryKey ? args.data[this.grid.primaryKey] : args.data;
            this.removeSummaries(rowID);
        }
        if (args.rowID !== undefined && args.rowID !== null) {
            let columnName = args.cellID ? this.grid.columnList.find(col => col.index === args.cellID.columnID).field : undefined;
            if (columnName && this.grid.rowEditable) {
                return;
            }

            const isGroupedColumn = (this.grid as FlatGridType).groupingExpressions &&
            (this.grid as FlatGridType).groupingExpressions.map(expr => expr.fieldName).indexOf(columnName) !== -1;
            if (columnName && isGroupedColumn ) {
                columnName = undefined;
            }
            this.removeSummaries(args.rowID, columnName);
        }
    }

    public removeSummaries(rowID, columnName?) {
        this.deleteSummaryCache(this.rootSummaryID, columnName);
        if (this.summaryCacheMap.size === 1 && this.summaryCacheMap.has(this.rootSummaryID)) {
            return;
        }
        if (this.isTreeGrid) {
            if (this.grid.transactions.enabled && this.deleteOperation) {
                this.deleteOperation = false;
                // TODO: this.removeChildRowSummaries(rowID, columnName);
                this.summaryCacheMap.clear();
                return;
            }
            this.removeAllTreeGridSummaries(rowID, columnName);
        } else if (this.isHierarchicalGrid) {
            if (this.grid.transactions.enabled && this.deleteOperation) {
                this.deleteOperation = false;
                this.summaryCacheMap.clear();
            }
        } else {
           const summaryIds = this.getSummaryID(rowID, (this.grid as FlatGridType).groupingExpressions);
           summaryIds.forEach(id => {
               this.deleteSummaryCache(id, columnName);
           });
        }
    }

    public removeSummariesCachePerColumn(columnName) {
        this.summaryCacheMap.forEach((cache) => {
            if (cache.get(columnName)) {
                cache.delete(columnName);
            }
        });
        if (this.grid.rootSummariesEnabled) {
            this.retriggerRootPipe++;
        }
    }

    public calcMaxSummaryHeight() {
        if (this.summaryHeight) {
            return this.summaryHeight;
        }
        if (!this.grid.data) {
            return this.summaryHeight = 0;
        }
        let maxSummaryLength = 0;
        this.grid.columnList.filter((col) => col.hasSummary && !col.hidden).forEach((column) => {
            const getCurrentSummaryColumn = column.summaries.operate([], [], column.field).length;
            if (getCurrentSummaryColumn) {
                if (maxSummaryLength < getCurrentSummaryColumn) {
                    maxSummaryLength = getCurrentSummaryColumn;
                }
            }
        });
        this.maxSummariesLenght = maxSummaryLength;
        this.summaryHeight =  maxSummaryLength * this.grid.defaultSummaryHeight;
        return this.summaryHeight;
    }

    public calculateSummaries(rowID, data) {
        let rowSummaries = this.summaryCacheMap.get(rowID);
        if (!rowSummaries) {
            rowSummaries = new Map<string, IgxSummaryResult[]>();
            this.summaryCacheMap.set(rowID, rowSummaries);
        }
        if (!this.hasSummarizedColumns || !data) {
            return rowSummaries;
        }
        this.grid.columnList.filter(col => col.hasSummary).forEach((column) => {
            if (!rowSummaries.get(column.field)) {
                const summaryResult = column.summaries.operate(data.map(r => resolveNestedPath(r, column.field)),
                    data, column.field, this.grid.locale, column.pipeArgs);
                rowSummaries.set(column.field, summaryResult);
            }
        });
        return rowSummaries;
    }

    public resetSummaryHeight() {
        this.summaryHeight = 0;
        (this.grid as any)._summaryPipeTrigger++;
        if (this.grid.rootSummariesEnabled) {
            this.retriggerRootPipe++;
        }
    }

    public updateSummaryCache(groupingArgs) {
        if (this.summaryCacheMap.size === 0 || !this.hasSummarizedColumns) {
            return;
        }
        if (this.groupingExpressions.length === 0) {
            this.groupingExpressions = groupingArgs.expressions.map(record => record.fieldName);
            return;
        }
        if (groupingArgs.length === 0) {
            this.groupingExpressions = [];
            this.clearSummaryCache();
            return;
        }
        this.compareGroupingExpressions(this.groupingExpressions, groupingArgs);
        this.groupingExpressions = groupingArgs.expressions.map(record => record.fieldName);
    }

    public get hasSummarizedColumns(): boolean {
        const summarizedColumns = this.grid.columnList.filter(col => col.hasSummary && !col.hidden);
        return summarizedColumns.length > 0;
    }

    private deleteSummaryCache(id, columnName) {
        if (this.summaryCacheMap.get(id)) {
            const filteringApplied = columnName && this.grid.filteringExpressionsTree &&
                    this.grid.filteringExpressionsTree.filteringOperands.map((expr) => expr.fieldName).indexOf(columnName) !== -1;
            if (columnName && this.summaryCacheMap.get(id).get(columnName) && !filteringApplied) {
                this.summaryCacheMap.get(id).delete(columnName);
            } else {
                this.summaryCacheMap.delete(id);
            }
            if (id === this.rootSummaryID && this.grid.rootSummariesEnabled) {
                this.retriggerRootPipe++;
            }
        }
    }

    private getSummaryID(rowID, groupingExpressions) {
        if (groupingExpressions.length === 0) {
            return [];
        }
        const summaryIDs = [];
        let data = this.grid.data;
        if (this.grid.transactions.enabled) {
            data = DataUtil.mergeTransactions(
                cloneArray(this.grid.data),
                this.grid.transactions.getAggregatedChanges(true),
                this.grid.primaryKey
            );
        }
        const rowData = this.grid.primaryKey ? data.find(rec => rec[this.grid.primaryKey] === rowID) : rowID;
        let id = '{ ';
        groupingExpressions.forEach(expr => {
            id += `'${expr.fieldName}': '${rowData[expr.fieldName]}'`;
                summaryIDs.push(id.concat(' }'));
                id += ', ';
        });
        return summaryIDs;
    }

    private removeAllTreeGridSummaries(rowID, columnName?) {
        let row = (this.grid as TreeGridType).records.get(rowID);
        if (!row) {
            return;
        }
        row = row.children ? row : row.parent;
        while (row) {
            rowID = row.rowID;
            this.deleteSummaryCache(rowID, columnName);
            row = row.parent;
        }
    }

    // TODO: remove only deleted rows
    // private removeChildRowSummaries(rowID, columnName?) {
    // }

    private compareGroupingExpressions(current, groupingArgs) {
        const newExpressions = groupingArgs.expressions.map(record => record.fieldName);
        const removedCols = groupingArgs.ungroupedColumns;
        if (current.length <= newExpressions.length) {
            const newExpr = newExpressions.slice(0, current.length).toString();
            if (current.toString() !== newExpr) {
                this.clearSummaryCache();
            }
        } else {
            const currExpr = current.slice(0, newExpressions.length).toString();
            if (currExpr !== newExpressions.toString()) {
                this.clearSummaryCache();
                return;
            }
            removedCols.map(col => col.field).forEach(colName => {
                this.summaryCacheMap.forEach((cache, id) => {
                   if (id.indexOf(colName) !== -1) {
                       this.summaryCacheMap.delete(id);
                   }
                });
            });
        }
    }

    private get isTreeGrid() {
        return this.grid.nativeElement.tagName.toLowerCase() === 'igx-tree-grid';
    }

    private get isHierarchicalGrid() {
        return this.grid.nativeElement.tagName.toLowerCase() === 'igx-hierarchical-grid';
    }

}
