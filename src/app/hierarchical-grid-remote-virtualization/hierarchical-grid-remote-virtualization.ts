import { Component, ViewChild, AfterViewInit, PipeTransform, Pipe, ChangeDetectorRef } from '@angular/core';
import {
    IgxRowIslandComponent,
    IgxHierarchicalGridComponent,
    IGridCreatedEventArgs,
    GridSelectionMode
} from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';
import { HierarchicalRemoteService } from './hierarchical-remote.service';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'app-hierarchical-grid-remote-virtualization-sample',
    templateUrl: 'hierarchical-grid-remote-virtualization.html',
    styleUrls: ['hierarchical-grid-remote-virtualization.scss'],
    providers: [RemoteService]
})
export class HierarchicalGridRemoteVirtualizationComponent implements AfterViewInit {
    @ViewChild('rowIsland1', { static: true })
    rowIsland1: IgxRowIslandComponent;

    @ViewChild('hGrid', { static: true })
    hGrid: IgxHierarchicalGridComponent;

    public selectionMode;
    remoteData = [];
    gridData = [];
    totalCount: number;

    public isExpanding = false;

    constructor(private remoteService: HierarchicalRemoteService, private cdr: ChangeDetectorRef) {
        remoteService.url = 'https://services.odata.org/V4/Northwind/Northwind.svc/Customers?$expand=Orders';
    }

    public handleLoad(args) {
        this.remoteService.getData(args, this.hGrid, (data) => {
            this.gridData = data;
            this.cdr.detectChanges();
        });
    }

    public ngAfterViewInit() {
        // load initial data
        this.handleLoad(this.hGrid.virtualizationState);

        // update when row is expanded/collapsed
        this.hGrid.expansionStatesChange.subscribe(x => {
            this.handleLoad(this.hGrid.virtualizationState);
        });

        // update on scroll
        this.hGrid.onDataPreLoad.pipe().subscribe(() => {
            const data = this.remoteService.getDataFromCache(this.hGrid.virtualizationState);
            if (data) {
                this.gridData = data;
            }
        });

        // handle remote request after user stops scrolling for 500ms
        this.hGrid.onDataPreLoad.pipe(debounceTime(500)).subscribe((event) => {
            this.handleLoad(event);
        });
    }
}
