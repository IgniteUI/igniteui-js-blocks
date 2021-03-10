import { EventEmitter } from '@angular/core';

import { cloneArray, cloneValue, IBaseEventArgs, resolveNestedPath, yieldingLoop } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';

import { ExportUtilities } from './export-utilities';
import { IgxExporterOptionsBase } from './exporter-options-base';
import { ITreeGridRecord } from '../../grids/tree-grid/tree-grid.interfaces';
import { TreeGridFilteringStrategy } from '../../grids/tree-grid/tree-grid.filtering.strategy';
import { IGroupingState } from '../../data-operations/groupby-state.interface';
import { getHierarchy, isHierarchyMatch } from '../../data-operations/operations';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IFilteringState } from '../../data-operations/filtering-state.interface';
import { IgxGridBaseDirective } from '../../grids/public_api';
import { IgxTreeGridComponent } from '../../grids/tree-grid/public_api';
import { IgxGridComponent } from '../../grids/grid/public_api';
import { DatePipe } from '@angular/common';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';

export enum ExportRecordType {
    GroupedRecord = 1,
    TreeGridRecord = 2,
    DataRecord = 3,
}

export interface IExportRecord {
    data: any;
    level: number;
    hidden?: boolean;
    type: ExportRecordType;
}

/**
 * rowExporting event arguments
 * this.exporterService.rowExporting.subscribe((args: IRowExportingEventArgs) => {
 * // set args properties here
 * })
 */
export interface IRowExportingEventArgs extends IBaseEventArgs {
    /**
     * Contains the exporting row data
     */
    rowData: any;

    /**
     * Contains the exporting row index
     */
    rowIndex: number;

    /**
     * Skip the exporting row when set to true
     */
    cancel: boolean;
}

/**
 * columnExporting event arguments
 * ```typescript
 * this.exporterService.columnExporting.subscribe((args: IColumnExportingEventArgs) => {
 * // set args properties here
 * });
 * ```
 */
export interface IColumnExportingEventArgs extends IBaseEventArgs {
    /**
     * Contains the exporting column header
     */
    header: string;

    /**
     * Contains the exporting column field name
     */
    field: string;

    /**
     * Contains the exporting column index
     */
    columnIndex: number;

    /**
     * Skip the exporting column when set to true
     */
    cancel: boolean;

    /**
     * Export the column's data without applying its formatter, when set to true
     */
    skipFormatter: boolean;
}

const DEFAULT_COLUMN_WIDTH = 8.43;

export abstract class IgxBaseExporter {
    public exportEnded = new EventEmitter<IBaseEventArgs>();

    /**
     * This event is emitted when a row is exported.
     * ```typescript
     * this.exporterService.rowExporting.subscribe((args: IRowExportingEventArgs) => {
     * // put event handler code here
     * });
     * ```
     *
     * @memberof IgxBaseExporter
     */
    public rowExporting = new EventEmitter<IRowExportingEventArgs>();

    /**
     * This event is emitted when a column is exported.
     * ```typescript
     * this.exporterService.columnExporting.subscribe((args: IColumnExportingEventArgs) => {
     * // put event handler code here
     * });
     * ```
     *
     * @memberof IgxBaseExporter
     */
    public columnExporting = new EventEmitter<IColumnExportingEventArgs>();

    protected _indexOfLastPinnedColumn = -1;
    protected _sort = null;

    private _columnList: any[];
    private _columnWidthList: number[];
    private flatRecords: IExportRecord[] = [];

    public get columnWidthList() {
        return this._columnWidthList;
    }

