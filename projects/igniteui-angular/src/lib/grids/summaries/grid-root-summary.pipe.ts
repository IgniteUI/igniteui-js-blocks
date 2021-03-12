import { Pipe, PipeTransform } from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { GridType } from '../common/grid.interface';

@Pipe({
    name: 'igxGridSummaryDataPipe',
    pure: true
})
export class IgxSummaryDataPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public transform(id: string, trigger: number = 0) {
        const summaryService = this.gridAPI.grid.summaryService;
        return summaryService.calculateSummaries(
            summaryService.rootSummaryID,
            this.gridAPI.get_summary_data()
        );
    }
}
