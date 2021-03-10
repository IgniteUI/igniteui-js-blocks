import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { HammerGesturesManager } from '../../core/touch';
import { IgxGridExpandableCellComponent } from '../grid/expandable-cell.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-tree-grid-cell',
    templateUrl: 'tree-cell.component.html',
    providers: [HammerGesturesManager]
})
export class IgxTreeGridCellComponent extends IgxGridExpandableCellComponent {

    private get treeGridAPI(): IgxTreeGridAPIService {
        return this.gridAPI as IgxTreeGridAPIService;
    }

    /**
     * @hidden
     */
    @Input()
    public level = 0;

    /**
     * @hidden
     */
    @Input()
    public showIndicator = false;

    /**
     * @hidden
     */
    @Input()
    public isLoading: boolean;

    /**
     * @hidden
     */
    public toggle(event: Event) {
        event.stopPropagation();
        this.treeGridAPI.set_row_expansion_state(this.row.rowID, !this.row.expanded, event);
    }

    /**
     * @hidden
     */
    public onLoadingDblClick(event: Event) {
        event.stopPropagation();
    }
}
