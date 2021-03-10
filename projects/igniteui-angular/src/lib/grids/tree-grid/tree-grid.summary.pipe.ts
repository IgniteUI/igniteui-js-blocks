import { Pipe, PipeTransform } from '@angular/core';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxTreeGridComponent } from './tree-grid.component';
import { ISummaryRecord } from '../summaries/grid-summary';
import { GridSummaryCalculationMode, GridSummaryPosition } from '../common/enums';
import { GridType } from '../common/grid.interface';

/** @hidden */
@Pipe({
    name: 'treeGridSummary',
    pure: true
})
export class IgxTreeGridSummaryPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) {
        this.gridAPI = gridAPI as IgxTreeGridAPIService;
     }

    public transform(flatData: ITreeGridRecord[],
        hasSummary: boolean,
        summaryCalculationMode: GridSummaryCalculationMode,
        summaryPosition: GridSummaryPosition, showSummaryOnCollapse: boolean, _: number, __: number): any[] {
        const grid: IgxTreeGridComponent = this.gridAPI.grid;

        if (!flatData || !hasSummary || summaryCalculationMode === GridSummaryCalculationMode.rootLevelOnly) {
            return flatData;
        }

        return this.addSummaryRows(grid, flatData, summaryPosition, showSummaryOnCollapse);
    }

    private addSummaryRows(grid: IgxTreeGridComponent, collection: ITreeGridRecord[],
        summaryPosition: GridSummaryPosition, showSummaryOnCollapse: boolean): any[] {
        const recordsWithSummary = [];
        const maxSummaryHeight = grid.summaryService.calcMaxSummaryHeight();

        for (const record of collection) {
            recordsWithSummary.push(record);

            const isCollapsed = !record.expanded && record.children && record.children.length > 0 && showSummaryOnCollapse;
            if (isCollapsed) {
                let childData = record.children.filter(r => !r.isFilteredOutParent).map(r => r.data);
                childData = this.removeDeletedRecord(grid, record.rowID, childData);
                const summaries = grid.summaryService.calculateSummaries(record.rowID, childData);
                const summaryRecord: ISummaryRecord = {
                    summaries,
                    max: maxSummaryHeight,
                    cellIndentation: record.level + 1
                };
                recordsWithSummary.push(summaryRecord);
            }
            const isExpanded = record.children && record.children.length > 0 && record.expanded;
            if (summaryPosition === GridSummaryPosition.bottom && !isExpanded) {
                let childRecord = record;
                let parent = record.parent;

                while (parent) {
                    const children = parent.children;

                    if (children[children.length - 1] === childRecord ) {
                        let childData = children.filter(r => !r.isFilteredOutParent).map(r => r.data);
                        childData = this.removeDeletedRecord(grid, parent.rowID, childData);
                        const summaries = grid.summaryService.calculateSummaries(parent.rowID, childData);
                        const summaryRecord: ISummaryRecord = {
                            summaries,
                            max: maxSummaryHeight,
                            cellIndentation: parent.level + 1
                        };
                        recordsWithSummary.push(summaryRecord);

                        childRecord = parent;
                        parent = childRecord.parent;
                    } else {
                        break;
                    }
                }
            } else if (summaryPosition === GridSummaryPosition.top && isExpanded) {
                let childData = record.children.filter(r => !r.isFilteredOutParent).map(r => r.data);
                childData = this.removeDeletedRecord(grid, record.rowID, childData);
                const summaries = grid.summaryService.calculateSummaries(record.rowID, childData);
                const summaryRecord: ISummaryRecord = {
                    summaries,
                    max: maxSummaryHeight,
                    cellIndentation: record.level + 1
                };
                recordsWithSummary.push(summaryRecord);
            }
        }
        return recordsWithSummary;
    }

    private removeDeletedRecord(grid, rowId, data) {
        if (!grid.transactions.enabled || !grid.cascadeOnDelete) {
            return data;
        }
        const deletedRows = grid.transactions.getTransactionLog().filter(t => t.type === 'delete').map(t => t.id);
        let row = grid.records.get(rowId);
        if (!row && deletedRows.lenght === 0) {
            return [];
        }
        row = row.children ? row : row.parent;
        while (row) {
            rowId = row.rowID;
            if (deletedRows.indexOf(rowId) !== -1) {
                return [];
            }
            row = row.parent;
        }
        deletedRows.forEach(rowID => {
            const tempData = grid.primaryKey ? data.map(rec => rec[grid.primaryKey]) : data;
            const index = tempData.indexOf(rowID);
            if (index !== -1) {
                data.splice(index, 1);
            }
        });
        return data;
    }
}
