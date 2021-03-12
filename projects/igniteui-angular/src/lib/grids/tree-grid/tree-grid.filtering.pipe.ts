import { Pipe, PipeTransform } from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringState } from '../../data-operations/filtering-state.interface';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { IgxGridBaseDirective } from '../grid/public_api';
import { GridType } from '../common/grid.interface';
import { TreeGridFilteringStrategy } from './tree-grid.filtering.strategy';

/** @hidden */
@Pipe({
    name: 'treeGridFiltering',
    pure: true
})
export class IgxTreeGridFilteringPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) {
        this.gridAPI = gridAPI as IgxTreeGridAPIService;
     }

    public transform(hierarchyData: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        filterStrategy: IFilteringStrategy,
        advancedFilteringExpressionsTree: IFilteringExpressionsTree,
        _: number, __: number, pinned?): ITreeGridRecord[] {
        const grid: IgxTreeGridComponent = this.gridAPI.grid;
        const state: IFilteringState = {
            expressionsTree,
            advancedExpressionsTree: advancedFilteringExpressionsTree,
            strategy: new TreeGridFilteringStrategy()
        };

        if (filterStrategy) {
            state.strategy = filterStrategy;
        }

        if (FilteringExpressionsTree.empty(state.expressionsTree) && FilteringExpressionsTree.empty(state.advancedExpressionsTree)) {
            grid.setFilteredData(null, pinned);
            return hierarchyData;
        }

        const result = this.filter(hierarchyData, state, grid);
        const filteredData: any[] = [];
        this.expandAllRecursive(grid, result, grid.expansionStates, filteredData);
        grid.setFilteredData(filteredData, pinned);

        return result;
    }

    private expandAllRecursive(grid: IgxTreeGridComponent, data: ITreeGridRecord[],
        expandedStates: Map<any, boolean>, filteredData: any[]) {
        for (const rec of data) {
            filteredData.push(rec.data);

            if (rec.children && rec.children.length > 0) {
                expandedStates.set(rec.rowID, true);
                this.expandAllRecursive(grid, rec.children, expandedStates, filteredData);
            }
        }
    }

    private filter(data: ITreeGridRecord[], state: IFilteringState, grid?: GridType): ITreeGridRecord[] {
        return state.strategy.filter(data, state.expressionsTree, state.advancedExpressionsTree, grid);
    }
}