    /**
     * Method for exporting IgxGrid component's data.
     * ```typescript
     * this.exporterService.export(this.igxGridForExport, this.exportOptions);
     * ```
     *
     * @memberof IgxBaseExporter
     */
    public export(grid: any, options: IgxExporterOptionsBase): void {
        if (options === undefined || options === null) {
            throw Error('No options provided!');
        }

        const columns = grid.columnList.toArray();
        this._columnList = new Array<any>(columns.length);
        this._columnWidthList = new Array<any>(columns.filter(c => !c.hidden).length);

        const hiddenColumns = [];
        let lastVisibleColumnIndex = -1;

        columns.forEach((column) => {
            const columnHeader = !ExportUtilities.isNullOrWhitespaces(column.header) ? column.header : column.field;
            const exportColumn = !column.hidden || options.ignoreColumnsVisibility;
            const index = options.ignoreColumnsOrder || options.ignoreColumnsVisibility ? column.index : column.visibleIndex;
            const columnWidth = Number(column.width.slice(0, -2));

            const columnInfo = {
                header: columnHeader,
                dataType: column.dataType,
                field: column.field,
                skip: !exportColumn,
                formatter: column.formatter,
                skipFormatter: false
            };

            if (index !== -1) {
                this._columnList[index] = columnInfo;
                this._columnWidthList[index] = columnWidth;
                lastVisibleColumnIndex = Math.max(lastVisibleColumnIndex, index);
            } else {
                hiddenColumns.push(columnInfo);
            }

            if (column.pinned && exportColumn) {
                this._indexOfLastPinnedColumn++;
            }
        });

        // Append the hidden columns to the end of the list
        hiddenColumns.forEach((hiddenColumn) => {
            this._columnList[++lastVisibleColumnIndex] = hiddenColumn;
        });

        this.prepareData(grid, options);
        this.exportGridRecordsData(this.flatRecords, options);
    }

    /**
     * Method for exporting any kind of array data.
     * ```typescript
     * this.exporterService.exportData(this.arrayForExport, this.exportOptions);
     * ```
     *
     * @memberof IgxBaseExporter
     */
    public exportData(data: any[], options: IgxExporterOptionsBase): void {
        if (options === undefined || options === null) {
            throw Error('No options provided!');
        }

        const records = data.map(d => {
            const record: IExportRecord = {
                data: d,
                type: ExportRecordType.DataRecord,
                level: 0
            };

            return record;
        });

        this.exportGridRecordsData(records, options);
    }

    private exportGridRecordsData(records: IExportRecord[], options: IgxExporterOptionsBase) {
        if (options === undefined || options === null) {
            throw Error('No options provided!');
        }

        if (!this._columnList || this._columnList.length === 0) {
            const recordsData = records.map(r => r.data);
            const keys = ExportUtilities.getKeysFromData(recordsData);
            this._columnList = keys.map((k) => ({ header: k, field: k, skip: false }));
            this._columnWidthList = new Array<number>(keys.length).fill(DEFAULT_COLUMN_WIDTH);
        }

        let skippedPinnedColumnsCount = 0;
        let columnsWithoutHeaderCount = 1;
        this._columnList.forEach((column, index) => {
            if (!column.skip) {
                const columnExportArgs = {
                    header: !ExportUtilities.isNullOrWhitespaces(column.header) ?
                        column.header :
                        'Column' + columnsWithoutHeaderCount++,
                    field: column.field,
                    columnIndex: index,
                    cancel: false,
                    skipFormatter: false
                };
                this.columnExporting.emit(columnExportArgs);

                column.header = columnExportArgs.header;
                column.skip = columnExportArgs.cancel;
                column.skipFormatter = columnExportArgs.skipFormatter;

                if (column.skip && index <= this._indexOfLastPinnedColumn) {
                    skippedPinnedColumnsCount++;
                }

                if (this._sort && this._sort.fieldName === column.field) {
                    if (column.skip) {
                        this._sort = null;
                    } else {
                        this._sort.fieldName = column.header;
                    }
                }
            }
        });

        this._indexOfLastPinnedColumn -= skippedPinnedColumnsCount;

        const dataToExport = new Array<IExportRecord>();
        const actualData = records.map(r => r.data);
        const isSpecialData = ExportUtilities.isSpecialData(actualData);

        yieldingLoop(records.length, 100, (i) => {
            const row = records[i];
            this.exportRow(dataToExport, row, i, isSpecialData);
        }, () => {
            this.exportDataImplementation(dataToExport, options);
            this.resetDefaults();
        });
    }

