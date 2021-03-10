
import { mkenum } from '../../core/utils';
export const FilterMode = mkenum({
    quickFilter: 'quickFilter',
    excelStyleFilter: 'excelStyleFilter'
});
export type FilterMode = (typeof FilterMode)[keyof typeof FilterMode];

export const GridSummaryPosition = mkenum({
    top: 'top',
    bottom: 'bottom'
});
export type GridSummaryPosition = (typeof GridSummaryPosition)[keyof typeof GridSummaryPosition];

export const GridSummaryCalculationMode = mkenum({
    rootLevelOnly: 'rootLevelOnly',
    childLevelsOnly: 'childLevelsOnly',
    rootAndChildLevels: 'rootAndChildLevels'
});
export type GridSummaryCalculationMode = (typeof GridSummaryCalculationMode)[keyof typeof GridSummaryCalculationMode];

export type GridKeydownTargetType =
    'dataCell' |
    'summaryCell' |
    'groupRow' |
    'hierarchicalRow' |
    'headerCell' |
    'masterDetailRow';

export const GridSelectionMode = mkenum({
    none: 'none',
    single: 'single',
    multiple: 'multiple',
    multipleCascade: 'multipleCascade'
});
export type GridSelectionMode = (typeof GridSelectionMode)[keyof typeof GridSelectionMode];

export const ColumnDisplayOrder = mkenum({
    Alphabetical: 'Alphabetical',
    DisplayOrder: 'DisplayOrder'
});
export type ColumnDisplayOrder = (typeof ColumnDisplayOrder)[keyof typeof ColumnDisplayOrder];

export enum ColumnPinningPosition {
    Start,
    End
}

export enum RowPinningPosition {
    Top,
    Bottom
}

export enum GridPagingMode {
    Local,
    Remote
}
