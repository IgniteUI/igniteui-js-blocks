import {
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Optional
} from '@angular/core';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase } from '../../core/displayDensity';
import { IgxIconService } from '../../icon/public_api';
import { pinLeft, unpinLeft } from '@igniteui/material-icons-extended';
import { IgxGridToolbarTitleDirective, IgxGridToolbarActionsDirective } from './common';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { GridType } from '../common/grid.interface';


/**
 * Provides a context-aware container component for UI operations for the grid components.
 *
 * @igxModule IgxGridToolbarModule
 *
 */
@Component({
    selector: 'igx-grid-toolbar',
    templateUrl: './grid-toolbar.component.html'
})
export class IgxGridToolbarComponent extends DisplayDensityBase implements OnInit, OnDestroy {

    /**
     * When enabled, shows the indeterminate progress bar.
     *
     * @remarks
     * By default this will be toggled, when the default exporter component is present
     * and an exporting is in progress.
     */
    @Input()
    public showProgress = false;

    /**
     * Gets/sets the grid component for the toolbar component.
     *
     * @remarks
     * Usually you should not set this property in the context of the default grid/tree grid.
     * The only grids that demands this to be set are the hierarchical child grids. For additional
     * information check the toolbar topic.
     */
    @Input()
    public get grid() {
        if (this._grid) {
            return this._grid;
        }
        return this.api.grid;
    }

    public set grid(value: IgxGridBaseDirective) {
        this._grid = value;
    }

    /** Returns the native DOM element of the toolbar component */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /**
     * @hidden
     * @internal
     */
    @ContentChild(IgxGridToolbarTitleDirective)
    public hasTitle: IgxGridToolbarTitleDirective;

    /**
     * @hidden
     * @internal
     */
    @ContentChild(IgxGridToolbarActionsDirective)
    public hasActions: IgxGridToolbarActionsDirective;

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid-toolbar')
    public defaultStyle = true;

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid-toolbar--cosy')
    public get cosyStyle() {
        return this.displayDensity === 'cosy';
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid-toolbar--compact')
    public get compactStyle() {
        return this.displayDensity === 'compact';
    }

    /** @hidden @internal */
    @HostBinding('style.max-width.px')
    @HostBinding('style.flex-basis.px')
    public width = null;

    protected _grid: IgxGridBaseDirective;
    protected sub: Subscription;

    constructor(
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        private api: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        private iconService: IgxIconService,
        private element: ElementRef<HTMLElement>
    ) {
        super(_displayDensityOptions);
        this.iconService.addSvgIconFromText(pinLeft.name, pinLeft.value, 'imx-icons');
        this.iconService.addSvgIconFromText(unpinLeft.name, unpinLeft.value, 'imx-icons');
    }

    /** @hidden @internal */
    public ngOnInit() {
        this.grid.rendered$.pipe(first()).subscribe(() => this.width = this.grid.outerWidth);
        this.sub = this.grid.resizeNotify.subscribe(() => this.width = this.grid.outerWidth);
    }

    /** @hidden @internal */
    public ngOnDestroy() {
        this.sub?.unsubscribe();
    }
}
