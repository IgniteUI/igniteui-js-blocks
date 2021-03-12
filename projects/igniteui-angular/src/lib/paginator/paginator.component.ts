import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input, Output, NgModule, Optional, Inject, EventEmitter, HostBinding } from '@angular/core';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase, DisplayDensity } from '../core/displayDensity';
import { OverlaySettings } from '../services/public_api';
import { IgxSelectModule } from '../select/public_api';
import { IgxIconModule } from '../icon/public_api';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxInputGroupModule } from '../input-group/public_api';
import { IPaginatorResourceStrings } from '../core/i18n/paginator-resources';
import { DeprecateProperty } from '../core/deprecateDecorators';

@Component({
    selector: 'igx-paginator',
    templateUrl: 'paginator.component.html',
})
export class IgxPaginatorComponent extends DisplayDensityBase {
    /**
     * An @Input property that sets if the pager in the paginator should be enabled.
     * ```html
     * <igx-paginator [pagerEnabled]="true"></igx-paginator>
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    @Input()
    public pagerEnabled = true;

    /**
     * An @Input property that sets if the pager in the paginator should be hidden.
     * ```html
     * <igx-paginator [pagerHidden]="true"></igx-paginator>
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    @Input()
    public pagerHidden = false;

    /**
     * An @Input property that sets if the dropdown in the paginator should be enabled.
     * ```html
     * <igx-paginator [dropdownEnabled]="true"></igx-paginator>
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    @Input()
    public dropdownEnabled = true;

    /**
     * An @Input property that sets if the dropdown in the paginator should be hidden.
     * ```html
     * <igx-paginator [dropdownHidden]="true"></igx-paginator>
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    @Input()
    public dropdownHidden = false;

    /**
     * @deprecated Use 'resourceStrings' instead.
     * An @Input property, sets number of label of the select.
     * The default is 'Items per page' localized string.
     * ```html
     * <igx-paginator label="My custom label"></igx-paginator>
     * ```
     * @memberof IgxPaginatorComponent
     */
    @DeprecateProperty(`'selectLabel' property is deprecated. Use 'resourceStrings' instead.`)
    @Input()
    public selectLabel;

    /**
     * @deprecated Use 'resourceStrings' instead.
     * An @Input property, sets a preposition between the current page and total pages.
     * The default is 'of' localized string.
     * @memberof IgxPaginatorComponent
     */
    @DeprecateProperty(`'prepositionPage' property is deprecated. Use 'resourceStrings' instead.`)
    @Input()
    public prepositionPage;

    /**
     * Emitted when `perPage` property value of the paginator is changed.
     *
     * @example
     * ```html
     * <igx-paginator (perPageChange)="onPerPageChange($event)"></igx-paginator>
     * ```
     * ```typescript
     * public onPerPageChange(perPage: number) {
     *   this.perPage = perPage;
     * }
     * ```
     */
    @Output()
    public perPageChange = new EventEmitter<number>();

    /**
     * Emitted after the current page is changed.
     *
     * @example
     * ```html
     * <igx-paginator (pageChange)="onPageChange($event)"></igx-paginator>
     * ```
     * ```typescript
     * public onPageChange(page: number) {
     *   this.currentPage = page;
     * }
     * ```
     */
    @Output()
    public pageChange = new EventEmitter<number>();

    /**
     * Total pages calculated from totalRecords and perPage
     */
    public totalPages: number;

    protected _page = 0;
    protected _totalRecords: number;
    protected _selectOptions;
    protected _perPage = 15;

    private _resourceStrings = CurrentResourceStrings.PaginatorResStrings;
    private _overlaySettings: OverlaySettings = {};
    private defaultSelectValues = [5, 10, 15, 25, 50, 100, 500];

    /**
     * Sets the class of the IgxPaginatorComponent based
     * on the provided displayDensity.
     */
    @HostBinding('class.igx-paginator--cosy')
    public get classCosy(): boolean {
        return this.displayDensity === DisplayDensity.cosy;
    }

    @HostBinding('class.igx-paginator--compact')
    public get classCompact(): boolean {
        return this.displayDensity === DisplayDensity.compact;
    }

    @HostBinding('class.igx-paginator')
    public get classComfortable(): boolean {
        return this.displayDensity === DisplayDensity.comfortable;
    }

