import { Component, ViewChild, OnInit } from '@angular/core';
import { SampleTestData } from './sample-test-data.spec';
import { IgxColumnComponent } from '../grids/public_api';
import { IgxHierarchicalTransactionServiceFactory } from '../grids/hierarchical-grid/hierarchical-grid-base.directive';
import { IgxHierarchicalGridComponent } from '../grids/hierarchical-grid/hierarchical-grid.component';
import { IgxRowIslandComponent } from '../grids/hierarchical-grid/row-island.component';
import { IPinningConfig } from '../grids/grid.common';
import { ColumnPinningPosition, RowPinningPosition } from '../grids/common/enums';
import { IgxActionStripComponent } from '../action-strip/public_api';


@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [allowFiltering]="true" [rowEditable]="true" [pinning]='pinningConfig'
     [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'">
        <igx-column field="ID" [groupable]='true' [movable]='true'></igx-column>
        <igx-column-group header="Information">
                <igx-column field="ChildLevels" [groupable]='true' [sortable]='true' [editable]="true" [movable]='true'></igx-column>
                <igx-column field="ProductName" [groupable]='true' [hasSummary]='true' [movable]='true'></igx-column>
        </igx-column-group>
        <igx-row-island [key]="'childData'" #rowIsland [allowFiltering]="true" [rowEditable]="true" [primaryKey]="'ID'">
            <igx-grid-toolbar [grid]="grid" *igxGridToolbar="let grid"></igx-grid-toolbar>
            <igx-column field="ID" [groupable]='true' [hasSummary]='true' [movable]='true'>
                <ng-template igxHeader let-columnRef="column">
                    <div>
                        <span>ID</span>
                        <igx-icon (click)="pinColumn(columnRef)">lock</igx-icon>
                    </div>
                </ng-template>
            </igx-column>
            <igx-column-group header="Information">
                    <igx-column field="ChildLevels" [groupable]='true' [sortable]='true' [editable]="true"></igx-column>
                    <igx-column field="ProductName" [groupable]='true'></igx-column>
            </igx-column-group>
            <igx-row-island [key]="'childData'" #rowIsland2 >
                <igx-column field="ID" [groupable]='true' ></igx-column>
                <igx-column-group header="Information">
                        <igx-column field="ChildLevels" [groupable]='true' [sortable]='true' [editable]="true"></igx-column>
                        <igx-column field="ProductName" [groupable]='true' [hasSummary]='true'></igx-column>
                </igx-column-group>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    providers: [IgxHierarchicalTransactionServiceFactory]
})
export class IgxHierarchicalGridTestBaseComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true })
    public hgrid: IgxHierarchicalGridComponent;

    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true })
    public rowIsland: IgxRowIslandComponent;

    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true })
    public rowIsland2: IgxRowIslandComponent;

    public data;
    public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Top };

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(40, 3);
    }

    public pinColumn(column: IgxColumnComponent) {
        if (column.pinned) {
            column.unpin();
        } else {
            column.pin();
        }
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'"
        [rowSelection]="'multiple'" [selectedRows]="selectedRows">
        <igx-column field="ID" ></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ID"> </igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" #rowIsland2 [primaryKey]="'ID'" [rowSelection]="'none'">
                <igx-column field="ID"></igx-column>
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    providers: [IgxHierarchicalTransactionServiceFactory]
})
export class IgxHierarchicalGridRowSelectionComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    public data;
    public selectedRows = [];

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(5, 3);
    }
}
@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'"
        [rowSelection]="'multiple'" [selectedRows]="selectedRows" [selectRowOnClick]="false">
        <igx-column field="ID" ></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ID"> </igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" #rowIsland2 [primaryKey]="'ID'" [rowSelection]="'none'">
                <igx-column field="ID"></igx-column>
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    providers: [IgxHierarchicalTransactionServiceFactory]
})
export class IgxHierarchicalGridRowSelectionTestSelectRowOnClickComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    public data;
    public selectedRows = [];

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(5, 3);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'"
        [rowSelection]="'multiple'">
        <igx-column field="ID" ></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'" [rowSelection]="'multiple'">
            <igx-column field="ID"> </igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" #rowIsland2 [primaryKey]="'ID'" [rowSelection]="'multiple'">
                <igx-column field="ID"></igx-column>
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
})
export class IgxHierarchicalGridRowSelectionNoTransactionsComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    public data;

    constructor() {
        // 3 level hierarchy
        this.data = SampleTestData.generateHGridData(5, 3);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid [paging]="true" [data]="data" [cellSelection]="false" [height]="'600px'"
        [width]="'700px'" #hGridCustomSelectors [primaryKey]="'ID'"
        [rowSelection]="'multiple'">
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland1 [paging]="true" [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <ng-template igxHeadSelector let-headContext>
                <igx-checkbox [readonly]="true" (click)="handleHeadSelectorClick(headContext)"
                    [checked]="headContext.selectedCount === headContext.totalCount"
                    [indeterminate]="headContext.selectedCount !== headContext.totalCount && headContext.selectedCount !== 0">
                </igx-checkbox>
            </ng-template>
            <ng-template igxRowSelector let-rowContext>
                <span class="rowNumberChild">{{ rowContext.index }}</span>
                <igx-checkbox (click)="handleRowSelectorClick(rowContext)" [checked]="rowContext.selected">
                </igx-checkbox>
            </ng-template>
        </igx-row-island>
        <ng-template igxHeadSelector let-headContext>
            <igx-checkbox [readonly]="true" (click)="handleHeadSelectorClick(headContext)"
                [checked]="headContext.selectedCount === headContext.totalCount"
                [indeterminate]="headContext.selectedCount !== headContext.totalCount && headContext.selectedCount !== 0">
            </igx-checkbox>
        </ng-template>
        <ng-template igxRowSelector let-rowContext>
            <span class="rowNumber">{{ rowContext.index }}</span>
            <igx-checkbox [readonly]="true" (click)="handleRowSelectorClick(rowContext)" [checked]="rowContext.selected">
            </igx-checkbox>
        </ng-template>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridCustomSelectorsComponent implements OnInit {
    @ViewChild('hGridCustomSelectors', { read: IgxHierarchicalGridComponent, static: true })
    public hGrid: IgxHierarchicalGridComponent;

    @ViewChild('rowIsland1', { read: IgxRowIslandComponent, static: true })
    public firstLevelChild: IgxRowIslandComponent;

    public data = [];

    public ngOnInit(): void {
        // 2 level hierarchy
        this.data = SampleTestData.generateHGridData(40, 2);
    }

    public handleHeadSelectorClick(headContext) {
        if (headContext.totalCount !== headContext.selectedCount) {
            headContext.selectAll();
        } else {
            headContext.deselectAll();
        }
    }

    public handleRowSelectorClick(rowContext) {
        if (rowContext.selected) {
            rowContext.deselect();
        } else {
            rowContext.select();
        }
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid
        [primaryKey]="'ID'" [showToolbar]="true" [autoGenerate]="true">
        <igx-grid-toolbar>
            <button igxButton="raised">Parent Button</button>
        </igx-grid-toolbar>
        <igx-row-island [key]="'childData1'" #rowIsland1 [primaryKey]="'ID'" [showToolbar]="true" [autoGenerate]="true">
            <igx-grid-toolbar *igxGridToolbar="let grid" [grid]="grid">
                <button igxButton="raised">Child 1 Button</button>
            </igx-grid-toolbar>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" #rowIsland2 [primaryKey]="'ID'" [showToolbar]="true" [autoGenerate]="true">
        <igx-grid-toolbar *igxGridToolbar="let grid" [grid]="grid">
                <button igxButton="raised">Child2 Button</button>
            </igx-grid-toolbar>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridTestCustomToolbarComponent extends IgxHierarchicalGridTestBaseComponent { }

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'600px'" [width]="'700px'" #hierarchicalGrid
        [primaryKey]="'ID'" [showToolbar]="true" [autoGenerate]="true" [rowEditable]='true'>
        <igx-action-strip #actionStrip1>
            <igx-grid-pinning-actions></igx-grid-pinning-actions>
            <igx-grid-editing-actions></igx-grid-editing-actions>
        </igx-action-strip>
        <igx-row-island [key]="'childData1'" #rowIsland1 [primaryKey]="'ID'" [showToolbar]="true" [autoGenerate]="true">
        </igx-row-island>
        <igx-row-island [key]="'childData2'" #rowIsland2 [primaryKey]="'ID'" [showToolbar]="true" [autoGenerate]="true">
            <igx-action-strip #actionStrip2>
                <igx-grid-pinning-actions></igx-grid-pinning-actions>
                <igx-grid-editing-actions [asMenuItems]='true'></igx-grid-editing-actions>
            </igx-action-strip>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridActionStripComponent extends IgxHierarchicalGridTestBaseComponent {
    @ViewChild('actionStrip1', { read: IgxActionStripComponent, static: true })
    public actionStripRoot: IgxActionStripComponent;

    @ViewChild('actionStrip2', { read: IgxActionStripComponent, static: true })
    public actionStripChild: IgxActionStripComponent;
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [height]="'300px'" [width]="'700px'" #hierarchicalGrid [primaryKey]="'ID'">
        <igx-column field="ID" ></igx-column>
        <igx-column field="ChildLevels"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" #rowIsland [primaryKey]="'ID'" [rowSelection]="'single'">
            <igx-column field="ID"> </igx-column>
            <igx-column field="ChildLevels"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" #rowIsland2 [primaryKey]="'ID'" [rowSelection]="'none'">
                <igx-column field="ID"></igx-column>
                <igx-column field="ChildLevels"></igx-column>
                <igx-column field="ProductName"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>
    <igx-advanced-filtering-dialog [grid]="grid1">
    </igx-advanced-filtering-dialog>`
})
export class IgxHierGridExternalAdvancedFilteringComponent extends IgxHierarchicalGridTestBaseComponent {
    // @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true })
    // public hgrid: IgxHierarchicalGridComponent;

    public data = SampleTestData.generateHGridData(5, 3);
}