    private exportRow(data: IExportRecord[], record: IExportRecord, index: number, isSpecialData: boolean) {
        if (!isSpecialData) {
            record.data = this._columnList.reduce((a, e) => {
                if (!e.skip) {
                    let rawValue = resolveNestedPath(record.data, e.field);

                    const shouldApplyFormatter = e.formatter && !e.skipFormatter && record.type !== ExportRecordType.GroupedRecord;

                    if (e.dataType === 'date' &&
                        !(rawValue instanceof Date) &&
                        !shouldApplyFormatter &&
                        rawValue !== undefined &&
                        rawValue !== null) {
                        rawValue = new Date(rawValue);
                    } else if (e.dataType === 'string' && rawValue instanceof Date) {
                        rawValue = rawValue.toString();
                    }

                    a[e.header] = shouldApplyFormatter ? e.formatter(rawValue) : rawValue;
                }
                return a;
            }, {});
        }

        const rowArgs = {
            rowData: record.data,
            rowIndex: index,
            cancel: false
        };

        this.rowExporting.emit(rowArgs);

        if (!rowArgs.cancel) {
            data.push(record);
        }
    }

    private prepareData(grid: IgxGridBaseDirective, options: IgxExporterOptionsBase) {
        this.flatRecords = [];
        const tagName = grid.nativeElement.tagName.toLowerCase();

        const hasFiltering = (grid.filteringExpressionsTree && grid.filteringExpressionsTree.filteringOperands.length > 0) ||
                (grid.advancedFilteringExpressionsTree && grid.advancedFilteringExpressionsTree.filteringOperands.length > 0);

        const hasSorting = grid.sortingExpressions &&
            grid.sortingExpressions.length > 0;


        if (tagName === 'igx-grid') {
            this.prepareGridData(grid as IgxGridComponent, options, hasFiltering, hasSorting);
        } if (tagName === 'igx-tree-grid') {
            this.prepareTreeGridData(grid as IgxTreeGridComponent, options, hasFiltering, hasSorting);
        }
    }

    private prepareGridData(grid: IgxGridComponent, options: IgxExporterOptionsBase, hasFiltering: boolean, hasSorting: boolean) {
        const groupedGridGroupingState: IGroupingState = {
            expressions: grid.groupingExpressions,
            expansion: grid.groupingExpansionState,
            defaultExpanded: grid.groupsExpanded,
        };

        const hasGrouping = grid.groupingExpressions &&
            grid.groupingExpressions.length > 0;

        const skipOperations =
            (!hasFiltering || !options.ignoreFiltering) &&
            (!hasSorting || !options.ignoreSorting) &&
            (!hasGrouping || !options.ignoreGrouping);

        if (skipOperations) {
            if (hasGrouping) {
                this.addGroupedData(grid, grid.groupsRecords, groupedGridGroupingState);
            } else {
                this.addFlatData(grid.filteredSortedData);
            }
        } else {
            let gridData = grid.data;

            if (hasFiltering && !options.ignoreFiltering) {
                const filteringState: IFilteringState = {
                    expressionsTree: grid.filteringExpressionsTree,
                    advancedExpressionsTree: grid.advancedFilteringExpressionsTree,
                };
                filteringState.strategy = grid.filterStrategy;
                gridData = DataUtil.filter(gridData, filteringState, grid);
            }

            if (hasSorting && !options.ignoreSorting) {
                // TODO: We should drop support for this since in a grouped grid it doesn't make sense
                // this._sort = !isGroupedGrid ?
                //     cloneValue(grid.sortingExpressions[0]) :
                //     grid.sortingExpressions.length > 1 ?
                //         cloneValue(grid.sortingExpressions[1]) :
                //         cloneValue(grid.sortingExpressions[0]);

                gridData = DataUtil.sort(gridData, grid.sortingExpressions, grid.sortStrategy, grid);
            }

            if (hasGrouping && !options.ignoreGrouping) {
                const groupsRecords = [];
                DataUtil.group(cloneArray(gridData), groupedGridGroupingState, grid, groupsRecords);
                gridData = groupsRecords;
            }

            if (hasGrouping && !options.ignoreGrouping) {
                this.addGroupedData(grid, gridData, groupedGridGroupingState);
            } else {
                this.addFlatData(gridData);
            }
        }
    }