    /**
     * An @Input property, sets current page of the `IgxPaginatorComponent`.
     * The default is 0.
     * ```typescript
     * let page = this.paginator.page;
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    @Input()
    public get page() {
        return this._page;
    }

    public set page(value: number) {
        this._page = value;
        this.pageChange.emit(this._page);
    }

    /**
     * An @Input property, sets number of visible items per page in the `IgxPaginatorComponent`.
     * The default is 15.
     * ```typescript
     * let itemsPerPage = this.paginator.perPage;
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    @Input()
    public get perPage() {
        return this._perPage;
    }

    public set perPage(value: number) {
        this._perPage = Number(value);
        this.perPageChange.emit(this._perPage);
        this._selectOptions = this.sortUniqueOptions(this.defaultSelectValues, this._perPage);
        this.totalPages = Math.ceil(this.totalRecords / this._perPage);
        if (this.totalPages !== 0 && this.page >= this.totalPages) {
            this.page = this.totalPages - 1;
        }
    }

    /**
     * An @Input property that sets the total records.
     * ```typescript
     * let totalRecords = this.paginator.totalRecords;
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    @Input()
    public get totalRecords() {
        return this._totalRecords;
    }

    public set totalRecords(value: number) {
        this._totalRecords = value;
        this.totalPages = Math.ceil(this.totalRecords / this.perPage);
    }

    /**
     * An @Input property that sets custom options in the select of the paginator
     * ```typescript
     * let options = this.paginator.selectOptions;
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    @Input()
    public get selectOptions() {
        return this._selectOptions;
    }

    public set selectOptions(value: Array<number>) {
        this._selectOptions = this.sortUniqueOptions(value, this._perPage);
        this.defaultSelectValues = [...value];
    }

    /**
     * An @Input property that sets custom OverlaySettings.
     * ```html
     * <igx-paginator [overlaySettings] = "customOverlaySettings"></igx-paginator>
     * ```
     */
    @Input()
    public get overlaySettings(): OverlaySettings {
        return this._overlaySettings;
    }

    public set overlaySettings(value: OverlaySettings) {
        this._overlaySettings = Object.assign({}, this._overlaySettings, value);
    }

    /**
     * An accessor that sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IPaginatorResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * An accessor that returns the resource strings.
     */
    public get resourceStrings(): IPaginatorResourceStrings {
        return this._resourceStrings;
    }

    constructor(@Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions);
    }

    /**
     * Returns if the current page is the last page.
     * ```typescript
     * const lastPage = this.paginator.isLastPage;
     * ```
     */
    public get isLastPage(): boolean {
        return this.page + 1 >= this.totalPages;
    }

    /**
     * Returns if the current page is the first page.
     * ```typescript
     * const lastPage = this.paginator.isFirstPage;
     * ```
     */
    public get isFirstPage(): boolean {
        return this.page === 0;
    }


    /**
     * Returns if the first pager buttons should be disabled
     */
    public get isFirstPageDisabled(): boolean {
        return this.isFirstPage || !this.pagerEnabled;
    }

    /**
     * Returns if the last pager buttons should be disabled
     */
    public get isLastPageDisabled(): boolean {
        return this.isLastPage || !this.pagerEnabled;
    }

    /**
     * Sets DisplayDensity for the <select> inside the paginator
     *
     * @hidden
     */
    public paginatorSelectDisplayDensity(): string {
        if (this.displayDensity === DisplayDensity.comfortable) {
            return DisplayDensity.cosy;
        }
        return DisplayDensity.compact;
    }
    /**
     * Goes to the next page of the `IgxPaginatorComponent`, if the paginator is not already at the last page.
     * ```typescript
     * this.paginator.nextPage();
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    public nextPage(): void {
        if (!this.isLastPage) {
            this.page += 1;
        }
    }
    /**
     * Goes to the previous page of the `IgxPaginatorComponent`, if the paginator is not already at the first page.
     * ```typescript
     * this.paginator.previousPage();
     * ```
     *
     * @memberof IgxPaginatorComponent
     */
    public previousPage(): void {
        if (!this.isFirstPage) {
            this.page -= 1;
        }
    }
    /**
     * Goes to the desired page index.
     * ```typescript
     * this.paginator.paginate(1);
     * ```
     *
     * @param val
     * @memberof IgxPaginatorComponent
     */
    public paginate(val: number): void {
        if (val < 0 || val > this.totalPages - 1) {
            return;
        }
        this.page = val;
    }

    private sortUniqueOptions(values: Array<number>, newOption: number): number[] {
        return Array.from(new Set([...values, newOption])).sort((a, b) => a - b);
    }
}

@NgModule({
    declarations: [IgxPaginatorComponent],
    exports: [IgxPaginatorComponent],
    imports: [CommonModule, IgxSelectModule, FormsModule, IgxIconModule, IgxButtonModule, IgxRippleModule, IgxInputGroupModule]
})
export class IgxPaginatorModule { }
