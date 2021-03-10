import { Component, Input } from '@angular/core';
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';

/**
 * A component used for presenting Excel style header UI.
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-excel-style-header',
    templateUrl: './excel-style-header.component.html'
})
export class IgxExcelStyleHeaderComponent {
    /**
     * Sets whether the column pinning icon should be shown in the header.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-excel-style-header [showPinning]="true"></igx-excel-style-header>
     * ```
     */
    @Input()
    public showPinning: boolean;

    /**
     * Sets whether the column selecting icon should be shown in the header.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-excel-style-header [showSelecting]="true"></igx-excel-style-header>
     * ```
     */
    @Input()
    public showSelecting: boolean;

    /**
     * Sets whether the column hiding icon should be shown in the header.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-excel-style-header [showHiding]="true"></igx-excel-style-header>
     * ```
     */
    @Input()
    public showHiding: boolean;

    constructor(public esf: IgxGridExcelStyleFilteringComponent) { }
}