    private prepareTreeGridData(grid: IgxTreeGridComponent, options: IgxExporterOptionsBase, hasFiltering: boolean, hasSorting: boolean) {
        const skipOperations =
            (!hasFiltering || !options.ignoreFiltering) &&
            (!hasSorting || !options.ignoreSorting);

        if (skipOperations) {
            this.addTreeGridData(grid.processedRootRecords);
        } else {
            let gridData = grid.rootRecords;

            if (hasFiltering && !options.ignoreFiltering) {
                const filteringState: IFilteringState = {
                    expressionsTree: grid.filteringExpressionsTree,
                    advancedExpressionsTree: grid.advancedFilteringExpressionsTree,
                };

                filteringState.strategy = (grid.filterStrategy) ? grid.filterStrategy : new TreeGridFilteringStrategy();

                gridData = filteringState.strategy
                    .filter(gridData, filteringState.expressionsTree, filteringState.advancedExpressionsTree);
            }

            if (hasSorting && !options.ignoreSorting) {
                this._sort = cloneValue(grid.sortingExpressions[0]);

                gridData = DataUtil.treeGridSort(gridData, grid.sortingExpressions, grid.sortStrategy);
            }

            this.addTreeGridData(gridData);
        }
    }

    private addTreeGridData(records: ITreeGridRecord[], parentExpanded: boolean = true) {
        if (!records) {
            return;
        }

        for (const record of records) {
            const hierarchicalRecord: IExportRecord = {
                data: record.data,
                level: record.level,
                hidden: !parentExpanded,
                type: ExportRecordType.TreeGridRecord
            };
            this.flatRecords.push(hierarchicalRecord);
            this.addTreeGridData(record.children, parentExpanded && record.expanded);
        }
    }

    private addFlatData(records: any) {
        if (!records) {
            return;
        }
        for (const record of records) {
            const data: IExportRecord = {
                data: record,
                type: ExportRecordType.DataRecord,
                level: 0
            };

            this.flatRecords.push(data);
        }
    }

    private addGroupedData(grid: IgxGridComponent, records: IGroupByRecord[],
        groupingState: IGroupingState, parentExpanded: boolean = true) {
        if (!records) {
            return;
        }

        const firstCol = this._columnList[0].field;

        for (const record of records) {
            let recordVal = record.value;

            const hierarchy = getHierarchy(record);
            const expandState: IGroupByExpandState = groupingState.expansion.find((s) =>
                isHierarchyMatch(s.hierarchy || [{ fieldName: record.expression.fieldName, value: recordVal }], hierarchy));
            const expanded = expandState ? expandState.expanded : groupingState.defaultExpanded;

            const isDate = recordVal instanceof Date;

            if (isDate) {
                const timeZoneOffset = recordVal.getTimezoneOffset() * 60000;
                const isoString = (new Date(recordVal - timeZoneOffset)).toISOString();
                const pipe = new DatePipe(grid.locale);
                recordVal = pipe.transform(isoString);
            }

            const groupExpressionName = record.column && record.column.header ?
                record.column.header :
                record.expression.fieldName;

            recordVal = recordVal !== null ? recordVal : '';

            const groupExpression: IExportRecord = {
                data: { [firstCol]: `${groupExpressionName}: ${recordVal} (${record.records.length})` },
                level: record.level,
                hidden: !parentExpanded,
                type: ExportRecordType.GroupedRecord,
            };

            this.flatRecords.push(groupExpression);

            if (record.groups.length > 0) {
                this.addGroupedData(grid, record.groups, groupingState, expanded && parentExpanded);
            } else {
                const rowRecords = record.records;

                for (const rowRecord of rowRecords) {
                    const currentRecord: IExportRecord = {
                        data: rowRecord,
                        level: record.level + 1,
                        hidden: !(expanded && parentExpanded),
                        type: ExportRecordType.DataRecord
                    };

                    this.flatRecords.push(currentRecord);
                }
            }
        }
    }

    private resetDefaults() {
        this._columnList = [];
        this._indexOfLastPinnedColumn = -1;
        this._sort = null;
        this.flatRecords = [];
    }

    protected abstract exportDataImplementation(data: any[], options: IgxExporterOptionsBase): void;
}
